
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem } from "../types";

export const analyzeInventoryEfficiency = async (inventory: InventoryItem[]) => {
  // Always use direct process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const inventoryData = inventory.map(item => ({
    name: item.name,
    category: item.category,
    expiry: item.expirationDate,
    qty: item.quantity
  }));

  const prompt = `As a medical logistics AI, analyze this hospital inventory data for potential waste and swap opportunities. 
  Inventory: ${JSON.stringify(inventoryData)}
  
  Provide a structured assessment of risk and actionable swap strategies.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, description: 'Low, Medium, or High' },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Actionable steps for swapping or utilization'
            },
            potentialSavings: { type: Type.STRING, description: 'Estimated dollar amount saved by swapping instead of wasting' }
          },
          required: ['riskLevel', 'recommendations', 'potentialSavings']
        }
      }
    });

    // Directly access .text property from response.
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      riskLevel: "Unknown",
      recommendations: ["Ensure your API key is correctly configured.", "Manually review items expiring within 90 days."],
      potentialSavings: "$0.00"
    };
  }
};
