const statusOptions = ['Not Started', 'In Progress', 'Completed']

function isRevisionDue(lastStudiedAt) {
  if (!lastStudiedAt) {
    return true
  }

  const studiedDate = new Date(lastStudiedAt)
  if (Number.isNaN(studiedDate.getTime())) {
    return false
  }

  const hoursSinceStudy = (Date.now() - studiedDate.getTime()) / (60 * 60 * 1000)
  return hoursSinceStudy >= 48
}

function StudyDayCard({ dayPlan, onStatusChange }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold text-slate-900">Day {dayPlan.day}</h2>
      <ul className="mt-3 space-y-3">
        {dayPlan.topics.map((topic) => (
          <li
            key={topic.id}
            className={`rounded-md border p-3 sm:flex sm:items-center sm:justify-between ${
              isRevisionDue(topic.lastStudiedAt)
                ? 'border-amber-300 bg-amber-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-800">{topic.title}</p>
                {isRevisionDue(topic.lastStudiedAt) ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                    Review
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Last studied:{' '}
                {topic.lastStudiedAt
                  ? new Date(topic.lastStudiedAt).toLocaleString()
                  : 'Not studied yet'}
              </p>
            </div>
            <div className="mt-2 sm:mt-0">
              <label className="sr-only" htmlFor={topic.id}>
                Update status for {topic.title}
              </label>
              <select
                id={topic.id}
                value={topic.status}
                onChange={(event) => onStatusChange(topic.id, event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-auto"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default StudyDayCard
