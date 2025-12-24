
import { GoogleGenAI, Type } from "@google/genai";
import { AlchemicalResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function consultMelvin(incantation: string, gameStateSummary: string): Promise<AlchemicalResponse> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The player says this incantation to Melvin the Alchemist: "${incantation}". 
    Current Game Context: ${gameStateSummary}. 
    Analyze the magic resonance of the incantation. Be creative. 
    If the incantation is poetic, funny, or alchemically relevant, provide a higher bonus.`,
    config: {
      systemInstruction: `You are Melvin, a quirky, eccentric, but brilliant alchemist who lives in a crystal-filled cave. 
      You speak in a whimsical, slightly archaic tone. 
      You provide feedback on alchemical incantations.
      Bonus multiplier must be between 1.0 and 3.0.
      Respond in JSON.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING, description: "Melvin's spoken response to the player." },
          bonusMultiplier: { type: Type.NUMBER, description: "A multiplier for crystal production (1.0 to 3.0)." },
          unlockedLore: { type: Type.STRING, description: "A snippet of hidden crystal lore." }
        },
        required: ["message", "bonusMultiplier", "unlockedLore"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as AlchemicalResponse;
  } catch (e) {
    return {
      message: "Bah! My cauldron bubbled over. Try that again, apprentice!",
      bonusMultiplier: 1.0,
      unlockedLore: "The history of crystals is written in the earth's silent song."
    };
  }
}
