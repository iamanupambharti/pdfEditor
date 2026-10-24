import React from 'react';

interface BrandLogoProps {
  size?: number; // Size in px, default 24
  showWordmark?: boolean;
  showProBadge?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 24,
  showWordmark = true,
  showProBadge = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Mark: Rounded square with 3 bars, bottom bar struck through in rose */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105"
        aria-hidden="true"
      >
        {/* Background container: radius 28% (~9px) */}
        <rect width="32" height="32" rx="9" fill="url(#brandGradient)" />
        <rect width="32" height="32" rx="9" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
        
        {/* Stack of 3 horizontal bars of decreasing length */}
        {/* Bar 1: Top (length 18, y=9) */}
        <rect x="7" y="8.5" width="18" height="2.75" rx="1.375" fill="#FFFFFF" fillOpacity="0.95" />
        
        {/* Bar 2: Middle (length 14, y=14.5) */}
        <rect x="7" y="14.5" width="14" height="2.75" rx="1.375" fill="#CBD5E1" fillOpacity="0.9" />
        
        {/* Bar 3: Bottom (length 10, y=20.5) struck through with rose prune line */}
        <rect x="7" y="20.5" width="10" height="2.75" rx="1.375" fill="#94A3B8" fillOpacity="0.55" />
        {/* Rose strike-through cut line */}
        <line x1="5.5" y1="23.5" x2="18.5" y2="20.5" stroke="#FB7185" strokeWidth="1.75" strokeLinecap="round" />

        <defs>
          <linearGradient id="brandGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5" />
            <stop offset="1" stopColor="#312E81" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark: "FocusDeck" + PDF pill */}
      {showWordmark && (
        <div className="flex items-center gap-1.5 font-sans">
          <span className="font-semibold text-sm tracking-[-0.02em] text-white">
            Focus<span className="text-indigo-400">Deck</span>
          </span>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            PDF
          </span>
          {showProBadge && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-1 py-0.2 rounded bg-white text-slate-950 shadow-sm ml-0.5">
              PRO
            </span>
          )}
        </div>
      )}
    </div>
  );
};
