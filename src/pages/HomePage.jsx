import StudyPathForm from '../components/StudyPathForm'

function HomePage() {
  return (
    <section>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Home</h1>
        <p className="mt-2 text-slate-600">
          Welcome to your AI-powered Study Companion. Start building your learning
          path.
        </p>
      </div>
      <StudyPathForm />
    </section>
  )
}

export default HomePage
