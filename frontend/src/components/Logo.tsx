import { useEffect, useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showLabel = false, className = '' }: LogoProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const dimensions = {
    sm: { container: 'w-8 h-8', svg: 'w-5 h-5', text: 'text-sm' },
    md: { container: 'w-10 h-10', svg: 'w-6 h-6', text: 'text-base' },
    lg: { container: 'w-14 h-14', svg: 'w-8 h-8', text: 'text-xl' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${dimensions.container} flex-shrink-0 group cursor-pointer`}>
        {/* Deep ambient glow layer */}
        <div className={`absolute -inset-1 bg-gradient-to-tr from-accent via-sky-500 to-blue-600 rounded-custom-12 blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500 ${mounted ? 'animate-pulse' : ''}`} />
        
        {/* Core Glass Container */}
        <div className="relative w-full h-full rounded-custom-12 bg-gradient-to-br from-[#0f172a]/90 via-[#0a0a0a]/90 to-[#050505]/90 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden backdrop-blur-xl transition-all duration-300 group-hover:border-white/25 group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] group-hover:-translate-y-0.5">
          
          {/* Top highlight for 3D effect */}
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          {/* Premium Abstract SVG (Intersecting geometric shapes) */}
          <svg
            className={`${dimensions.svg} transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(37,99,235,0.6)]`}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoPrimary" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="logoSecondary" x1="40" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background geometric shape */}
            <path
              d="M12 12L28 8L32 24L16 28Z"
              fill="url(#logoSecondary)"
              fillOpacity="0.7"
              className="origin-center transition-transform duration-700 ease-out group-hover:rotate-12"
            />
            
            {/* Foreground overlapping shape */}
            <path
              d="M8 20L24 16L28 32L12 36Z"
              fill="url(#logoPrimary)"
              filter="url(#glow)"
              className="origin-center transition-transform duration-700 ease-out group-hover:-rotate-12"
            />
            
            {/* Center glowing core */}
            <circle 
              cx="20" 
              cy="20" 
              r="4" 
              fill="#ffffff" 
              className="opacity-90 drop-shadow-[0_0_4px_#fff]"
            />
            
            {/* Tech accents */}
            <circle cx="28" cy="8" r="1.5" fill="#38bdf8" className="animate-ping" />
            <circle cx="28" cy="8" r="1.5" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {showLabel && (
        <div className="leading-tight flex flex-col justify-center">
          <p className={`${dimensions.text} font-bold tracking-tight text-white dark:text-white flex items-center gap-1.5 font-sans`}>
            Fundsroom
          </p>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent/80">
            Operations
          </span>
        </div>
      )}
    </div>
  );
}
