export interface Quote {
  number: number;
  tamil: string;
  explanation: string;
}

const fallbackQuotes: Quote[] = [
  { 
    number: 1, 
    tamil: 'அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு', 
    explanation: 'As the letter A is the first of all letters, so the eternal God is first in the world' 
  },
  { 
    number: 2, 
    tamil: 'கற்றதனால் ஆய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்', 
    explanation: 'What is the use of learning if one does not worship the feet of Him who is the source of all knowledge?' 
  },
  { 
    number: 3, 
    tamil: 'மலர்மிசை ஏகினான் மாணடி சேர்ந்தார்\nநிலமிசை நீடுவாழ் வார்', 
    explanation: 'Those who have reached the feet of Him who rides on the flower will live long on earth' 
  },
  { 
    number: 4, 
    tamil: 'வேண்டுதல் வேண்டாமை இலானடி சேர்ந்தார்க்கு\nயாண்டும் இடும்பை இல', 
    explanation: 'For those who have reached the feet of Him who is free from desire and aversion, there is no sorrow anywhere' 
  },
  { 
    number: 5, 
    tamil: 'இருள்சேர் இருவினையும் சேரா இறைவன்\nபொருள்சேர் புகழ்புரிந்தார் மாட்டு', 
    explanation: 'The two-fold deeds that dwell in darkness will not approach those who have attained the glory of the Lord' 
  }
];

export async function getRandomQuote(): Promise<Quote> {
  try {
    const response = await fetch('https://kural-api.fly.dev/random-quote', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.number || !data?.tamil || !data?.explanation) {
      throw new Error('Invalid response format from Kural API');
    }

    return {
      number: data.number,
      tamil: data.tamil,
      explanation: data.explanation
    };
  } catch (error) {
    console.warn('Failed to fetch quote from Kural API, using fallback:', error);
    return getRandomFallbackQuote();
  }
}

function getRandomFallbackQuote(): Quote {
  return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
}
