export function TukTukIcon({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} aria-label="Tuk-tuk illustration">
      <g fill="none" fillRule="evenodd">
        {/* canopy */}
        <path
          d="M40 70 Q40 30 80 30 L140 30 Q180 30 180 70 L180 85 L40 85 Z"
          fill="#1F2937"
        />
        {/* body */}
        <path
          d="M20 85 L190 85 L185 130 L25 130 Z"
          fill="#FACC15"
          stroke="#CA8A04"
          strokeWidth="2"
        />
        {/* front windshield */}
        <path d="M155 40 L175 40 L178 70 L152 70 Z" fill="#93C5FD" />
        {/* side window */}
        <path d="M85 40 L135 40 L138 70 L82 70 Z" fill="#93C5FD" />
        {/* wheels */}
        <circle cx="55" cy="130" r="18" fill="#111827" />
        <circle cx="55" cy="130" r="8" fill="#9CA3AF" />
        <circle cx="155" cy="130" r="18" fill="#111827" />
        <circle cx="155" cy="130" r="8" fill="#9CA3AF" />
        {/* headlight */}
        <circle cx="188" cy="100" r="5" fill="#FEF08A" />
      </g>
    </svg>
  );
}

export function TaxiIcon({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-label="Taxi illustration">
      <g fill="none" fillRule="evenodd">
        {/* body */}
        <path
          d="M15 90 L30 60 L70 55 L130 55 L170 60 L190 90 L190 115 L10 115 L10 90 Z"
          fill="#FACC15"
          stroke="#CA8A04"
          strokeWidth="2"
        />
        {/* cabin */}
        <path d="M35 60 L70 58 L125 58 L160 60 L150 85 L40 85 Z" fill="#FDE047" />
        {/* windows */}
        <path d="M45 65 L70 62 L70 82 L42 82 Z" fill="#93C5FD" />
        <path d="M78 62 L118 62 L118 82 L78 82 Z" fill="#93C5FD" />
        <path d="M126 62 L150 65 L148 82 L126 82 Z" fill="#93C5FD" />
        {/* taxi sign */}
        <rect x="85" y="45" width="30" height="10" rx="2" fill="#111827" />
        <text x="100" y="53" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">
          TAXI
        </text>
        {/* wheels */}
        <circle cx="45" cy="115" r="16" fill="#111827" />
        <circle cx="45" cy="115" r="7" fill="#9CA3AF" />
        <circle cx="155" cy="115" r="16" fill="#111827" />
        <circle cx="155" cy="115" r="7" fill="#9CA3AF" />
        {/* lights */}
        <path d="M10 95 L15 95 L15 105 L10 105 Z" fill="#FEF08A" />
        <path d="M190 95 L185 95 L185 105 L190 105 Z" fill="#EF4444" />
      </g>
    </svg>
  );
}
