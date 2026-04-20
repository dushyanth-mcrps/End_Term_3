import StudyDayCard from './StudyDayCard'

function StudyPlanList({ studyPlan, onStatusChange }) {
  return (
    <div className="mt-6 space-y-4">
      {studyPlan.map((dayPlan) => (
        <StudyDayCard
          key={dayPlan.day}
          dayPlan={dayPlan}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}

export default StudyPlanList
