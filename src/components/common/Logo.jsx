/**
 * PDF2Quiz AI — Brand Logo Component
 * Renders inline SVG icon + text. Sizes: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */
export default function Logo({ size = 'md', showText = true, className = '' }) {
  const dims = { xs: 24, sm: 28, md: 32, lg: 40, xl: 48 };
  const textSizes = { xs: 'text-sm', sm: 'text-base', md: 'text-xl', lg: 'text-2xl', xl: 'text-3xl' };
  const s = dims[size] || dims.md;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-lg"
      >
        {/* Background rounded square */}
        <rect width="48" height="48" rx="12" fill="url(#logo-grad)" />
        {/* PDF page shape */}
        <path
          d="M14 10h12l8 8v20a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z"
          fill="rgba(255,255,255,0.15)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
        />
        {/* Folded corner */}
        <path
          d="M26 10v8h8"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Arrow / lightning bolt (transform) */}
        <path
          d="M20 22l4-4 4 4M24 18v10"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
        />
        {/* Quiz checkmark */}
        <path
          d="M19 27l3 3 7-7"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* AI sparkle dots */}
        <circle cx="36" cy="14" r="1.5" fill="white" opacity="0.9" />
        <circle cx="39" cy="11" r="1" fill="white" opacity="0.6" />
        <circle cx="33" cy="11" r="1" fill="white" opacity="0.5" />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={`font-display font-black tracking-tight ${textSizes[size]}`}>
          <span className="text-teal-400">PDF</span>
          <span className="text-slate-300">2</span>
          <span className="text-white">Quiz</span>
          <span className="text-sky-400 ml-0.5 text-[0.7em] font-bold align-top">AI</span>
        </span>
      )}
    </span>
  );
}
