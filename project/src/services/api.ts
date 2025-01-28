// API configuration and endpoints
// Update this file when adding new API endpoints or changing the API structure
const API_CONFIG = {
  baseUrl: 'https://api.example.com', // Replace with actual API URL
  endpoints: {
    query: '/query',
  },
};

export async function sendMessage(message: string) {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: message }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}