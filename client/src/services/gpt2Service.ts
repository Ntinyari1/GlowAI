import axios from 'axios';

// In-memory cache for the daily tip and the date it was last fetched
let cachedTip: string | null = null;
let lastFetched: string | null = null;

// Helper to get today's date as YYYY-MM-DD
function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Function to fetch a skincare tip from Hugging Face (using GPT-2)
async function fetchTipFromHF(skinType?: string, timeOfDay?: string): Promise<string> {
  let prompt = `Give me a daily skincare tip`;
  
  if (skinType) {
    prompt += ` for ${skinType} skin`;
  }
  
  if (timeOfDay && timeOfDay !== 'all') {
    prompt += ` for ${timeOfDay}`;
  }
  
  prompt += '.';

  try {
    // Debug: Check if API key is loaded
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    console.log('API Key loaded:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');
    
    if (!apiKey) {
      console.error('Hugging Face API key not found in environment variables');
      throw new Error('API key not configured');
    }
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        inputs: prompt,
        parameters: { 
          max_new_tokens: 60,
          temperature: 0.7,
          do_sample: true
        },
      },
      {
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 15000,
      }
    );

    // Extract the generated text
    const generatedText = response.data[0]?.generated_text || '';
    
    // Clean up the response - remove the original prompt and get just the tip
    const tip = generatedText.replace(prompt, '').trim();
    
    // If the tip is too short or empty, provide a fallback
    if (!tip || tip.length < 10) {
      return getFallbackTip(skinType, timeOfDay);
    }
    
    // Clean up any incomplete sentences
    const sentences = tip.split('.');
    const completeSentences = sentences.filter((s: string) => s.trim().length > 5);
    
    if (completeSentences.length > 0) {
      return completeSentences[0].trim() + '.';
    }
    
    return getFallbackTip(skinType, timeOfDay);
    
  } catch (error: any) {
    console.error('Error fetching tip from Hugging Face:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request made but no response:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return getFallbackTip(skinType, timeOfDay);
  }
}

// Fallback tips when API fails
function getFallbackTip(skinType?: string, timeOfDay?: string): string {
  const fallbackTips = {
    morning: [
      "Start your day with a gentle cleanser and always apply SPF 30 or higher.",
      "Use a vitamin C serum in the morning for antioxidant protection.",
      "Don't forget to moisturize before applying sunscreen."
    ],
    evening: [
      "Remove makeup thoroughly and follow with a gentle cleanser.",
      "Apply a nourishing night cream to help skin repair overnight.",
      "Consider using a retinol product 2-3 times per week in the evening."
    ],
    all: [
      "Drink plenty of water to keep your skin hydrated from within.",
      "Always patch test new products before applying to your entire face.",
      "Be gentle with your skin - avoid over-exfoliating."
    ]
  };

  const timeKey = timeOfDay && timeOfDay !== 'all' ? timeOfDay as keyof typeof fallbackTips : 'all';
  const tips = fallbackTips[timeKey] || fallbackTips.all;
  
  return tips[Math.floor(Math.random() * tips.length)];
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
