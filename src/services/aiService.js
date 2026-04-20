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
    { "title": "Video title", "link": "https://www.youtube.com/results?search_query=..." }
  ],
  "docs": [
    { "title": "Doc title", "link": "https://..." }
  ]
}
Rules:
- Include exactly 3 YouTube links and 3 docs links.
- For YouTube, always use search-result links (youtube.com/results?search_query=...).
- For docs, prefer search-result links (google.com/search?q=...+documentation) to avoid dead pages.
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

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function buildYoutubeSearchLink(query) {
  const encodedQuery = encodeURIComponent(String(query ?? '').trim())
  return `https://www.youtube.com/results?search_query=${encodedQuery}`
}

function buildDocsSearchLink(query) {
  const encodedQuery = encodeURIComponent(`${String(query ?? '').trim()} documentation`)
  return `https://www.google.com/search?q=${encodedQuery}`
}

function normalizeYouTubeItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => ({
      title: String(item?.title ?? '').trim(),
      link: String(item?.link ?? '').trim(),
    }))
    .map((item) => {
      if (!item.title) {
        return item
      }

      const isYouTubeLink = /(^|\.)youtube\.com|(^|\.)youtu\.be/i.test(item.link)

      if (!item.link || !isYouTubeLink) {
        return {
          ...item,
          link: buildYoutubeSearchLink(item.title),
        }
      }

      return item
    })
    .filter((item) => item.title && item.link && isValidHttpUrl(item.link))
}

function normalizeDocsItems(items, topic) {
  if (!Array.isArray(items)) {
    return []
  }

  const normalizedTopic = String(topic ?? '').trim()

  return items
    .map((item) => ({
      title: String(item?.title ?? '').trim(),
      link: String(item?.link ?? '').trim(),
    }))
    .map((item) => {
      if (!item.title) {
        return item
      }

      const isYouTubeLink = /(^|\.)youtube\.com|(^|\.)youtu\.be/i.test(item.link)
      const hasValidDocLink = item.link && isValidHttpUrl(item.link) && !isYouTubeLink

      if (hasValidDocLink) {
        return item
      }

      const fallbackQuery = normalizedTopic
        ? `${item.title} ${normalizedTopic}`
        : item.title

      return {
        ...item,
        link: buildDocsSearchLink(fallbackQuery),
      }
    })
    .filter((item) => item.title && item.link && isValidHttpUrl(item.link))
}

function normalizeSuggestions(rawSuggestions, topic) {
  if (!rawSuggestions || typeof rawSuggestions !== 'object') {
    throw new Error('Invalid resource suggestion format received from AI.')
  }

  return {
    youtube: normalizeYouTubeItems(rawSuggestions.youtube),
    docs: normalizeDocsItems(rawSuggestions.docs, topic),
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

  return normalizeSuggestions(parsedSuggestions, normalizedTopic)
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
