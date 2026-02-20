const { GoogleGenAI } = require('@google/genai');
const logger = require('./logger');

let clientInstance;

function getClient() {
  if (clientInstance) return clientInstance;

  // Note: The SDK automatically looks for the GOOGLE_API_KEY env var.
  // We explicitly pass it here to match your setup.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured');
    error.statusCode = 500;
    throw error;
  }

  try {
    // Correct GA initialization: passing an options object
    clientInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return clientInstance;
  } catch (err) {
    const error = new Error(`Failed to initialize GoogleGenAI client: ${err.message}`);
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Call Google Gemini with a simple text prompt.
 * Uses Gemini 2.5 Flash (Standard Workhorse)
 */
async function callGemini(prompt) {
  if (!prompt?.trim()) {
    const error = new Error('Prompt must be a non-empty string');
    error.statusCode = 400;
    throw error;
  }

  try {
    const client = getClient();

    // The modern SDK uses a flat models.generateContent call
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt
    });

    // In @google/genai GA, text is a direct property of the response object
    return (response?.text || '').trim();
  } catch (err) {
    logger.error('Gemini API error:', {
      message: err.message,
      status: err.status
    });
    const error = new Error(err.message || 'Failed to generate content');
    error.statusCode = err.status || 502;
    throw error;
  }
}

/**
 * Call Google Gemini Pro
 * Uses Gemini 2.5 Flash (Standard Workhorse)
 */
async function callGeminiPro(prompt) {
  try {
    const client = getClient();

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash', // Same working model as callGemini
      contents: prompt
    });

    return (response?.text || '').trim();
  } catch (err) {
    logger.error('Gemini Pro API error:', err.message);
    throw err;
  }
}

module.exports = { callGemini, callGeminiPro };