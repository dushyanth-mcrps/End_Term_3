import ProgressSummary from '../components/dashboard/ProgressSummary'
import StudyAnalytics from '../components/dashboard/StudyAnalytics'
import SmartRevisionReminders from '../components/dashboard/SmartRevisionReminders'
import StudyPlanList from '../components/dashboard/StudyPlanList'
import { useDashboardProgress } from '../hooks/useDashboardProgress'

function DashboardPage() {
  const {
    studyPlan,
    isLoading,
    fetchError,
    syncError,
    isEmptyState,
    handleStatusChange,
    overdueTopics,
    pathSummaries,
    isDeletingPath,
    handleDeletePath,
    handleDeleteCompletedPaths,
  } = useDashboardProgress()

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Focus Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Track your study paths and update each topic as you progress.
      </p>
      {isLoading ? (
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Loading your study progress...
        </p>
      ) : null}
      {fetchError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </p>
      ) : null}
      {isEmptyState ? (
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          No study plan found. Generate one from the Home page first.
        </p>
      ) : null}
      {syncError ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {syncError}
        </p>
      ) : null}
      {studyPlan.length > 0 ? (
        <>
          <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Manage Study Paths</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Delete paths you no longer need or remove all completed paths.
                </p>
              </div>
              <button
                type="button"
                disabled={
                  isDeletingPath ||
                  !pathSummaries.some((summary) => summary.isCompleted)
                }
                onClick={handleDeleteCompletedPaths}
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete Completed Paths
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {pathSummaries.map((summary) => (
                <li
                  key={summary.pathId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{summary.pathGoal}</p>
                    <p className="text-xs text-slate-600">
                      {summary.completedTopics}/{summary.totalTopics} topics completed
                      {' · '}
                      {summary.totalDays} days
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isDeletingPath}
                    onClick={() => handleDeletePath(summary.pathId)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete Path
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <ProgressSummary studyPlan={studyPlan} />
          <StudyAnalytics studyPlan={studyPlan} />
          <SmartRevisionReminders overdueTopics={overdueTopics} />
          <StudyPlanList studyPlan={studyPlan} onStatusChange={handleStatusChange} />
        </>
      ) : null}
    </section>
  )
}

export default DashboardPage
