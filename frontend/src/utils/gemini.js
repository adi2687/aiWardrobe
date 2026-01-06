// Gemini API utility functions

import { getAuthHeaders } from './auth';

const API_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Call Gemini API for outfit suggestions
 * @param {string} prompt - The user's prompt/question
 * @param {Object} options - Additional options
 * @param {string[]} options.clothes - Array of user's clothing items
 * @param {Object} options.weather - Weather data object
 * @param {Object} options.userdetails - User details object (age, gender, skinColor, etc.)
 * @returns {Promise<string>} - The AI response text
 */
export const getGeminiSuggestion = async (prompt, options = {}) => {
  try {
    const { clothes, weather, userdetails } = options;

    const response = await fetch(`${API_URL}/chat/suggestion`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        input: prompt,
        clothes: "",
        weather: "",
        userdetails: ""
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Clean the response (remove markdown, HTML tags, etc.)
    const cleanedResponse = data.response
      ?.replace(/\*/g, '') // Remove markdown bold/italic
      .replace(/<.*?>/g, '') // Remove HTML tags
      .trim() || 'No response available.';

    return cleanedResponse;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to get AI suggestion. Please try again.');
  }
};

/**
 * Call Gemini API for weekly outfit suggestions
 * @param {string} prompt - The user's prompt/question
 * @param {Object} options - Additional options
 * @param {string[]} options.clothes - Array of user's clothing items
 * @param {Object[]} options.weather - Array of weather data for the week
 * @returns {Promise<string>} - The AI response text
 */
export const getGeminiWeeklySuggestion = async (prompt, options = {}) => {
  try {
    const { clothes, weather } = options;

    const response = await fetch(`${API_URL}/chat/suggestionforweek`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        input: prompt,
        clothes: clothes ? clothes.join(', ') : undefined,
        weather: weather || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Clean the response
    const cleanedResponse = data.response
      ?.replace(/\*/g, '')
      .replace(/<.*?>/g, '')
      .trim() || 'No response available.';

    return cleanedResponse;
  } catch (error) {
    console.error('Error calling Gemini API for weekly suggestions:', error);
    throw new Error('Failed to get weekly suggestions. Please try again.');
  }
};

/**
 * Call Gemini API for shopping suggestions
 * @returns {Promise<string>} - The AI shopping suggestions
 */
export const getGeminiShoppingSuggestions = async () => {
  try {
    const response = await fetch(`${API_URL}/chat/getshoppingsuggestions`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestion || 'No shopping suggestions available.';
  } catch (error) {
    console.error('Error calling Gemini API for shopping suggestions:', error);
    throw new Error('Failed to get shopping suggestions. Please try again.');
  }
};

/**
 * Generic Gemini API call function
 * @param {string} endpoint - The API endpoint (e.g., 'suggestion', 'suggestionforweek')
 * @param {Object} body - Request body data
 * @returns {Promise<Object>} - The API response
 */
export const callGeminiAPI = async (endpoint, body = {}) => {
  try {
    const response = await fetch(`${API_URL}/chat/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error calling Gemini API endpoint ${endpoint}:`, error);
    throw error;
  }
};

