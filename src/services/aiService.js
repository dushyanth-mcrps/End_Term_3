// Mock mode: No API billing required for demo
// Uncomment the lines below and add your VITE_GEMINI_API_KEY to .env to use real Gemini API

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

// Mock data for demo (no API billing required)
function getMockStudyPlan(goal, timeframe) {
  const numDays = parseInt(timeframe) || 3
  
  // Topic progression templates for different subjects
  const topicProgression = {
    javascript: [
      ['Variables & Data Types', 'Basic Operators', 'Conditionals'],
      ['Functions & Scope', 'Arrow Functions', 'Closures'],
      ['Arrays & Methods', 'Objects & Prototypes', 'ES6 Features'],
      ['Promises & Async/Await', 'Error Handling', 'Debugging'],
      ['DOM Manipulation', 'Events & Listeners', 'Fetch API'],
    ],
    react: [
      ['Components & JSX', 'Props & State', 'Hooks Basics'],
      ['useEffect & Side Effects', 'Context API', 'Custom Hooks'],
      ['Performance Optimization', 'Error Boundaries', 'Testing'],
      ['Routing & Navigation', 'Form Handling', 'State Management'],
      ['Build & Deployment', 'Best Practices', 'Advanced Patterns'],
    ],
    python: [
      ['Syntax & Data Types', 'Lists & Dictionaries', 'Functions'],
      ['OOP Concepts', 'Inheritance & Polymorphism', 'Modules'],
      ['File Handling', 'Error Handling', 'Best Practices'],
      ['Libraries & Packages', 'Data Processing', 'Web Development'],
      ['Testing & Debugging', 'Performance Tuning', 'Real-world Projects'],
    ],
  }

  const key = goal.toLowerCase().split(' ')[0]
  const progression = topicProgression[key] || null

  // Generate plan based on available topic progression
  if (progression) {
    return Array.from({ length: numDays }, (_, i) => ({
      day: i + 1,
      topics: progression[i % progression.length] || [
        `${goal} - Day ${i + 1} Topics`,
        `Continued Learning - Part ${Math.floor(i / progression.length) + 1}`,
        `Practice & Reinforcement`,
      ],
    }))
  }

  // Default: generate unique topics for each day
  const topicCategories = [
    'Fundamentals & Basics',
    'Core Concepts & Principles',
    'Intermediate Techniques',
    'Advanced Strategies',
    'Practical Applications',
    'Best Practices & Optimization',
    'Real-world Projects',
    'Assessment & Review',
  ]

  return Array.from({ length: numDays }, (_, i) => ({
    day: i + 1,
    topics: [
      `Introduction to ${goal} - Day ${i + 1}`,
      `${topicCategories[i % topicCategories.length]} of ${goal}`,
      `Hands-on Practice: ${goal} Project`,
    ],
  }))
}

function getMockResources(topic) {
  return {
    youtube: [
      { title: `${topic} - Complete Tutorial`, link: 'https://www.youtube.com/results?search_query=' + topic },
      { title: `${topic} Explained Simply`, link: 'https://www.youtube.com/results?search_query=' + topic + ' tutorial' },
      { title: `${topic} Project Build`, link: 'https://www.youtube.com/results?search_query=' + topic + ' project' },
    ],
    docs: [
      { title: `${topic} Official Documentation`, link: 'https://developer.mozilla.org/en-US/search?q=' + topic },
      { title: `${topic} Best Practices Guide`, link: 'https://github.com/search?q=' + topic + '+best+practices' },
      { title: `${topic} Cheat Sheet`, link: 'https://www.google.com/search?q=' + topic + '+cheat+sheet' },
    ],
  }
}

function getMockSummary(text) {
  const normalizedText = String(text ?? '').replace(/\s+/g, ' ').trim()

  const sentences = normalizedText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  if (sentences.length >= 3) {
    return [
      `Key point: ${sentences[0]}`,
      `Important concept: ${sentences[1]}`,
      `Remember: ${sentences[2]}`,
    ]
  }

  const clauses = normalizedText
    .split(/[;,]\s+/)
    .map((clause) => clause.trim())
    .filter(Boolean)

  const fallbackPoints = [
    clauses[0] || normalizedText,
    clauses[1] || 'This topic includes important principles and laws.',
    clauses[2] || 'Review the applications and key takeaways for better recall.',
  ]

  return [
    `Key point: ${fallbackPoints[0]}`,
    `Important concept: ${fallbackPoints[1]}`,
    `Remember: ${fallbackPoints[2]}`,
  ]
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
  // Simulate API delay for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 800))
  
  const plan = getMockStudyPlan(goal, timeframe)
  return normalizePlan(plan)
}

export async function suggestResources(topic) {
  const normalizedTopic = String(topic ?? '').trim()

  if (!normalizedTopic) {
    throw new Error('Topic is required to suggest resources.')
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))
  
  const suggestions = getMockResources(normalizedTopic)
  return normalizeSuggestions(suggestions)
}

export async function summarizeText(inputText) {
  const normalizedText = String(inputText ?? '').trim()

  if (!normalizedText) {
    throw new Error('Text is required to generate a summary.')
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  const summary = getMockSummary(normalizedText)
  return summary
}
