export default function Logo() {
  return (
    <div className="brand">
      <svg className="brand-logo" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill="#14213d" />
        <rect x="6" y="18.5" width="28" height="3" rx="1.5" fill="#ffffff" />
        <rect x="7.5" y="9" width="5" height="22" rx="2.5" fill="#d62839" />
        <rect x="14" y="12" width="4" height="16" rx="2" fill="#ffc93c" />
        <rect x="27.5" y="9" width="5" height="22" rx="2.5" fill="#d62839" />
        <rect x="22" y="12" width="4" height="16" rx="2" fill="#ffc93c" />
      </svg>
      <span className="brand-name">PlateLog</span>
    </div>
  );
}