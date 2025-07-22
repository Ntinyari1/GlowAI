import axios from 'axios';

// In-memory cache for the daily tip and the date it was last fetched
let cachedTip: string | null = null;
let lastFetched: string | null = null;

// Helper to get today's date as YYYY-MM-DD
function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Function to fetch a skincare tip from Hugging Face (using a free model)
async function fetchTipFromHF(skinType?: string): Promise<string> {
  // You can swap out the model below for another text-generation model if desired
  const prompt = `Give me a daily skincare tip${skinType ? ' for ' + skinType + ' skin' : ''}.`;

  const response = await axios.post(
    'https://api-inference.huggingface.co/models/gpt2',
    {
      inputs: prompt,
      parameters: { max_new_tokens: 60 },
    },
    {
      headers: { 'Accept': 'application/json' },
      timeout: 10000,
    }
  );

  // Extract the generated text
  const generated = response.data?.[0]?.generated_text || 'Stay hydrated and use sunscreen!';
  // Remove the prompt from the start
  return generated.replace(prompt, '').trim();
}

// Main function to get the daily tip, cached per day
export async function getDailyTip(skinType?: string): Promise<string> {
  const today = getTodayDate();
  if (cachedTip && lastFetched === today) {
    return cachedTip;
  }
  try {
    const tip = await fetchTipFromHF(skinType);
    cachedTip = tip;
    lastFetched = today;
    return tip;
  } catch (e) {
    // On error, return fallback tip
    return 'Remember to cleanse, moisturize, and use sunscreen every day!';
  }
}
