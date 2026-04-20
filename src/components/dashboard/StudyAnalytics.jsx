import { useEffect, useMemo, useState } from 'react'

function parseDateValue(value) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function getLiveMinutes(topic, currentTimeMs) {
  const savedMinutes = Number(topic.timeSpentMinutes ?? 0)

  if (topic.status !== 'In Progress') {
    return savedMinutes
  }

  const startedAt = parseDateValue(topic.startedAt)
  if (!startedAt) {
    return savedMinutes
  }

  const elapsedMs = Math.max(0, currentTimeMs - startedAt.getTime())
  if (elapsedMs === 0) {
    return savedMinutes
  }

  const liveMinutes = Math.max(1, Math.ceil(elapsedMs / 60000))
  return savedMinutes + liveMinutes
}

function formatMinutes(minutes) {
  if (minutes <= 0) {
    return '0 min'
  }

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function StudyAnalytics({ studyPlan }) {
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now())
    }, 30 * 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const analytics = useMemo(() => {
    const topics = studyPlan.flatMap((dayEntry) =>
      dayEntry.topics.map((topic) => ({
        ...topic,
        day: dayEntry.day,
      })),
    )

    const totalTopics = topics.length
    const completedTopics = topics.filter((topic) => topic.status === 'Completed').length
    const inProgressTopics = topics.filter((topic) => topic.status === 'In Progress').length
    const notStartedTopics = topics.filter((topic) => topic.status === 'Not Started').length

    const completionRate =
      totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)

    const timeSpentPerTopic = topics
      .map((topic) => ({
        id: topic.id,
        title: topic.title,
        day: topic.day,
        minutes: getLiveMinutes(topic, currentTimeMs),
        status: topic.status,
      }))
      .sort((firstTopic, secondTopic) => secondTopic.minutes - firstTopic.minutes)

    const completionTrends = studyPlan.map((dayEntry) => {
      const dayTopics = dayEntry.topics
      const completedCount = dayTopics.filter((topic) => topic.status === 'Completed').length
      const completionPercentage =
        dayTopics.length === 0 ? 0 : Math.round((completedCount / dayTopics.length) * 100)

      return {
        day: dayEntry.day,
        totalTopics: dayTopics.length,
        completedCount,
        completionPercentage,
      }
    })

    return {
      totalTopics,
      completedTopics,
      inProgressTopics,
      notStartedTopics,
      completionRate,
      timeSpentPerTopic,
      completionTrends,
    }
  }, [studyPlan, currentTimeMs])

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Analytics</h2>
          <p className="mt-1 text-sm text-slate-600">
            Memoized metrics for time spent per topic and completion trends.
          </p>
        </div>
        <div className="rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
          {analytics.completionRate}% overall completion
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topics</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{analytics.totalTopics}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {analytics.completedTopics}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            In Progress
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {analytics.inProgressTopics}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Not Started
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {analytics.notStartedTopics}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Time Spent Per Topic</h3>
          <ul className="mt-3 space-y-3">
            {analytics.timeSpentPerTopic.map((topic) => (
              <li key={topic.id} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{topic.title}</p>
                    <p className="text-xs text-slate-500">
                      Day {topic.day} · {topic.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                    {formatMinutes(topic.minutes)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Completion Trends</h3>
          <div className="mt-3 space-y-3">
            {analytics.completionTrends.map((dayEntry) => (
              <div key={dayEntry.day} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <p className="font-medium text-slate-900">Day {dayEntry.day}</p>
                  <p className="text-slate-600">
                    {dayEntry.completedCount}/{dayEntry.totalTopics} completed
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${dayEntry.completionPercentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {dayEntry.completionPercentage}% completion for this day
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default StudyAnalytics