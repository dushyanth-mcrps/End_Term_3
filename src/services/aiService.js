const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
]

function buildPlanPrompt(goal, timeframe) {
  return `Create a ${timeframe}-day learning plan for ${goal} with clear daily topics.
Return only valid JSON in this exact format:
[
  { "day": 1, "topics": ["Topic 1", "Topic 2"] }
]`
}

function buildResourcePrompt(topic) {
  return `Suggest learning resources for: ${topic}.
Return only valid JSON in this exact format:
{
  "youtube": [
    { "title": "Video title", "link": "https://www.youtube.com/watch?v=..." }
  ],
  "docs": [
    { "title": "Doc title", "link": "https://..." }
  ]
}
Rules:
- Include exactly 3 YouTube links and 3 docs links.
- Use real, direct URLs.
- Keep titles concise.`
}

function buildSummaryPrompt(text) {
  return `Summarize the following text into exactly 3 bullet points.
Return only valid JSON in this exact format:
{
  "summary": ["Bullet 1", "Bullet 2", "Bullet 3"]
}

Text:
${text}`
}

function extractJsonArray(text) {
  const trimmedText = String(text ?? '').trim()

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

function extractJsonObject(text) {
  const trimmedText = String(text ?? '').trim()

  try {
    return JSON.parse(trimmedText)
  } catch {
    const match = trimmedText.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error('AI response did not include a valid JSON object.')
    }

    return JSON.parse(match[0])
  }
}

function normalizeSummary(rawSummary) {
  const summary = rawSummary?.summary

  if (!Array.isArray(summary)) {
    throw new Error('Invalid summary format received from AI.')
  }

  const bullets = summary.map((item) => String(item ?? '').trim()).filter(Boolean)
  if (bullets.length !== 3) {
    throw new Error('AI summary must contain exactly 3 bullet points.')
  }

  return bullets
}

async function requestGroq(textPrompt) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Missing Groq API key. Set VITE_GROQ_API_KEY in your .env file.')
  }

  let lastErrorMessage = 'Groq request failed. Please try again.'

  for (const model of GROQ_MODELS) {
    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a precise educational assistant. Always return strictly valid JSON with no markdown wrappers.',
          },
          {
            role: 'user',
            content: textPrompt,
          },
        ],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      let apiMessage = ''

      try {
        const errorData = await response.json()
        apiMessage = errorData?.error?.message || errorData?.error?.type || ''
      } catch {
        apiMessage = ''
      }

      lastErrorMessage = apiMessage
        ? `Groq request failed: ${apiMessage}`
        : `Groq request failed with status ${response.status}.`

      continue
    }

    const data = await response.json()
    const textOutput = data?.choices?.[0]?.message?.content

    if (!textOutput) {
      lastErrorMessage = `Groq (${model}) returned an empty response.`
      continue
    }

    return textOutput
  }

  throw new Error(lastErrorMessage)
}

function normalizeResourceItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => ({
      title: String(item?.title ?? '').trim(),
      link: String(item?.link ?? '').trim(),
    }))
    .filter((item) => item.title && item.link)
}

function normalizeSuggestions(rawSuggestions) {
  if (!rawSuggestions || typeof rawSuggestions !== 'object') {
    throw new Error('Invalid resource suggestion format received from AI.')
  }

  return {
    youtube: normalizeResourceItems(rawSuggestions.youtube),
    docs: normalizeResourceItems(rawSuggestions.docs),
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
  const textOutput = await requestGroq(buildPlanPrompt(goal, timeframe))
  const parsedPlan = extractJsonArray(textOutput)

  return normalizePlan(parsedPlan)
}

export async function suggestResources(topic) {
  const normalizedTopic = String(topic ?? '').trim()

  if (!normalizedTopic) {
    throw new Error('Topic is required to suggest resources.')
  }

  const textOutput = await requestGroq(buildResourcePrompt(normalizedTopic))
  const parsedSuggestions = extractJsonObject(textOutput)

  return normalizeSuggestions(parsedSuggestions)
}

export async function summarizeText(inputText) {
  const normalizedText = String(inputText ?? '').trim()

  if (!normalizedText) {
    throw new Error('Text is required to generate a summary.')
  }

  const textOutput = await requestGroq(buildSummaryPrompt(normalizedText))
  const parsedSummary = extractJsonObject(textOutput)

  return normalizeSummary(parsedSummary)
}
