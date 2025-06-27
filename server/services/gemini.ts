import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SkincareProfile {
  skinType: string;
  concerns: string[];
  age?: number;
  goals?: string[];
}

export async function generateSkincareTip(
  profile: SkincareProfile,
  timeOfDay: 'morning' | 'afternoon' | 'evening'
): Promise<string> {
  const prompt = `Generate a personalized skincare tip for someone with ${profile.skinType} skin.
  
  Profile details:
  - Skin type: ${profile.skinType}
  - Main concerns: ${profile.concerns.join(', ')}
  - Age: ${profile.age || 'Not specified'}
  - Goals: ${profile.goals?.join(', ') || 'General skin health'}
  - Time of day: ${timeOfDay}
  
  Please provide a concise, actionable tip (2-3 sentences) that's specifically relevant for ${timeOfDay} skincare routine. Focus on practical advice they can implement today.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Take care of your skin with gentle, consistent routines.";
}

export async function generateProductReview(
  productName: string,
  productCategory: string,
  ingredients: string[]
): Promise<{
  pros: string[];
  cons: string[];
  bestFor: string[];
  description: string;
}> {
  const prompt = `Analyze the skincare product: ${productName} (${productCategory})
  
  Key ingredients: ${ingredients.join(', ')}
  
  Please provide:
  1. 3-4 pros (benefits and positive aspects)
  2. 2-3 cons (potential drawbacks or limitations)
  3. Best suited for (skin types and concerns)
  4. A brief objective description (2-3 sentences)
  
  Format as JSON with keys: pros, cons, bestFor, description
  Make the review balanced and informative, focusing on ingredient benefits and realistic expectations.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          pros: { 
            type: "array", 
            items: { type: "string" } 
          },
          cons: { 
            type: "array", 
            items: { type: "string" } 
          },
          bestFor: { 
            type: "array", 
            items: { type: "string" } 
          },
          description: { type: "string" }
        },
        required: ["pros", "cons", "bestFor", "description"]
      }
    },
    contents: prompt,
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return {
      pros: data.pros || [],
      cons: data.cons || [],
      bestFor: data.bestFor || [],
      description: data.description || "No description available."
    };
  } catch (error) {
    return {
      pros: ["Contains beneficial ingredients"],
      cons: ["May not suit all skin types"],
      bestFor: ["General skincare needs"],
      description: "Product analysis unavailable."
    };
  }
}

export async function generateRoutineRecommendation(
  profile: SkincareProfile,
  routineType: 'morning' | 'evening'
): Promise<{
  steps: Array<{
    order: number;
    category: string;
    description: string;
    tips: string;
  }>;
}> {
  const prompt = `Create a ${routineType} skincare routine for someone with ${profile.skinType} skin.
  
  Profile:
  - Skin type: ${profile.skinType}
  - Concerns: ${profile.concerns.join(', ')}
  - Goals: ${profile.goals?.join(', ') || 'General skin health'}
  
  Provide a step-by-step routine with:
  1. Order of application (1-6 steps)
  2. Product category (cleanser, toner, serum, moisturizer, sunscreen, etc.)
  3. Brief description of what to look for
  4. Application tips
  
  Format as JSON with 'steps' array containing objects with: order, category, description, tips`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                order: { type: "number" },
                category: { type: "string" },
                description: { type: "string" },
                tips: { type: "string" }
              },
              required: ["order", "category", "description", "tips"]
            }
          }
        },
        required: ["steps"]
      }
    },
    contents: prompt,
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return { steps: data.steps || [] };
  } catch (error) {
    // Fallback routine
    const fallbackSteps = routineType === 'morning' 
      ? [
          { order: 1, category: "cleanser", description: "Gentle daily cleanser", tips: "Use lukewarm water" },
          { order: 2, category: "serum", description: "Targeted treatment serum", tips: "Apply to clean skin" },
          { order: 3, category: "moisturizer", description: "Hydrating moisturizer", tips: "Apply while skin is damp" },
          { order: 4, category: "sunscreen", description: "Broad spectrum SPF 30+", tips: "Reapply every 2 hours" }
        ]
      : [
          { order: 1, category: "cleanser", description: "Deep cleansing formula", tips: "Double cleanse if wearing makeup" },
          { order: 2, category: "treatment", description: "Active ingredient treatment", tips: "Start slowly with new actives" },
          { order: 3, category: "moisturizer", description: "Nourishing night moisturizer", tips: "Apply generously" }
        ];
    
    return { steps: fallbackSteps };
  }
}
