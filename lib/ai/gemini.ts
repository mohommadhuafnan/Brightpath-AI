import { google } from "@ai-sdk/google"

/**
 * Direct Google Gemini (AI SDK) — avoids Vercel AI Gateway, which requires a card on the Vercel account.
 * Set GOOGLE_GENERATIVE_AI_API_KEY (free tier: https://aistudio.google.com/apikey).
 */
export function getGeminiFlash() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY. Get a free API key at https://aistudio.google.com/apikey and add it to your environment (e.g. Vercel → Project → Settings → Environment Variables)."
    )
  }
  return google("gemini-1.5-flash")
}
