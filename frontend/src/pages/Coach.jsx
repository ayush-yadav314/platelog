import { useData } from "../DataContext";
import CoachPanel from "../components/CoachPanel";
import PageHeader from "../components/PageHeader";

export default function Coach() {
  const { workouts } = useData();

  return (
    <>
      <PageHeader
        title="Coach"
        subtitle="Suggestions for your next session, based on your last 12 workouts. Only your workout log is sent to the AI service."
      />
      <CoachPanel hasWorkouts={workouts.length > 0} />
    </>
  );
}