import { useData } from "../DataContext";
import MuscleDonut from "../components/MuscleDonut";
import PageHeader from "../components/PageHeader";
import ProgressCharts from "../components/ProgressCharts";

export default function Progress() {
  const { workouts, exercises } = useData();

  return (
    <>
      <PageHeader
        title="Progress"
        subtitle="Your weekly volume, top weights and training balance."
      />
      <ProgressCharts workouts={workouts} exercises={exercises} />
      <MuscleDonut workouts={workouts} exercises={exercises} />
    </>
  );
}