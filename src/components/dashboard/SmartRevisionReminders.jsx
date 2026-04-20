import { useMemo } from 'react'

const REVISION_THRESHOLD_HOURS = 48

function formatLastStudied(lastStudiedAt) {
  if (!lastStudiedAt) {
    return 'Not studied yet'
  }

  const studiedDate = new Date(lastStudiedAt)
  if (Number.isNaN(studiedDate.getTime())) {
    return 'Unknown date'
  }

  return studiedDate.toLocaleString()
}

function SmartRevisionReminders({ overdueTopics }) {
  const revisionSummary = useMemo(() => {
    const dueTopics = overdueTopics.length
    const urgentTopics = overdueTopics.filter((topic) => !topic.lastStudiedAt).length

    return {
      dueTopics,
      urgentTopics,
      revisionThresholdHours: REVISION_THRESHOLD_HOURS,
    }
  }, [overdueTopics])

  return (
    <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-amber-950">Smart Revision Reminders</h2>
          <p className="mt-1 text-sm text-amber-900/80">
            Topics not studied in {revisionSummary.revisionThresholdHours} hours are highlighted
            so you can revisit them quickly.
          </p>
        </div>
        <div className="rounded-md bg-white px-3 py-2 text-sm font-medium text-amber-900">
          {revisionSummary.dueTopics} due
        </div>
      </div>

      {overdueTopics.length > 0 ? (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {overdueTopics.map((topic) => (
            <li key={topic.id} className="rounded-md border border-amber-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
                  <p className="text-xs text-slate-500">Day {topic.day}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                  Review now
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Last studied: {formatLastStudied(topic.lastStudiedAt)}
              </p>
              {topic.status === 'Not Started' ? (
                <p className="mt-2 text-xs font-medium text-amber-800">
                  This topic has not been started yet.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-md border border-amber-200 bg-white px-4 py-3 text-sm text-amber-950">
          Great job. No topics need revision right now.
        </p>
      )}
    </section>
  )
}

export default SmartRevisionReminders