import axios from "axios";

const API_KEY = "b5cc8330c1324e7886e6021e6dcd4c2e"; 
const BASE_URL = "https://newsapi.org/v2";

export const getCelebrityNews = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: 'Celebrity fash ion trends',
        language: "en",
        sortBy: "relevancy", // Sort by relevance for better results
        apiKey: API_KEY,
      },
    });
    return response.data.articles;
  } catch (error) {
    console.error("Error fetching celebrity news:", error);
    return [];
  }
};
