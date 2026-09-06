import { getEmbeddingModel, withRetry } from '../config/gemini.js';

/**
 * Embeddings Service
 *
 * Generates 768-dimensional text embeddings using Google's Gemini Embedding model.
 *
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - 768-dimensional vector as array of floats
 */
export async function getEmbedding(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Text to embed must be a non-empty string.');
  }

  const model = getEmbeddingModel();

  return await withRetry(async () => {
    const result = await model.embedContent({
      content: { parts: [{ text: text.trim() }] },
      outputDimensionality: 768,
    });

    if (!result || !result.embedding || !Array.isArray(result.embedding.values)) {
      throw new Error('Invalid embedding response from Gemini API.');
    }

    const values = result.embedding.values;
    if (values.length !== 768) {
      throw new Error(`Expected embedding dimension 768, got ${values.length}`);
    }

    return values;
  });
}
