export async function flagForHumanReview(payload: {
  reason?: string;
  rawOutput?: string;
  requestBody?: unknown;
}) {
  // Placeholder: in a real app, push to a review queue, send to a webhook, or create a DB row.
  if (process.env.NODE_ENV !== "production") {
    console.warn("Flagged for human review:", payload.reason);
  }

  // Return a lightweight token/id for tracking (in real app this would be a DB id)
  return { reviewId: `review_${Date.now()}` };
}
