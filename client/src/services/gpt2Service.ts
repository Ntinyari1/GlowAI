import axios from 'axios';

// In-memory cache for the daily tip and the date it was last fetched
let cachedTip: string | null = null;
let lastFetched: string | null = null;

// Helper to get today's date as YYYY-MM-DD
function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Function to fetch a skincare tip from Hugging Face (using Mistral AI)
async function fetchTipFromHF(skinType?: string, timeOfDay?: string): Promise<string> {
  let prompt = `Generate a concise skincare tip`;
  
  if (skinType) {
    prompt += ` for ${skinType} skin`;
  }
  
  if (timeOfDay && timeOfDay !== 'all') {
    prompt += ` for ${timeOfDay} routine`;
  }
  
  prompt += '. Keep it under 50 words and practical.';

  try {
    // Check if API key is loaded
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      console.warn('Hugging Face API key not found - using fallback tips');
      return getFallbackTip(skinType, timeOfDay);
    }
    
    console.log('🤖 Generating tip with AI...');
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        inputs: prompt,
        parameters: { 
          max_new_tokens: 80,
          temperature: 0.8,
          do_sample: true,
          top_p: 0.9
        },
      },
      {
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 20000,
      }
    );

    // Handle different response formats
    let generatedText = '';
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      generatedText = response.data[0].generated_text;
    } else if (response.data?.generated_text) {
      generatedText = response.data.generated_text;
    } else {
      console.warn('Unexpected response format from Mistral AI');
      return getFallbackTip(skinType, timeOfDay);
    }
    
    // Clean up the response - remove the original prompt and get just the tip
    const tip = generatedText.replace(prompt, '').trim();
    
    // Validate and clean the tip
    if (!tip || tip.length < 15) {
      console.warn('Generated tip too short, using fallback');
      return getFallbackTip(skinType, timeOfDay);
    }
    
    // Clean up any incomplete sentences and limit length
    const sentences = tip.split(/[.!?]/);
    const validSentences = sentences.filter((s: string) => s.trim().length > 10);
    
    if (validSentences.length > 0) {
      const cleanTip = validSentences[0].trim();
      // Ensure it ends with proper punctuation
      const finalTip = cleanTip.endsWith('.') || cleanTip.endsWith('!') || cleanTip.endsWith('?') 
        ? cleanTip 
        : cleanTip + '.';
      
      console.log('✅ Successfully generated tip with AI');
      return finalTip;
    }
    
    return getFallbackTip(skinType, timeOfDay);
    
  } catch (error: any) {
    console.error('❌ Error with Mistral AI:', error.message);
    
    // Handle specific error types
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        console.error('🔑 API key is invalid or expired - please update your Hugging Face token');
      } else if (status === 429) {
        console.error('⏱️ Rate limit exceeded - too many requests');
      } else if (status === 503) {
        console.error('🔧 Mistral AI model is currently loading - try again in a moment');
      } else {
        console.error(`🚨 API Error ${status}:`, data);
      }
    }
    
    console.log('🔄 Using fallback tip instead');
    return getFallbackTip(skinType, timeOfDay);
  }
}

// Comprehensive fallback tips when API fails
function getFallbackTip(skinType?: string, timeOfDay?: string): string {
  const fallbackTips = {
    morning: {
      oily: [
        "Start with a salicylic acid cleanser to control oil production throughout the day.",
        "Use a lightweight, oil-free moisturizer with SPF 30+ to prevent shine.",
        "Apply niacinamide serum to minimize pores and control sebum.",
        "Don't skip moisturizer even with oily skin - dehydration can increase oil production."
      ],
      dry: [
        "Use a creamy, hydrating cleanser to preserve your skin's natural moisture barrier.",
        "Apply hyaluronic acid serum on damp skin, then seal with a rich moisturizer.",
        "Choose a moisturizing sunscreen with ceramides or glycerin for extra hydration.",
        "Consider a facial oil under your moisturizer for intense hydration."
      ],
      sensitive: [
        "Use fragrance-free, gentle products with minimal ingredients in the morning.",
        "Apply a mineral sunscreen with zinc oxide - it's less likely to irritate.",
        "Pat products onto skin instead of rubbing to avoid irritation.",
        "Look for products with soothing ingredients like aloe vera or chamomile."
      ],
      combination: [
        "Use different products for your T-zone and cheeks based on their needs.",
        "Apply a lightweight moisturizer all over, then add extra hydration to dry areas.",
        "Use a broad-spectrum SPF that won't clog pores in your oily zones.",
        "Consider a mattifying primer in your T-zone before sunscreen."
      ],
      normal: [
        "Maintain your skin's balance with a gentle cleanser and lightweight moisturizer.",
        "Vitamin C serum in the morning provides antioxidant protection and glow.",
        "Don't forget SPF 30+ even on cloudy days - UV rays penetrate clouds.",
        "A simple routine works best - cleanser, serum, moisturizer, sunscreen."
      ]
    },
    afternoon: {
      oily: [
        "Blot excess oil with blotting papers instead of washing your face again.",
        "Carry a mattifying mist for quick touch-ups without disturbing makeup.",
        "Avoid touching your face throughout the day to prevent transferring oils."
      ],
      dry: [
        "Spritz a hydrating facial mist to refresh and add moisture midday.",
        "Keep a travel-size moisturizer for quick hydration touch-ups.",
        "Drink water regularly - internal hydration reflects on your skin."
      ],
      sensitive: [
        "Avoid harsh air conditioning or heating that can irritate sensitive skin.",
        "If your skin feels tight, apply a gentle moisturizer over makeup.",
        "Take breaks from wearing masks to let your skin breathe."
      ],
      combination: [
        "Address different zones separately - blot oily areas, hydrate dry spots.",
        "Use a setting spray to refresh makeup and add light hydration.",
        "Monitor how your skin changes throughout the day in different areas."
      ],
      normal: [
        "Maintain hydration with a light facial mist if needed.",
        "Protect your skin if you'll be outdoors - reapply sunscreen.",
        "Keep your hands clean to avoid transferring bacteria to your face."
      ]
    },
    evening: {
      oily: [
        "Double cleanse: oil cleanser first, then a salicylic acid cleanser.",
        "Use retinol 2-3 times per week to control oil and prevent breakouts.",
        "Apply a lightweight, non-comedogenic night moisturizer.",
        "Consider a clay mask once a week to deep clean pores."
      ],
      dry: [
        "Remove makeup with a nourishing cleansing oil or balm.",
        "Apply a hydrating serum with hyaluronic acid or glycerin.",
        "Use a rich night cream with ceramides to repair the skin barrier.",
        "Consider a overnight hydrating mask 1-2 times per week."
      ],
      sensitive: [
        "Use a gentle, fragrance-free makeup remover and cleanser.",
        "Apply products in thin layers to avoid overwhelming sensitive skin.",
        "Choose a simple night routine with minimal, gentle ingredients.",
        "Avoid retinoids if your skin is very sensitive - opt for bakuchiol instead."
      ],
      combination: [
        "Use a gentle cleanser that won't over-dry or over-moisturize any areas.",
        "Apply different treatments to different zones based on their needs.",
        "Use a balanced moisturizer, adding extra hydration where needed.",
        "Alternate between treating oily and dry areas on different nights."
      ],
      normal: [
        "Double cleanse to remove all traces of sunscreen and pollution.",
        "Incorporate retinol or retinoid 2-3 times per week for anti-aging.",
        "Use a nourishing night moisturizer to support overnight skin repair.",
        "Exfoliate gently 1-2 times per week with AHA or BHA."
      ]
    },
    general: [
      "Always patch test new products on your inner arm before using on your face.",
      "Consistency is key - stick to your routine for at least 4-6 weeks to see results.",
      "Less is often more - don't overwhelm your skin with too many products.",
      "Change your pillowcase regularly to prevent bacteria buildup.",
      "Drink plenty of water and eat antioxidant-rich foods for healthy skin.",
      "Get adequate sleep - your skin repairs itself most effectively at night.",
      "Manage stress through exercise or meditation - stress affects your skin.",
      "Clean your phone screen and makeup brushes regularly to prevent breakouts.",
      "Avoid hot water when washing your face - lukewarm water is gentler.",
      "Be patient with new products - it takes time to see improvements."
    ]
  };

  // Determine the appropriate tip category
  let tips: string[];
  
  if (timeOfDay && timeOfDay !== 'all' && skinType) {
    // Specific time and skin type
    const timeKey = timeOfDay as keyof typeof fallbackTips;
    if (timeKey !== 'general' && fallbackTips[timeKey]) {
      const skinKey = skinType.toLowerCase() as keyof typeof fallbackTips.morning;
      const timeSpecificTips = fallbackTips[timeKey] as Record<string, string[]>;
      tips = timeSpecificTips[skinKey] || fallbackTips.general;
    } else {
      tips = fallbackTips.general;
    }
  } else if (timeOfDay && timeOfDay !== 'all') {
    // Specific time, any skin type
    const timeKey = timeOfDay as keyof typeof fallbackTips;
    if (timeKey !== 'general' && fallbackTips[timeKey]) {
      const timeSpecificTips = fallbackTips[timeKey] as Record<string, string[]>;
      const allSkinTypeTips = Object.values(timeSpecificTips).flat();
      tips = allSkinTypeTips.length > 0 ? allSkinTypeTips : fallbackTips.general;
    } else {
      tips = fallbackTips.general;
    }
  } else if (skinType) {
    // Specific skin type, any time
    const skinKey = skinType.toLowerCase();
    const allTimeTips = [
      ...(fallbackTips.morning[skinKey as keyof typeof fallbackTips.morning] || []),
      ...(fallbackTips.afternoon[skinKey as keyof typeof fallbackTips.afternoon] || []),
      ...(fallbackTips.evening[skinKey as keyof typeof fallbackTips.evening] || [])
    ];
    tips = allTimeTips.length > 0 ? allTimeTips : fallbackTips.general;
  } else {
    // General tips
    tips = fallbackTips.general;
  }
  
  const selectedTip = tips[Math.floor(Math.random() * tips.length)];
  console.log(`💡 Using fallback tip for ${skinType || 'any'} skin, ${timeOfDay || 'any'} time`);
  
  return selectedTip;
}

// Main function to get the daily tip, cached per day
export async function getDailyTip(skinType?: string, timeOfDay?: string): Promise<string> {
  const today = getTodayDate();
  const cacheKey = `${today}-${skinType || 'default'}-${timeOfDay || 'all'}`;
  
  // Check if we already have a tip for today with the same parameters
  if (lastFetched === cacheKey && cachedTip) {
    return cachedTip;
  }

  try {
    // Fetch a new tip
    const tip = await fetchTipFromHF(skinType, timeOfDay);
    
    // Cache the result
    cachedTip = tip;
    lastFetched = cacheKey;
    
    return tip;
  } catch (error) {
    console.error('Error in getDailyTip:', error);
    return getFallbackTip(skinType, timeOfDay);
  }
}

// Function to generate a fresh tip (bypasses cache)
export async function generateFreshTip(skinType?: string, timeOfDay?: string): Promise<string> {
  try {
    const tip = await fetchTipFromHF(skinType, timeOfDay);
    
    // Update cache with new tip
    const today = getTodayDate();
    const cacheKey = `${today}-${skinType || 'default'}-${timeOfDay || 'all'}`;
    cachedTip = tip;
    lastFetched = cacheKey;
    
    return tip;
  } catch (error) {
    console.error('Error generating fresh tip:', error);
    return getFallbackTip(skinType, timeOfDay);
  }
}
