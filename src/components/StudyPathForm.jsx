import { useState } from 'react'
const initialFormValues = {
  goal: '',
  timeframe: '',
}

function StudyPathForm({
  studyPlan,
  isLoading,
  errorMessage,
  onGenerateStudyPlan,
}) {
  const [formValues, setFormValues] = useState(initialFormValues)
  const [errors, setErrors] = useState({})

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const nextErrors = {}
    const normalizedGoal = formValues.goal.trim()
    const timeframeValue = Number(formValues.timeframe)

    if (!normalizedGoal) {
      nextErrors.goal = 'Goal is required.'
    }

    if (!formValues.timeframe || timeframeValue <= 0) {
      nextErrors.timeframe = 'Timeframe must be greater than 0.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const payload = {
      goal: formValues.goal.trim(),
      timeframe: Number(formValues.timeframe),
    }

    try {
      await onGenerateStudyPlan(payload)
    } catch {
      // Error display is controlled by parent state.
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold text-slate-900">Study Path Generator</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your learning goal and timeframe to generate a personalized plan.
        </p>
        {errorMessage ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="goal" className="mb-1 block text-sm font-medium text-slate-700">
              Goal
            </label>
            <input
              id="goal"
              name="goal"
              type="text"
              value={formValues.goal}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="e.g., Learn React Hooks"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            {errors.goal ? (
              <p className="mt-1 text-xs text-red-600">{errors.goal}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="timeframe"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Timeframe (days)
            </label>
            <input
              id="timeframe"
              name="timeframe"
              type="number"
              min="1"
              value={formValues.timeframe}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="e.g., 5"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            {errors.timeframe ? (
              <p className="mt-1 text-xs text-red-600">{errors.timeframe}</p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {isLoading ? 'Generating...' : 'Generate Study Path'}
        </button>
      </form>

      {studyPlan.length > 0 ? (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <h3 className="text-base font-semibold text-slate-900">Generated Plan</h3>
          <ul className="mt-3 space-y-3">
            {studyPlan.map((item) => (
              <li
                key={item.day}
                className="rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-semibold text-slate-900">Day {item.day}</p>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
                  {item.topics.map((topic) => (
                    <li key={topic}>{topic}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

export default StudyPathForm
