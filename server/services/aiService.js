import { GoogleGenerativeAI } from '@google/generative-ai';

const AGRICULTURE_SYSTEM_PROMPT = `You are Dr. AgroBot, a senior-most agriculture scientist with 40+ years of research and field experience across agronomy, soil science, plant pathology, entomology, horticulture, and sustainable farming. You have worked with ICAR, FAO, and leading agricultural universities worldwide.

Your role:
- Answer ALL agriculture-related questions with expert, detailed, practical advice
- Cover topics like crop management, soil health, irrigation, fertilizers, pest/disease control, organic farming, post-harvest handling, weather impact, market trends, and sustainable practices
- Provide actionable recommendations that farmers can immediately apply
- Use simple language that farmers can understand, but include scientific reasoning when helpful
- If the question is NOT related to agriculture/farming, politely redirect the user back to agriculture topics
- Always be helpful, encouraging, and supportive of farmers

Format your responses clearly with short paragraphs. Use bullet points for lists. Keep responses concise but thorough.`;

export async function chatWithGemini(userMessage, conversationHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Build the chat contents for Gemini
  const contents = [];

  // Add conversation history
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }

  // Add the new user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  if (apiKey && apiKey.trim() !== '' && !apiKey.startsWith('AQ.')) {
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    for (const modelName of modelsToTry) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: AGRICULTURE_SYSTEM_PROMPT
        });

        const chat = model.startChat({
          history: contents.slice(0, -1),
        });

        const result = await chat.sendMessage(userMessage);
        const responseText = result.response.text();

        if (responseText && responseText.trim()) {
          return { reply: responseText.trim(), model: modelName };
        }
      } catch (err) {
        console.warn(`[AI Chat] Model ${modelName} error:`, err.message);
      }
    }
  }

  // Fallback response
  return {
    reply: getFallbackChatReply(userMessage),
    model: 'fallback'
  };
}

function getFallbackChatReply(question) {
  const q = question.toLowerCase();

  if (q.includes('fertilizer') || q.includes('npk') || q.includes('nutrient')) {
    return `Great question about fertilizers! Here's my advice:\n\n• For most cereal crops (wheat, rice, maize), a balanced NPK ratio of 4:2:1 works well\n• Apply nitrogen in split doses — 50% as basal, 25% at tillering, 25% at panicle initiation\n• Always supplement with organic manure (FYM at 10 tonnes/ha or vermicompost at 5 tonnes/ha)\n• Get your soil tested every season to fine-tune the dosage\n• Consider foliar sprays of micronutrients (Zinc, Boron) during critical growth stages\n\nWould you like specific fertilizer recommendations for a particular crop?`;
  }

  if (q.includes('pest') || q.includes('insect') || q.includes('disease') || q.includes('fungus')) {
    return `Pest and disease management is crucial! Here's my integrated approach:\n\n• **Prevention first**: Use resistant varieties, practice crop rotation, and maintain field hygiene\n• **Biological control**: Encourage natural predators — Trichogramma cards for borers, ladybugs for aphids\n• **Organic sprays**: Neem oil (5ml/L), Pseudomonas fluorescens for fungal diseases\n• **Chemical control (last resort)**: Use targeted pesticides at recommended doses, follow the waiting period before harvest\n• **Monitoring**: Install pheromone traps and yellow sticky traps for early detection\n\nTell me which crop and pest you're dealing with for specific advice!`;
  }

  if (q.includes('irrigation') || q.includes('water') || q.includes('drip')) {
    return `Smart irrigation can save 30-50% water! Here's what I recommend:\n\n• **Drip irrigation**: Best for vegetables, fruits, and row crops — delivers water directly to roots\n• **Critical stages**: Never skip irrigation during flowering and grain filling stages\n• **Timing**: Early morning (6-8 AM) is ideal to minimize evaporation\n• **Soil moisture**: Irrigate when soil moisture drops below 50% of field capacity\n• **Mulching**: Apply 5-7 cm organic mulch to reduce evaporation by 25-30%\n\nWhat crop are you growing? I can give you a tailored irrigation schedule!`;
  }

  return `Thank you for your question! As a senior agriculture scientist, I'd be happy to help.\n\nHere are some general recommendations:\n\n• **Soil Health**: Regular soil testing and organic matter addition is the foundation of good farming\n• **Crop Selection**: Choose varieties suited to your local climate and soil type\n• **Water Management**: Adopt micro-irrigation (drip/sprinkler) for efficient water use\n• **Integrated Pest Management**: Combine biological, cultural, and chemical methods\n• **Post-Harvest**: Proper drying and storage can reduce losses by 15-20%\n\nPlease ask me specific questions about your crops, soil, pests, or any farming challenge — I'm here to help! 🌱`;
}

export async function generateCropRecommendation({ crop, location, soil_type, crop_stage, weather }) {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `
Act as an experienced agricultural expert and agronomist.
Analyze the following farm parameters:
- Crop: ${crop}
- Location: ${location}
- Soil Type: ${soil_type}
- Crop Growth Stage: ${crop_stage}
- Current Weather Context: ${JSON.stringify(weather || { condition: 'Sunny', temp: '28°C', humidity: '65%' })}

Return ONLY a valid JSON object matching this exact structure with detailed, actionable recommendations:
{
  "irrigation": "Specific water requirement and schedule tailored to ${crop} in ${soil_type} soil at ${crop_stage} stage.",
  "fertilizer": "NPK dosage, organic options, and application timing for current stage.",
  "harvest": "Estimated timeline, ideal maturity indicators, and post-harvest handling advice.",
  "pest_control": "Preventative steps, biological controls, and chemical measures for common pests affecting ${crop}.",
  "tips": [
    "Sustainability tip 1",
    "Sustainability tip 2",
    "Water conservation tip",
    "Soil health improvement tip"
  ]
}
Do not include markdown code block markers or extra conversational text outside the raw JSON object.
`;

  if (apiKey && apiKey.trim() !== '' && !apiKey.startsWith('AQ.')) {
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
    for (const modelName of modelsToTry) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON string from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.irrigation && parsed.fertilizer) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`[AI Service] Model ${modelName} call notice:`, err.message);
      }
    }
  }

  // Smart fallback agronomy engine guaranteeing valid output for any crop/location
  return generateFallbackRecommendation(crop, location, soil_type, crop_stage, weather);
}

function generateFallbackRecommendation(crop, location, soil_type, crop_stage, weather) {
  const cropLower = (crop || 'Crop').toLowerCase();
  const stageLower = (crop_stage || 'Growth').toLowerCase();
  const soilLower = (soil_type || 'Loamy').toLowerCase();

  let irrigation = `Apply 25-30 mm of water every 3 to 4 days during early morning hours. ${soilLower.includes('clay') ? 'Clay soil retains moisture well—avoid over-irrigation to prevent root rot.' : 'Sandy/Loamy soil requires split applications to prevent nutrient leaching.'}`;
  let fertilizer = `Apply balanced NPK (10-26-26) at 45 kg/acre. Supplement with organic vermicompost (200 kg/acre) to enrich soil microbiota during the ${crop_stage} stage.`;
  let harvest = `Harvest in approximately 25-35 days when lower leaves begin yellowing and moisture content stabilizes below 18%. Store immediately in dry cold storage at 4°C-8°C.`;
  let pest_control = `Monitor for aphid and stem borer activity. Apply neem oil solution (5ml/L water) as an organic preventive spray every 10 days.`;

  if (cropLower.includes('rice') || cropLower.includes('paddy')) {
    irrigation = `Maintain 3-5 cm standing water layer during tillering; drain 10 days prior to harvest to ensure uniform ripening.`;
    fertilizer = `Split application: Apply Urea in 3 equal doses (basal, active tillering, and panicle initiation stage).`;
    pest_control = `Watch for leaf folder and blast disease. Deploy light traps and spray Tricyclazole if lesions appear.`;
  } else if (cropLower.includes('wheat')) {
    irrigation = `Critical irrigation stages: Crown Root Initiation (21 days post sowing) and Flowering stage. Provide light evening irrigation.`;
    fertilizer = `Apply 120 kg N, 60 kg P2O5, and 40 kg K2O per hectare with Zinc Sulphate.`;
    pest_control = `Watch for yellow rust. Spray Propiconazole 25% EC at first sign of infestation.`;
  } else if (cropLower.includes('cotton')) {
    pest_control = `High risk of pink bollworm. Install pheromone traps (4-5 per acre) and spray Spinosad if threshold exceeds 8 moths/trap/night.`;
  } else if (cropLower.includes('tomato')) {
    irrigation = `Drip irrigate 2-3 liters per plant daily. Avoid overhead wetting to prevent early blight fungal spores.`;
    fertilizer = `Apply Calcium Nitrate (5g/L) to prevent blossom end rot during fruiting.`;
    pest_control = `Watch for whiteflies and leaf miners. Install yellow sticky traps and spray Imidacloprid if needed.`;
  }

  return {
    irrigation,
    fertilizer,
    harvest,
    pest_control,
    tips: [
      `Implement drip irrigation to reduce overall water consumption by up to 45% in ${location}.`,
      `Practice crop rotation with pulse legumes (e.g. chickpea/mung) to naturally fix atmospheric nitrogen into ${soil_type} soil.`,
      `Book shared machinery (Rotavator / Harvester) early via EcoHub Marketplace to cut diesel fuel emissions.`,
      `Store harvested yield in climate-controlled cold storage to avoid post-harvest spoilage loss.`
    ]
  };
}
