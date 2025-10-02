export interface Quote {
  quote: string;
  author: string;
}

const fallbackQuotes: Quote[] = [
  { quote: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { quote: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
  { quote: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { quote: 'Life is what happens to you while you\'re busy making other plans.', author: 'John Lennon' },
  { quote: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
];

export async function getRandomQuote(): Promise<Quote> {
  const apiKey = import.meta.env.API_NINJAS_KEY;
  
  if (!apiKey) {
    console.warn('API_NINJAS_KEY is not set, using fallback quotes');
    return getRandomFallbackQuote();
  }

  try {
    const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid response format from API');
    }

    const quote = data[0];
    if (!quote?.quote || !quote?.author) {
      throw new Error('Invalid quote format from API');
    }

    return {
      quote: quote.quote,
      author: quote.author
    };
  } catch (error) {
    console.warn('Failed to fetch quote from API, using fallback:', error);
    return getRandomFallbackQuote();
  }
}

function getRandomFallbackQuote(): Quote {
  return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
}
