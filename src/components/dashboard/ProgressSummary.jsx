import { useMemo } from 'react'

function ProgressSummary({ studyPlan }) {
  const progressMetrics = useMemo(() => {
    const topics = studyPlan.flatMap((day) => day.topics)
    const totalCount = topics.length
    const completedCount = topics.filter(
      (topic) => topic.status === 'Completed',
    ).length
    const inProgressCount = topics.filter(
      (topic) => topic.status === 'In Progress',
    ).length
    const notStartedCount = topics.filter(
      (topic) => topic.status === 'Not Started',
    ).length
    const completionPercentage =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

    return {
      totalCount,
      completedCount,
      inProgressCount,
      notStartedCount,
      completionPercentage,
    }
  }, [studyPlan])

  return (
    <div className="mt-6">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Overall Progress</p>
          <p className="text-sm font-medium text-slate-700">
            {progressMetrics.completedCount}/{progressMetrics.totalCount} completed
          </p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${progressMetrics.completionPercentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {progressMetrics.completionPercentage}% complete
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Completed
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {progressMetrics.completedCount}
        </p>
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          In Progress
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {progressMetrics.inProgressCount}
        </p>
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Not Started
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {progressMetrics.notStartedCount}
        </p>
      </div>
      </div>
    </div>
  )
}

export default ProgressSummary
