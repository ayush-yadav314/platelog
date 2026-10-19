import Logo from "../Logo";

const PLATES = [
  { color: "red", i: 0 },
  { color: "blue", i: 1 },
  { color: "yellow", i: 2 },
  { color: "green", i: 3 },
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <section className="auth-hero">
        <Logo />

        <div className="hero-main">
          <h2 className="hero-title">
            Log every set.
            <br />
            Beat last week.
          </h2>

          <div className="barbell" aria-hidden="true">
            <div className="rod" />
            {[...PLATES].reverse().map((p) => (
              <span
                key={`l-${p.color}`}
                className={`plate plate-${p.color} from-left`}
                style={{ "--i": p.i }}
              />
            ))}
            <span className="barbell-gap" />
            {PLATES.map((p) => (
              <span
                key={`r-${p.color}`}
                className={`plate plate-${p.color} from-right`}
                style={{ "--i": p.i }}
              />
            ))}
          </div>

          <ul className="hero-points">
            <li>Log sets in seconds</li>
            <li>Charts show your weekly volume and top weights</li>
            <li>The AI coach suggests your next session</li>
          </ul>
        </div>
      </section>

      <section className="auth-side">{children}</section>
    </div>
  );
}