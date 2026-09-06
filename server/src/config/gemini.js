import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const EMBEDDING_MODEL_NAME = 'gemini-embedding-001';
export const FLASH_MODEL_NAME = 'gemini-3.5-flash';

/**
 * Exponential backoff wrapper around Gemini API calls
 * Retries on 429 (Resource Exhausted) or 503 (Service Unavailable)
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {number} maxRetries
 * @param {number} baseDelayMs
 * @returns {Promise<T>}
 */
export async function withRetry(fn, maxRetries = 2, baseDelayMs = 1000) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
      const isUnavailable = err.status === 503 || (err.message && err.message.includes('503'));

      if ((isRateLimit || isUnavailable) && attempt <= maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`[Gemini API] Retry attempt ${attempt}/${maxRetries} after ${delay}ms due to: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

export function getEmbeddingModel() {
  return genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });
}

export function getFlashModel(options = {}) {
  return genAI.getGenerativeModel({
    model: FLASH_MODEL_NAME,
    ...options,
  });
}

export default genAI;
