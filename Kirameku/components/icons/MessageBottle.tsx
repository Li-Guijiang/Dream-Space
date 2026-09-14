export default function MessageBottle({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 120 192"
      fill="none"
      className={className}
    >
      <defs>
        {/* 瓶身玻璃 */}
        <linearGradient id="bg" x1="30" y1="65" x2="90" y2="172" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.25" />
          <stop offset="25%" stopColor="#bae6fd" stopOpacity="0.18" />
          <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.12" />
          <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.25" />
        </linearGradient>
        {/* 瓶内水 */}
        <linearGradient id="wt" x1="30" y1="118" x2="90" y2="168" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
        </linearGradient>
        {/* 瓶口 */}
        <linearGradient id="bm" x1="44" y1="58" x2="76" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
        </linearGradient>
        {/* 软木塞 */}
        <linearGradient id="ck" x1="42" y1="36" x2="78" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e8c888" />
          <stop offset="30%" stopColor="#d4a056" />
          <stop offset="70%" stopColor="#c49046" />
          <stop offset="100%" stopColor="#a87838" />
        </linearGradient>
        {/* 卷轴 */}
        <linearGradient id="sc" x1="0" y1="0" x2="24" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef9ef" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        {/* 蜡封 */}
        <radialGradient id="wx" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="60%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
        {/* 瓶身光泽 */}
        <linearGradient id="gl" x1="40" y1="70" x2="50" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="40%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* 阴影滤镜 */}
        <filter id="ds" x="-20%" y="-10%" width="140%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dy="4" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.12" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* 瓶底阴影 */}
      <ellipse cx="60" cy="176" rx="30" ry="5" fill="rgba(0,0,0,0.1)" />

      {/* 瓶身 - 玻璃 */}
      <path
        d="M38 68 C38 68 28 88 28 118 C28 155 40 172 60 172 C80 172 92 155 92 118 C92 88 82 68 82 68"
        fill="url(#bg)"
        stroke="rgba(148,163,184,0.35)"
        strokeWidth="1.2"
      />

      {/* 瓶内水 */}
      <path
        d="M33 118 C33 118 31 134 36 148 C42 160 50 168 60 168 C70 168 78 160 84 148 C89 134 87 118 87 118 Z"
        fill="url(#wt)"
      />

      {/* 水面波纹 */}
      <path
        d="M35 120 Q48 116 60 120 Q72 124 85 120"
        fill="none"
        stroke="rgba(56,189,248,0.25)"
        strokeWidth="0.8"
      />
      <path
        d="M36 123 Q50 119 62 123 Q74 127 84 123"
        fill="none"
        stroke="rgba(56,189,248,0.15)"
        strokeWidth="0.5"
      />

      {/* 瓶中信 - 卷轴 */}
      <g transform="translate(47, 96) rotate(-12)">
        {/* 卷轴主体 */}
        <rect x="0" y="0" width="26" height="18" rx="3" fill="url(#sc)" stroke="#d4a056" strokeWidth="0.6" />
        {/* 卷轴上的字迹 */}
        <line x1="4" y1="4" x2="22" y2="4" stroke="#c4956a" strokeWidth="0.5" opacity="0.7" />
        <line x1="4" y1="7" x2="18" y2="7" stroke="#c4956a" strokeWidth="0.5" opacity="0.6" />
        <line x1="4" y1="10" x2="20" y2="10" stroke="#c4956a" strokeWidth="0.5" opacity="0.5" />
        <line x1="4" y1="13" x2="14" y2="13" stroke="#c4956a" strokeWidth="0.5" opacity="0.4" />
        {/* 卷轴两端圆柱 */}
        <circle cx="0" cy="9" r="3.5" fill="#e8c888" stroke="#c49046" strokeWidth="0.5" />
        <circle cx="0" cy="9" r="1.5" fill="#f5d98a" opacity="0.5" />
        <circle cx="26" cy="9" r="3.5" fill="#e8c888" stroke="#c49046" strokeWidth="0.5" />
        <circle cx="26" cy="9" r="1.5" fill="#f5d98a" opacity="0.5" />
      </g>

      {/* 蜡封 */}
      <circle cx="60" cy="106" r="6" fill="url(#wx)" stroke="#991b1b" strokeWidth="0.5" opacity="0.85" />
      <text x="60" y="109" textAnchor="middle" fontSize="6" fill="#fef2f2" fontWeight="bold" opacity="0.8">♥</text>

      {/* 瓶口 */}
      <rect x="44" y="56" width="32" height="14" rx="2" fill="url(#bm)" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8" />
      {/* 瓶口高光 */}
      <rect x="46" y="57" width="28" height="3" rx="1" fill="rgba(255,255,255,0.25)" />

      {/* 软木塞 */}
      <rect x="41" y="34" width="38" height="24" rx="5" fill="url(#ck)" stroke="rgba(160,120,60,0.4)" strokeWidth="0.8" />
      {/* 软木塞纹理 */}
      <line x1="47" y1="38" x2="47" y2="54" stroke="rgba(140,100,50,0.2)" strokeWidth="0.5" />
      <line x1="53" y1="36" x2="53" y2="56" stroke="rgba(140,100,50,0.15)" strokeWidth="0.5" />
      <line x1="60" y1="37" x2="60" y2="55" stroke="rgba(140,100,50,0.2)" strokeWidth="0.5" />
      <line x1="67" y1="38" x2="67" y2="54" stroke="rgba(140,100,50,0.15)" strokeWidth="0.5" />
      <line x1="73" y1="39" x2="73" y2="53" stroke="rgba(140,100,50,0.12)" strokeWidth="0.5" />
      {/* 软木塞高光 */}
      <rect x="44" y="36" width="20" height="4" rx="2" fill="rgba(255,255,255,0.15)" />

      {/* 瓶身主反光 */}
      <path
        d="M44 74 C44 74 40 96 40 118 C40 140 42 156 48 164"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* 瓶身副反光 */}
      <path
        d="M76 78 C76 78 78 100 78 120 C78 138 76 150 72 158"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* 瓶口反光 */}
      <ellipse cx="60" cy="62" rx="12" ry="2" fill="rgba(255,255,255,0.15)" />

      {/* 小气泡 */}
      <circle cx="50" cy="142" r="2.5" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <circle cx="70" cy="136" r="1.8" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
      <circle cx="56" cy="150" r="1.2" fill="rgba(255,255,255,0.18)" />
      <circle cx="64" cy="146" r="0.8" fill="rgba(255,255,255,0.15)" />
      <circle cx="46" cy="134" r="1.5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
    </svg>
  );
}
