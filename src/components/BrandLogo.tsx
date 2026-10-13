import React from 'react';
import brandLogoImg from '../assets/images/bangla_bazar_logo_trimmed.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: 'dark' | 'light';
  onClick?: () => void;
  className?: string;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  textColor = 'dark',
  onClick,
  className = '',
  showSubtitle = true,
}) => {
  const isLight = textColor === 'light';

  // Configured sizing scale for seamless header, drawer, and footer balance
  const sizeStyles = {
    sm: {
      emblem: 'w-8 h-8 sm:w-9 sm:h-9',
      titleSize: 'text-base sm:text-lg',
      subSize: 'text-[9px] sm:text-[10px]',
      gap: 'gap-2',
      leafSize: 'w-3.5 h-3.5',
    },
    md: {
      emblem: 'w-10 h-10 sm:w-12 sm:h-12',
      titleSize: 'text-xl sm:text-2xl',
      subSize: 'text-[10px] sm:text-[11px]',
      gap: 'gap-2.5 sm:gap-3',
      leafSize: 'w-4 h-4',
    },
    lg: {
      emblem: 'w-12 h-12 sm:w-14 sm:h-14',
      titleSize: 'text-2xl sm:text-3xl',
      subSize: 'text-xs sm:text-sm',
      gap: 'gap-3',
      leafSize: 'w-5 h-5',
    },
    xl: {
      emblem: 'w-16 h-16 sm:w-20 sm:h-20',
      titleSize: 'text-3xl sm:text-4xl',
      subSize: 'text-sm sm:text-base',
      gap: 'gap-3.5',
      leafSize: 'w-6 h-6',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${
        onClick ? 'cursor-pointer group transition-all duration-300 active:scale-95' : ''
      } ${sizeStyles.gap} ${className}`}
      title="বাংলা বাজার (Bangla Bazar) - সেরা অনলাইন মার্কেটপ্লেস"
    >
      {/* 1. Dynamic 3D Cart App Emblem - perfectly adjusted with transparent background */}
      <div
        className={`relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
          isLight
            ? 'filter drop-shadow-[0_4px_14px_rgba(34,197,94,0.35)]'
            : 'filter drop-shadow-[0_2px_8px_rgba(0,135,62,0.15)]'
        }`}
      >
        <img
          src={brandLogoImg}
          alt="বাংলা বাজার (Bangla Bazar)"
          className={`${sizeStyles.emblem} object-contain shrink-0`}
        />
      </div>

      {/* 2. Custom Designed Brand Typography - seamless optical alignment */}
      <div className="flex flex-col justify-center leading-none">
        {/* Top Line: "বাংলা বাজার" with sprout leaves directly over "বাংলা" */}
        <div className="relative flex items-center">
          {/* Leaves Blooming gracefully on top of "বাংলা" */}
          <span
            className="absolute -top-2.5 left-3 sm:left-4 select-none pointer-events-none transform -translate-x-1/2 scale-90"
            aria-hidden="true"
          >
            <svg viewBox="0 0 40 24" fill="none" className={sizeStyles.leafSize}>
              <path d="M 20 22 C 20 12, 10 4, 4 4 C 4 12, 12 18, 20 22 Z" fill="#16A34A" />
              <path d="M 20 22 C 20 9, 20 2, 20 2 C 20 2, 20 9, 20 22 Z" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 20 22 C 20 12, 30 4, 36 4 C 36 12, 28 18, 20 22 Z" fill="#22C55E" />
            </svg>
          </span>

          <span
            className={`font-black tracking-tight font-sans transition-colors ${sizeStyles.titleSize}`}
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {/* "বাংলা" in Rich Forest Green */}
            <span
              className={
                isLight
                  ? 'text-[#22C55E] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
                  : 'text-[#00873E] drop-shadow-[0_1px_1px_rgba(0,135,62,0.12)]'
              }
            >
              বাংলা
            </span>
            {/* Space */}
            <span className="inline-block w-1" />
            {/* "বাজার" in Vivid Crimson Red */}
            <span
              className={
                isLight
                  ? 'text-[#FF4D6D] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
                  : 'text-[#DC2626] drop-shadow-[0_1px_1px_rgba(220,38,38,0.15)]'
              }
            >
              বাজার
            </span>
          </span>
        </div>

        {/* Dynamic Curved Green Swoop Underline */}
        <div className="w-full -mt-0.5 mb-1 overflow-hidden">
          <svg viewBox="0 0 160 10" fill="none" className="w-full h-1.5 sm:h-2" preserveAspectRatio="none">
            <path
              d="M 2 3 C 45 9, 105 9, 158 1"
              stroke={isLight ? '#22C55E' : '#16A34A'}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Bottom Line: "— BANGLA BAZAAR —" with Green/Red separation */}
        {showSubtitle && (
          <div
            className={`flex items-center font-black tracking-wider uppercase transition-colors ${sizeStyles.subSize}`}
            style={{ letterSpacing: '0.12em' }}
          >
            <span className={isLight ? 'text-[#86EFAC]' : 'text-[#00873E]'}>
              — BANGLA&nbsp;
            </span>
            <span className={isLight ? 'text-[#FCA5A5]' : 'text-[#DC2626]'}>
              BAZAAR —
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
