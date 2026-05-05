/**
 * OpenRouter API - Access Google Gemini models through OpenRouter proxy
 * Set GOOGLE_GENERATIVE_AI_API_KEY with your OpenRouter key (sk-or-v1-...)
 * Get key at: https://openrouter.ai/keys
 */

export async function generateWithOpenRouter(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY. Get your OpenRouter API key at https://openrouter.ai/keys and add it to your environment."
    )
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
      "X-Title": "BrightPath AI",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-1.5-flash",
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenRouter API Error: ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export async function generateJSONWithOpenRouter(
  prompt: string,
  schema?: string
): Promise<string> {
  const fullPrompt = schema
    ? `${prompt}\n\nRespond with valid JSON only that matches this schema:\n${schema}`
    : `${prompt}\n\nRespond with valid JSON only.`

  const response = await generateWithOpenRouter(fullPrompt)

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = response
  const jsonMatch = response.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  return jsonStr
}

// Legacy function name for compatibility
export function getGeminiFlash() {
  return {
    generateText: generateWithOpenRouter,
    generateJSON: generateJSONWithOpenRouter,
  }
}
