/** Иллюстрация оператора поддержки в наушниках для кнопки виджета */
export function OperatorLauncherAvatar() {
  return (
    <svg
      className="chat-launcher__avatar"
      viewBox="0 0 64 64"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <clipPath id="launcher-avatar-clip">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <linearGradient id="launcher-bg" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#7df9ff" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
        <linearGradient id="launcher-shirt" x1="16" y1="48" x2="48" y2="64">
          <stop offset="0%" stopColor="#00f5b8" />
          <stop offset="100%" stopColor="#00b4ff" />
        </linearGradient>
        <linearGradient id="launcher-phones" x1="8" y1="28" x2="56" y2="44">
          <stop offset="0%" stopColor="#ff47da" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
      </defs>
      <g clipPath="url(#launcher-avatar-clip)">
        <rect width="64" height="64" fill="url(#launcher-bg)" />
        <ellipse cx="32" cy="58" rx="22" ry="14" fill="url(#launcher-shirt)" />
        <ellipse cx="32" cy="34" rx="14" ry="16" fill="#ffd4b8" />
        <path
          d="M18 30c2-10 10-16 14-16s12 6 14 16c-3-2-7-3-14-3s-11 1-14 3z"
          fill="#5c2d0e"
        />
        <path
          d="M16 34c0-10 7-18 16-18s16 8 16 18"
          fill="none"
          stroke="url(#launcher-phones)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect x="10" y="29" width="9" height="15" rx="3.5" fill="#ff47da" />
        <rect x="45" y="29" width="9" height="15" rx="3.5" fill="#00e5ff" />
        <rect x="11.5" y="31" width="6" height="11" rx="2" fill="#ffe8f7" />
        <rect x="46.5" y="31" width="6" height="11" rx="2" fill="#e0fcff" />
        <ellipse cx="26" cy="36" rx="2" ry="2.4" fill="#1e293b" />
        <ellipse cx="38" cy="36" rx="2" ry="2.4" fill="#1e293b" />
        <path
          d="M28 42c2 2 6 2 8 0"
          fill="none"
          stroke="#ff8fab"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
