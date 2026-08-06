import { GoogleGenerativeAI } from '@google/generative-ai';

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
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean string if wrapped in markdown code blocks
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn('[AI Service] Gemini API call error, falling back to Agronomy Engine:', err.message);
    }
  }

  // Smart fallback agronomy engine when API key is missing or quota is limited
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
