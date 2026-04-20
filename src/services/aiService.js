const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

function buildPrompt(goal, timeframe) {
  return `Create a ${timeframe}-day learning plan for ${goal} with clear daily topics.
Return only valid JSON in this exact format:
[
  { "day": 1, "topics": ["Topic 1", "Topic 2"] }
]`
}

function extractJsonArray(text) {
  const trimmedText = text.trim()

  try {
    return JSON.parse(trimmedText)
  } catch {
    const match = trimmedText.match(/\[[\s\S]*\]/)
    if (!match) {
      throw new Error('AI response did not include a valid JSON array.')
    }

    return JSON.parse(match[0])
  }
}

function normalizePlan(rawPlan) {
  if (!Array.isArray(rawPlan)) {
    throw new Error('Invalid study plan format received from AI.')
  }

  return rawPlan.map((item, index) => {
    const dayNumber = Number(item.day ?? index + 1)
    const topics = Array.isArray(item.topics)
      ? item.topics.map((topic) => String(topic).trim()).filter(Boolean)
      : []

    if (!dayNumber || topics.length === 0) {
      throw new Error('Study plan includes invalid day or topics.')
    }

    return {
      day: dayNumber,
      topics,
    }
  })
}

export async function generateStudyPlan(goal, timeframe) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Missing Gemini API key. Set VITE_GEMINI_API_KEY in your .env file.')
  }

  const response = await fetch(
    `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildPrompt(goal, timeframe) }],
          },
        ],
      }),
    },
  )

  if (!response.ok) {
    throw new Error('Gemini request failed. Please try again.')
  }

  const data = await response.json()
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!textOutput) {
    throw new Error('Gemini returned an empty response.')
  }

  const parsedPlan = extractJsonArray(textOutput)
  return normalizePlan(parsedPlan)
}
