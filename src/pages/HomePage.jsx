import { lazy, Suspense, useState } from 'react'
import StudyPathForm from '../components/StudyPathForm'
import { useStudyPlan } from '../hooks/useStudyPlan'

const Summarizer = lazy(() => import('../components/Summarizer'))

function HomePage() {
  const [isSummarizerOpen, setIsSummarizerOpen] = useState(false)
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

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Stretch Feature</h2>
            <p className="mt-1 text-sm text-slate-600">
              Open the AI Concept Summarizer only when you need it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSummarizerOpen((previous) => !previous)}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            {isSummarizerOpen ? 'Hide Summarizer' : 'Open Summarizer'}
          </button>
        </div>

        {isSummarizerOpen ? (
          <div className="mt-5">
            <Suspense
              fallback={
                <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Loading summarizer...
                </p>
              }
            >
              <Summarizer onClose={() => setIsSummarizerOpen(false)} />
            </Suspense>
          </div>
        ) : null}
      </section>
    </section>
  )
}

export default HomePage
