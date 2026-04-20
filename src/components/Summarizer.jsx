import { useState } from 'react'
import { summarizeText } from '../services/aiService'

function Summarizer({ onClose }) {
  const [text, setText] = useState('')
  const [summary, setSummary] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSummarize = async (event) => {
    event.preventDefault()

    const normalizedText = text.trim()

    if (!normalizedText) {
      setError('Paste a long text to summarize.')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const bullets = await summarizeText(normalizedText)
      setSummary(bullets)
    } catch (summarizeError) {
      const message =
        summarizeError instanceof Error
          ? summarizeError.message
          : 'Failed to summarize text.'
      setError(message)
      setSummary([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Concept Summarizer</h2>
          <p className="mt-1 text-sm text-slate-600">
            Paste a long article or notes block and get a 3-bullet summary.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSummarize} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="summaryText">
            Long Text
          </label>
          <textarea
            id="summaryText"
            rows="8"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste article, chapter, or notes here..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Summarizing...' : 'Summarize'}
        </button>
      </form>

      {summary.length > 0 ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-semibold text-slate-900">3-Bullet Summary</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {summary.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

export default Summarizer