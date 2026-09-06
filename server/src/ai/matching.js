import prisma from '../config/prisma.js';
import { getEmbedding } from '../services/embeddings.js';
import { getFlashModel, withRetry } from '../config/gemini.js';

/**
 * AI Matching Service
 *
 * Implements the RAG matching pipeline:
 * 1. Fetches application & faculty data
 * 2. If faculty has no embeddings/research interests, sets informative fallback
 * 3. Generates 768-dim vector embedding for student pitch text
 * 4. Saves student vector to DB via raw SQL
 * 5. Computes cosine similarity via pgvector <=> distance operator
 * 6. Generates 1-2 sentence alignment summary via Gemini 3.6 Flash
 * 7. Updates application with matchScore and matchSummary
 *
 * @param {string} applicationId - Application ID to evaluate
 * @returns {Promise<{ matchScore: number | null, matchSummary: string }>}
 */
export async function evaluateApplication(applicationId) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { faculty: true },
    });

    if (!application) {
      console.error(`[AI Matching] Application not found: ${applicationId}`);
      return;
    }

    const { faculty, pitchText } = application;

    // Check if faculty has embedding or listed research interests
    // Check raw embedding in DB
    const facultyVectorCheck = await prisma.$queryRawUnsafe(
      `SELECT (embedding IS NOT NULL) AS "hasEmbedding" FROM faculties WHERE id = $1`,
      faculty.id
    );

    const hasFacultyEmbedding = facultyVectorCheck[0]?.hasEmbedding === true;

    if (!hasFacultyEmbedding || !faculty.researchInterests || faculty.researchInterests.length === 0) {
      console.log(`[AI Matching] Faculty ${faculty.id} has no research interests or embedding. Skipping similarity math.`);
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          matchScore: null,
          matchSummary: "This faculty member hasn't listed research interests yet, so an automated match score isn't available.",
        },
      });
      return {
        matchScore: null,
        matchSummary: "This faculty member hasn't listed research interests yet, so an automated match score isn't available.",
      };
    }

    // 1. Generate student pitch embedding (768 dimensions)
    console.log(`[AI Matching] Generating embedding for application ${applicationId}...`);
    const studentVector = await getEmbedding(pitchText);
    const vectorString = `[${studentVector.join(',')}]`;

    // 2. Update application embedding in database
    await prisma.$executeRawUnsafe(
      `UPDATE applications SET embedding = $1::vector WHERE id = $2`,
      vectorString,
      applicationId
    );

    // 3. Compute cosine similarity: 1 - (a.embedding <=> f.embedding)
    const similarityResult = await prisma.$queryRawUnsafe(
      `SELECT 1 - (a.embedding <=> f.embedding) AS similarity
       FROM applications a
       JOIN faculties f ON f.id = a."facultyId"
       WHERE a.id = $1`,
      applicationId
    );

    let rawSimilarity = parseFloat(similarityResult[0]?.similarity ?? 0);
    if (isNaN(rawSimilarity)) rawSimilarity = 0;

    // Convert similarity to 0-100 score, rounded to 1 decimal place
    const matchScore = Math.max(0, Math.min(100, Math.round(rawSimilarity * 1000) / 10));

    // 4. Generate 1-2 sentence match summary with Gemini 3.6 Flash
    console.log(`[AI Matching] Generating AI fit summary for application ${applicationId}...`);
    const interestsText = faculty.researchInterests.join(', ');

    const flashModel = getFlashModel({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.3,
      },
    });

    const summaryPrompt = `You are an academic advisor for ScholarSync evaluating an undergraduate research application.
Faculty Member: ${faculty.name} (${faculty.designation})
Faculty Research Interests: ${interestsText}
Student Name: ${application.studentName}
Student Research Pitch: "${pitchText}"

Write exactly 1-2 concise, objective sentences summarizing the research overlap or gap between this pitch and the faculty's focus areas.`;

    const summaryResponse = await withRetry(async () => {
      const response = await flashModel.generateContent(summaryPrompt);
      return response.response.text().trim();
    });

    // 5. Update application with score and summary
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        matchScore,
        matchSummary: summaryResponse,
      },
    });

    console.log(`[AI Matching] Successfully scored application ${applicationId}: ${matchScore}%`);

    return {
      matchScore,
      matchSummary: summaryResponse,
    };
  } catch (error) {
    console.error(`[AI Matching] Error evaluating application ${applicationId}:`, error);
    // Don't crash the server on background task failure
    try {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          matchSummary: 'Scoring could not be completed automatically due to an evaluation error.',
        },
      });
    } catch (_) {}
  }
}
