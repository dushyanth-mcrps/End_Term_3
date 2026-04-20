import ProgressSummary from '../components/dashboard/ProgressSummary'
import StudyPlanList from '../components/dashboard/StudyPlanList'
import ResourceVault from '../components/ResourceVault'
import { useDashboardProgress } from '../hooks/useDashboardProgress'
import { useResourceVault } from '../hooks/useResourceVault'

function DashboardPage() {
  const { studyPlan, isLoading, fetchError, syncError, isEmptyState, handleStatusChange } =
    useDashboardProgress()
  const {
    resources,
    isLoading: isResourcesLoading,
    error: resourcesError,
    aiSuggestions,
    isSuggestionsLoading,
    suggestionsError,
    suggestionTopic,
    createResource,
    updateResource,
    deleteResource,
    requestSuggestions,
  } = useResourceVault()

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Focus Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Track your current study plan and update each topic as you progress.
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
          <ProgressSummary studyPlan={studyPlan} />
          <StudyPlanList studyPlan={studyPlan} onStatusChange={handleStatusChange} />
        </>
      ) : null}
      <ResourceVault
        resources={resources}
        isLoading={isResourcesLoading}
        error={resourcesError}
        aiSuggestions={aiSuggestions}
        isSuggestionsLoading={isSuggestionsLoading}
        suggestionsError={suggestionsError}
        suggestionTopic={suggestionTopic}
        onAddResource={createResource}
        onEditResource={updateResource}
        onDeleteResource={deleteResource}
        onRequestSuggestions={requestSuggestions}
      />
    </section>
  )
}

export default DashboardPage
