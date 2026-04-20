import { useState } from 'react'
import ProgressSummary from '../components/dashboard/ProgressSummary'
import StudyPlanList from '../components/dashboard/StudyPlanList'

const initialStudyPlan = [
  {
    day: 1,
    topics: [
      { id: 'd1-t1', title: 'Intro to React Hooks', status: 'Completed' },
      { id: 'd1-t2', title: 'useState Fundamentals', status: 'In Progress' },
    ],
  },
  {
    day: 2,
    topics: [
      { id: 'd2-t1', title: 'useEffect and Side Effects', status: 'Not Started' },
      { id: 'd2-t2', title: 'Rules of Hooks', status: 'Not Started' },
    ],
  },
  {
    day: 3,
    topics: [
      { id: 'd3-t1', title: 'Custom Hooks Basics', status: 'Not Started' },
      { id: 'd3-t2', title: 'Practice Exercise', status: 'Not Started' },
    ],
  },
]

function DashboardPage() {
  const [studyPlan, setStudyPlan] = useState(initialStudyPlan)

  const handleStatusChange = (topicId, nextStatus) => {
    setStudyPlan((previousPlan) =>
      previousPlan.map((day) => ({
        ...day,
        topics: day.topics.map((topic) =>
          topic.id === topicId ? { ...topic, status: nextStatus } : topic,
        ),
      })),
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Focus Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Track your current study plan and update each topic as you progress.
      </p>
      <ProgressSummary studyPlan={studyPlan} />
      <StudyPlanList studyPlan={studyPlan} onStatusChange={handleStatusChange} />
    </section>
  )
}

export default DashboardPage
