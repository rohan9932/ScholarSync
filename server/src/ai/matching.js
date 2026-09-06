/**
 * AI Matching Service
 *
 * Owned by: Agent 3 (real vector similarity & Gemini 1.5 Flash evaluation)
 * Stubbed by: Phase 0/2 so applicationController.create can invoke it without blocking.
 *
 * @param {string} applicationId - Application ID to evaluate
 * @returns {Promise<void>}
 */
export async function evaluateApplication(applicationId) {
  // Placeholder resolves immediately so route works before Agent 3 finishes
  console.log(`[AI Matching Stub] evaluateApplication called for application: ${applicationId}`);
  return Promise.resolve();
}
