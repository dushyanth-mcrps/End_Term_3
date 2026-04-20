import StudyPathForm from '../components/StudyPathForm'
import { useStudyPlan } from '../hooks/useStudyPlan'

function HomePage() {
  const {
    studyPlan,
    isFetchingPlan,
    isGeneratingPlan,
    fetchError,
    saveError,
    isEmptyState,
    generateAndSavePlan,
  } = useStudyPlan()

  return (
    <section>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Home</h1>
        <p className="mt-2 text-slate-600">
          Welcome to your AI-powered Study Companion. Start building your learning
          path.
        </p>
      </div>
      <div className="mt-6 space-y-3">
        {isFetchingPlan ? (
          <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Loading your saved study plan...
          </p>
        ) : null}

        {fetchError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fetchError}
          </p>
        ) : null}

        {isEmptyState ? (
          <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            No saved plan yet. Generate a new study path to get started.
          </p>
        ) : null}
      </div>

      <StudyPathForm
        studyPlan={studyPlan}
        isLoading={isGeneratingPlan}
        errorMessage={saveError}
        onGenerateStudyPlan={generateAndSavePlan}
      />
    </section>
  )
}

export default HomePage
