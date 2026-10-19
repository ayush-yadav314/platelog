import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useData } from "../DataContext";
import { Icon } from "../Icons";
import CountUp from "../components/CountUp";
import GoalCard from "../components/GoalCard";
import RecentPRs from "../components/RecentPRs";
import Reveal from "../components/Reveal";
import VolumeMini from "../components/VolumeMini";
import WorkoutCard from "../components/WorkoutCard";
import {
  computePRs,
  daysAgoLabel,
  thisWeekStats,
  weekStreak,
} from "../workoutUtils";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { workouts, exercises } = useData();
  const names = useMemo(
    () => Object.fromEntries(exercises.map((e) => [e.id, e.name])),
    [exercises]
  );
  const prs = useMemo(() => computePRs(workouts), [workouts]);
  const week = thisWeekStats(workouts);
  const streak = weekStreak(workouts);
  const latest = workouts[0];

  if (!latest) {
    return (
      <>
        <section className="hero hero-lg">
          <h1>{greeting()}. Let's log your first workout.</h1>
          <p>
            Once you log a session, your charts, personal records and coaching
            tips start working.
          </p>
          <Link className="btn btn-light" to="/log">
            <Icon name="plus" size={18} />
            Log your first workout
          </Link>
        </section>

        <ol className="steps">
          <li>
            <strong>Pick an exercise</strong>
            <span className="muted">Choose from the starter list.</span>
          </li>
          <li>
            <strong>Add reps and weight</strong>
            <span className="muted">Use Add set to copy the previous row.</span>
          </li>
          <li>
            <strong>Save it</strong>
            <span className="muted">
              Your progress shows up on the Progress page.
            </span>
          </li>
        </ol>
      </>
    );
  }

  return (
    <>
      <section className="hero hero-lg">
        <h1>{greeting()}. Ready for your next session?</h1>
        <p>Your last workout was {daysAgoLabel(latest.date)}.</p>
        <Link className="btn btn-light" to="/log">
          <Icon name="plus" size={18} />
          Log a workout
        </Link>
      </section>

      <section className="stats">
        <Reveal className="stat-card" delay={0.05}>
          <div className="stat-icon red">
            <Icon name="dumbbell" />
          </div>
          <div>
            <div className="stat-value">
              <CountUp value={workouts.length} />
            </div>
            <div className="stat-label">Workouts logged</div>
          </div>
        </Reveal>
        <Reveal className="stat-card" delay={0.12}>
          <div className="stat-icon blue">
            <Icon name="calendar" />
          </div>
          <div>
            <div className="stat-value">
              <CountUp value={week.sessions} />
            </div>
            <div className="stat-label">Sessions this week</div>
          </div>
        </Reveal>
        <Reveal className="stat-card" delay={0.19}>
          <div className="stat-icon yellow">
            <Icon name="chart" />
          </div>
          <div>
            <div className="stat-value">
              <CountUp value={week.volume} />
            </div>
            <div className="stat-label">kg lifted this week</div>
          </div>
        </Reveal>
      </section>

      <div className="home-grid">
        <div className="home-main">
          <Reveal delay={0.24}>
            <VolumeMini workouts={workouts} />
          </Reveal>

          <div className="section-head">
            <h2>Latest workout</h2>
            <Link to="/history">See all history</Link>
          </div>
          <Reveal delay={0.3}>
            <WorkoutCard
              workout={latest}
              names={names}
              prs={prs.get(latest.id)}
            />
          </Reveal>
        </div>

        <aside className="home-rail">
          <Reveal delay={0.24}>
            <GoalCard sessions={week.sessions} streak={streak} />
          </Reveal>
          <Reveal delay={0.3}>
            <RecentPRs workouts={workouts} names={names} />
          </Reveal>
          <Reveal delay={0.36}>
            <div className="panel teaser">
              <div className="stat-icon yellow">
                <Icon name="sparkles" />
              </div>
              <div className="teaser-text">
                <h2>Coach</h2>
                <p className="muted">
                  Get a suggestion for your next session.
                </p>
              </div>
              <Link className="btn secondary" to="/coach">
                Open coach
              </Link>
            </div>
          </Reveal>
        </aside>
      </div>
    </>
  );
}