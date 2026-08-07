import { GoogleGenerativeAI } from '@google/generative-ai';

const BASE_SYSTEM_PROMPT = `You are Dr. AgroBot, a friendly senior agriculture scientist with 40+ years of field experience.

IMPORTANT RULES:
- Keep answers SHORT — maximum 3-5 bullet points or 2-3 short paragraphs
- Use SIMPLE, everyday language that any farmer can understand — avoid scientific jargon
- Give PRACTICAL, actionable advice the farmer can use TODAY
- Be SPECIFIC to the question asked — never give generic answers
- If the farmer has crop/farm data available, reference it directly
- If the question is NOT about agriculture, politely say you only help with farming topics
- Each answer must be UNIQUE — never repeat the same response

Format: Use short bullet points (•) for lists. No long paragraphs. Think of it like giving quick advice to a farmer standing in their field.`;


function buildSystemPrompt(userContext = {}) {
  let prompt = BASE_SYSTEM_PROMPT;

  // Add user's farm data
  if (userContext.farms && userContext.farms.length > 0) {
    prompt += `\n\n--- FARMER'S CURRENT FARM DATA ---`;
    userContext.farms.forEach((farm, i) => {
      prompt += `\nFarm ${i + 1}: Crop: ${farm.crop || 'N/A'}, Location: ${farm.location || 'N/A'}, Soil Type: ${farm.soil_type || 'N/A'}, Growth Stage: ${farm.crop_stage || 'N/A'}, Size: ${farm.size_acres || 'N/A'} acres`;
    });
  }

  // Add upcoming calendar events
  if (userContext.upcomingEvents && userContext.upcomingEvents.length > 0) {
    prompt += `\n\n--- FARMER'S UPCOMING SMART CALENDAR TASKS ---`;
    userContext.upcomingEvents.forEach(ev => {
      prompt += `\n- ${ev.date}: ${ev.title} (Type: ${ev.type || 'General'}, Status: ${ev.status || 'pending'})${ev.description ? ' — ' + ev.description.substring(0, 150) : ''}`;
    });
  }

  // Add recent AI recommendations
  if (userContext.recentRecommendations && userContext.recentRecommendations.length > 0) {
    prompt += `\n\n--- RECENT AI RECOMMENDATIONS GIVEN TO THIS FARMER ---`;
    userContext.recentRecommendations.forEach(rec => {
      const ai = rec.ai_response || {};
      prompt += `\nCrop: ${rec.crop || 'N/A'} | Location: ${rec.location || 'N/A'} | Stage: ${rec.crop_stage || 'N/A'}`;
      if (ai.irrigation) prompt += `\n  Irrigation: ${ai.irrigation.substring(0, 120)}`;
      if (ai.fertilizer) prompt += `\n  Fertilizer: ${ai.fertilizer.substring(0, 120)}`;
      if (ai.pest_control) prompt += `\n  Pest Control: ${ai.pest_control.substring(0, 120)}`;
    });
  }

  // Add recent notifications
  if (userContext.recentNotifications && userContext.recentNotifications.length > 0) {
    prompt += `\n\n--- RECENT NOTIFICATIONS ---`;
    userContext.recentNotifications.forEach(n => {
      prompt += `\n- ${n.title}: ${n.message}`;
    });
  }

  prompt += `\n\nUse the above farmer data to give personalized, context-aware answers. If the farmer asks about their crops or schedule, reference this data directly.`;

  return prompt;
}

export async function chatWithGemini(userMessage, conversationHistory = [], userContext = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Build dynamic system prompt with user's real data
  const systemPrompt = buildSystemPrompt(userContext);

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

  if (apiKey && apiKey.trim() !== '') {
    // Use lightest model first for maximum free-tier quota
    const modelsToTry = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];
    let quotaExhausted = false;
    
    console.log(`[AI Chat] Using API key starting with: ${apiKey.substring(0, 6)}...`);

    for (const modelName of modelsToTry) {
      // Retry up to 2 times for rate limit (429) errors
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt
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
          const errMsg = err.message || '';
          console.warn(`[AI Chat] Model ${modelName} (attempt ${attempt + 1}) error:`, errMsg.substring(0, 200));

          // If rate limited, wait and retry
          if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('exceeded')) {
            quotaExhausted = true;
            if (attempt === 0) {
              console.log(`[AI Chat] Rate limited on ${modelName}, waiting 5s before retry...`);
              await new Promise(resolve => setTimeout(resolve, 5000));
              continue;
            }
          }
          // For 404 (model not found), skip to next model immediately
          if (errMsg.includes('404') || errMsg.includes('not found')) {
            break;
          }
          break;
        }
      }
    }

    // If all Gemini API models failed due to quota limit, seamlessly fall back to the local Agronomist AI engine
    if (quotaExhausted) {
      console.log('[AI Chat] Gemini API quota limit reached. Using Smart Offline Agronomist Engine...');
      return {
        reply: getFallbackChatReply(userMessage),
        model: 'smart_agronomist_engine'
      };
    }
  }

  // Fallback response (API key missing or invalid)
  return {
    reply: getFallbackChatReply(userMessage),
    model: 'smart_agronomist_engine'
  };
}

function getFallbackChatReply(question) {
  const q = question.toLowerCase();

  // Wheat specific
  if (q.includes('wheat')) {
    if (q.includes('fertilizer') || q.includes('npk')) {
      return `For wheat, here's a simple fertilizer plan:\n\n• Apply 120 kg Nitrogen, 60 kg Phosphorus, 40 kg Potash per hectare\n• Give half the nitrogen at sowing, rest at first irrigation\n• Add 25 kg Zinc Sulphate per hectare at sowing\n• Use DAP or SSP as base fertilizer\n\nThis works best in loamy soil. Adjust based on your soil test! 🌾`;
    }
    if (q.includes('irrigation') || q.includes('water')) {
      return `Wheat needs 4-6 irrigations:\n\n• 1st: Crown root stage (21 days after sowing) — most critical!\n• 2nd: Tillering stage (40-45 days)\n• 3rd: Jointing stage (60-65 days)\n• 4th: Flowering (80-85 days)\n• 5th: Grain filling (100-105 days)\n\nSkip the crown root irrigation and you could lose 20-25% yield. Water early morning for best results! 💧`;
    }
    return `Here's my quick wheat advice:\n\n• Best sowing time: November (depends on your region)\n• Use HD-2967 or PBW-343 varieties — they're reliable\n• Seed rate: 100 kg/hectare, sow 5-6 cm deep\n• Watch for yellow rust — spray Propiconazole at first signs\n• Harvest when grains are hard and golden, moisture below 14%\n\nWhat specific help do you need with your wheat crop? 🌾`;
  }

  // Rice / Paddy
  if (q.includes('rice') || q.includes('paddy')) {
    if (q.includes('blast') || q.includes('disease')) {
      return `Rice blast is a serious fungal disease. Here's what to do:\n\n• Spotted it early? Spray Tricyclazole (6g per 10L water) immediately\n• Avoid excess nitrogen — it makes plants more vulnerable\n• Use resistant varieties like Pusa Basmati 1121\n• Keep field water level at 5cm during infection period\n• Remove and burn infected plant debris after harvest\n\nAct fast — blast can spread quickly in humid weather! 🌾`;
    }
    return `Quick rice growing tips:\n\n• Keep 3-5 cm standing water during tillering stage\n• Apply Urea in 3 equal splits — not all at once\n• Drain water 10 days before harvest for even ripening\n• Watch for stem borers — use pheromone traps\n• Harvest when 80% grains turn golden\n\nWhich stage is your rice at right now?`;
  }

  // Cotton
  if (q.includes('cotton')) {
    return `Cotton farming tips:\n\n• Pink bollworm is your biggest enemy — use 5 pheromone traps per acre\n• Pick cotton bolls in morning when dew dries up\n• Give first irrigation 3 weeks after sowing\n• Spray neem oil every 15 days to keep sucking pests away\n• Stop picking when bolls turn brown and burst open\n\nNeed help with a specific cotton problem?`;
  }

  // Tomato
  if (q.includes('tomato')) {
    return `Tomato growing made easy:\n\n• Drip irrigate 2-3 liters per plant daily\n• Apply Calcium Nitrate (5g/L) to prevent black bottom rot\n• Stake plants to keep fruits off ground — less disease\n• Spray neem oil for whiteflies, use yellow sticky traps\n• Pick when fruits turn 50% red for longer shelf life\n\nWhat issue are you facing with your tomatoes?`;
  }

  // Maize / Corn
  if (q.includes('maize') || q.includes('corn')) {
    return `Maize growing advice:\n\n• Plant spacing: 60cm between rows, 20cm between plants\n• First weeding at 20-25 days is critical — don't skip it\n• Apply 80 kg Nitrogen per hectare in 2 splits\n• Fall armyworm? Use Emamectin Benzoate spray\n• Harvest when husks turn dry and kernels are hard\n\nTell me more about your maize crop for specific advice!`;
  }

  // Fertilizer general
  if (q.includes('fertilizer') || q.includes('npk') || q.includes('nutrient') || q.includes('urea')) {
    return `Simple fertilizer guide:\n\n• Always get soil tested first — it tells you exactly what's needed\n• NPK 4:2:1 ratio works for most crops\n• Never apply all nitrogen at once — split into 2-3 doses\n• Add organic manure (5-10 tonnes/hectare) for long-term soil health\n• Foliar spray of Zinc and Boron helps during flowering\n\nWhich crop are you growing? I'll give you exact doses!`;
  }

  // Pest / Disease
  if (q.includes('pest') || q.includes('insect') || q.includes('disease') || q.includes('fungus') || q.includes('bug')) {
    return `Quick pest control tips:\n\n• Neem oil spray (5ml/L water) every 10 days keeps most pests away\n• Yellow sticky traps catch whiteflies and aphids early\n• Rotate crops every season — pests can't build up\n• Remove weeds — they hide pests\n• Use chemical spray only as last resort, follow the label\n\nWhich pest or disease are you seeing? Describe it and I'll help! 🔍`;
  }

  // Irrigation / Water
  if (q.includes('irrigation') || q.includes('water') || q.includes('drip') || q.includes('sprinkler')) {
    return `Smart watering tips:\n\n• Drip irrigation saves 40-50% water vs flood irrigation\n• Water early morning (6-8 AM) — less water lost to sun\n• Never skip watering during flowering — it's the most critical time\n• Mulch around plants with straw to keep soil moist longer\n• Check soil with your finger — if dry 2 inches deep, time to water\n\nWhat crop and soil type do you have? 💧`;
  }

  // Soil
  if (q.includes('soil') || q.includes('ph') || q.includes('organic matter') || q.includes('compost')) {
    return `Taking care of your soil:\n\n• Get soil tested every year — costs little, saves a lot\n• Add compost or farmyard manure (5-10 tonnes/hectare) yearly\n• Grow legumes (like moong or chickpea) between seasons — they add nitrogen naturally\n• Don't burn crop residue — it kills good soil organisms\n• If soil is acidite, add lime. If alkaline, add gypsum\n\nWhat kind of soil do you have on your farm?`;
  }

  // Harvest
  if (q.includes('harvest') || q.includes('picking') || q.includes('yield')) {
    return `Harvest tips for best results:\n\n• Harvest early morning when it's cool — produce stays fresh longer\n• Check moisture content before storage (should be below 14% for grains)\n• Don't delay harvest — overripe crops lose quality and attract pests\n• Use clean, dry bags or containers for storage\n• Store in cool, dry place — consider cold storage for perishables\n\nWhich crop are you harvesting?`;
  }

  // Seed / Sowing
  if (q.includes('seed') || q.includes('sowing') || q.includes('planting') || q.includes('variety')) {
    return `Choosing the right seeds:\n\n• Always buy certified seeds from trusted sources\n• Treat seeds with fungicide before sowing — prevents early diseases\n• Check germination rate — drop 10 seeds in water, good ones sink\n• Choose varieties suited to your region and season\n• Don't reuse hybrid seeds — buy fresh each season\n\nWhich crop are you planning to sow?`;
  }

  // Organic farming
  if (q.includes('organic') || q.includes('natural') || q.includes('chemical free')) {
    return `Going organic? Here's how:\n\n• Replace chemical fertilizer with vermicompost and cow dung manure\n• Use neem oil and garlic spray instead of pesticides\n• Plant marigold around your field — it repels many insects\n• Grow legumes to naturally add nitrogen to soil\n• Get organic certification — you can sell at 20-40% higher price!\n\nOrganic farming takes 2-3 seasons to show full results. Be patient! 🌿`;
  }

  // Weather / Season
  if (q.includes('weather') || q.includes('rain') || q.includes('drought') || q.includes('season') || q.includes('monsoon')) {
    return `Dealing with weather:\n\n• Heavy rain expected? Make drainage channels to prevent waterlogging\n• Drought? Mulch heavily and water at root zone only\n• Hot weather? Use shade nets for vegetables (50% shade)\n• Cold snap coming? Cover seedlings with plastic sheets at night\n• Always check 5-day weather forecast before spraying\n\nWhat weather challenge are you facing?`;
  }

  // Storage / Post-harvest
  if (q.includes('storage') || q.includes('store') || q.includes('cold storage') || q.includes('post-harvest')) {
    return `Storing your harvest right:\n\n• Dry grains to 12-14% moisture before storing\n• Use airtight containers or hermetic bags to prevent insects\n• Cold storage at 4-8°C for fruits and vegetables\n• Check stored produce every 2 weeks for pests or moisture\n• Don't stack bags directly on floor — use wooden pallets\n\nWhat crop are you looking to store? I can give specific advice!`;
  }

  // Price / Market / Selling
  if (q.includes('price') || q.includes('market') || q.includes('sell') || q.includes('mandi') || q.includes('msp')) {
    return `Getting best price for your crop:\n\n• Check MSP (Minimum Support Price) before selling\n• Compare prices at 2-3 mandis before choosing where to sell\n• Grade and sort your produce — better quality = better price\n• Consider direct-to-consumer selling for 20-30% more profit\n• Store produce if current prices are low — sell when prices rise\n\nWhich crop are you looking to sell?`;
  }

  // Default — make it question-specific
  return `I'd love to help with your question about "${question.substring(0, 60)}"\n\nHere's what I suggest:\n\n• Tell me which crop you're growing and what stage it's at\n• Describe any specific problem you're seeing in the field\n• Mention your location and soil type if you can\n\nThe more details you share, the better advice I can give! Ask about fertilizers, pests, irrigation, harvesting, or anything farming-related. 🌱`;
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

  if (apiKey && apiKey.trim() !== '') {
    const modelsToTry = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];
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
