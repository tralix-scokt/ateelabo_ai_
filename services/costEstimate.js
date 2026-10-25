// Deliberately exclude Gemini and other models: their rates/tier are not configured.
const priced = { $and: [
  { $eq: [{ $ifNull: ['$provider', 'openai'] }, 'openai'] },
  { $regexMatch: { input: { $ifNull: ['$model', ''] }, regex: '^gpt-4o-mini(?:-|$)' } },
] };
export const pricedTokenFields = {
  pricedPromptTokens: { $sum: { $cond: [priced, '$promptTokens', 0] } },
  pricedCompletionTokens: { $sum: { $cond: [priced, '$completionTokens', 0] } },
};
export function estimateCost(usage) {
  return Number(((Number(usage?.pricedPromptTokens || 0) * 0.15 + Number(usage?.pricedCompletionTokens || 0) * 0.60) / 1000000).toFixed(6));
}
