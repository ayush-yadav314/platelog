export default function PageHeader({ title, subtitle }) {
  return (
    <header className="page-head">
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </header>
  );
}