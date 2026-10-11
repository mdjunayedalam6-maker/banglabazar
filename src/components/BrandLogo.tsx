import React from 'react';
import brandAppIcon from '../assets/images/bangla_bazar_app_icon_1791721630543.jpg';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: 'dark' | 'light';
  onClick?: () => void;
  className?: string;
  showSubtitle?: boolean;
}

/**
 * High-fidelity vector SVG Emblem reproducing the exact logo:
 * - Dynamic Lime & Forest Green shopping cart with wheels and motion speed trails
 * - Sculpted crimson-red Bengali letter 'ব' in glossy 3D curve
 * - Warm orange/golden shopping bag with white/yellow handle
 * - Fresh organic green leaves sprouting from the top
 */
export const BanglaBazarEmblem: React.FC<{ className?: string; isLight?: boolean }> = ({
  className = 'w-10 h-10',
  isLight = false,
}) => {
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="বাংলা বাজার লোগো প্রতীক"
    >
      <defs>
        {/* Cart Green Gradient */}
        <linearGradient id="bb-cart-green" x1="20" y1="80" x2="190" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#84CC16" />
        </linearGradient>

        {/* Dynamic Motion Trail Gradient */}
        <linearGradient id="bb-motion-green" x1="0" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#84CC16" stopOpacity="0" />
          <stop offset="60%" stopColor="#22C55E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>

        {/* Sculpted Red Bengali 'ব' Letter Gradient */}
        <linearGradient id="bb-red-bengali" x1="50" y1="60" x2="140" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF2E51" />
          <stop offset="35%" stopColor="#E11D48" />
          <stop offset="70%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* Gloss Top Highlight for 'ব' */}
        <linearGradient id="bb-red-highlight" x1="60" y1="70" x2="130" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFA4B2" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FF4D6D" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
        </linearGradient>

        {/* Orange Shopping Bag Gradient */}
        <linearGradient id="bb-bag-orange" x1="100" y1="40" x2="140" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Organic Green Leaves Gradient */}
        <linearGradient id="bb-leaf-green" x1="120" y1="45" x2="165" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#15803D" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>

        {/* Subtle Drop Shadow */}
        <filter id="bb-shadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.22" />
        </filter>
      </defs>

      <g filter="url(#bb-shadow)">
        {/* 1. Motion Speed Streaks on left */}
        <path d="M 8 122 C 24 122, 45 120, 68 116" stroke="url(#bb-motion-green)" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M 18 138 C 34 138, 55 136, 76 130" stroke="url(#bb-motion-green)" strokeWidth="6.5" strokeLinecap="round" />
        <path d="M 28 152 C 42 152, 60 150, 78 144" stroke="url(#bb-motion-green)" strokeWidth="5" strokeLinecap="round" />

        {/* 2. Shopping Cart Basket Framework */}
        <path
          d="M 64 102 L 146 102 C 158 102, 168 112, 165 124 L 157 150 C 154 158, 146 164, 137 164 L 88 164 C 80 164, 73 158, 71 150 L 60 92 L 48 92"
          stroke="url(#bb-cart-green)"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Trolley Basket Mesh Ribs */}
        <path d="M 76 122 L 158 122" stroke="url(#bb-cart-green)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 80 142 L 152 142" stroke="url(#bb-cart-green)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 94 104 L 90 162" stroke="url(#bb-cart-green)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 116 104 L 114 162" stroke="url(#bb-cart-green)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 138 104 L 136 162" stroke="url(#bb-cart-green)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Cart Bottom Curved Motion Sweep / Base Rail */}
        <path
          d="M 50 178 C 75 198, 125 204, 168 178 C 178 172, 185 160, 182 148 C 180 138, 172 130, 162 130"
          stroke="url(#bb-cart-green)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cart Wheels */}
        <g>
          {/* Back Wheel */}
          <circle cx="82" cy="184" r="14" fill="url(#bb-cart-green)" />
          <circle cx="82" cy="184" r="7.5" fill="#FFFFFF" />
          <circle cx="82" cy="184" r="3" fill="#16A34A" />

          {/* Front Wheel */}
          <circle cx="140" cy="184" r="14" fill="url(#bb-cart-green)" />
          <circle cx="140" cy="184" r="7.5" fill="#FFFFFF" />
          <circle cx="140" cy="184" r="3" fill="#16A34A" />
        </g>

        {/* 3. Orange Shopping Bag on Top */}
        <g>
          {/* Bag Body */}
          <path
            d="M 98 62 L 136 54 C 142 53, 148 57, 150 63 L 158 96 C 160 102, 155 108, 149 109 L 108 116 C 102 117, 96 112, 95 106 L 90 71 C 89 65, 93 63, 98 62 Z"
            fill="url(#bb-bag-orange)"
          />
          {/* Bag Fold / Perspective Shade */}
          <path
            d="M 98 62 L 108 60 L 105 116 L 95 106 Z"
            fill="#B45309"
            opacity="0.3"
          />
          {/* Bag Handle Curve */}
          <path
            d="M 112 59 C 112 40, 134 38, 136 54"
            stroke="#FDE68A"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 114 60 C 114 43, 132 41, 134 55"
            stroke="#EA580C"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* 4. Organic Green Leaves Sprouting */}
        <g>
          {/* Main Leaf */}
          <path
            d="M 148 58 C 148 35, 172 16, 178 18 C 180 28, 176 52, 155 60 Z"
            fill="url(#bb-leaf-green)"
          />
          {/* Side Leaf 1 */}
          <path
            d="M 142 52 C 130 38, 132 20, 138 22 C 144 32, 148 42, 145 53 Z"
            fill="url(#bb-leaf-green)"
          />
          {/* Side Leaf 2 */}
          <path
            d="M 158 58 C 172 48, 185 45, 188 52 C 182 62, 168 64, 158 58 Z"
            fill="url(#bb-leaf-green)"
          />
          {/* Leaf Vein */}
          <path d="M 152 56 C 160 42, 168 30, 175 22" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </g>

        {/* 5. Central Sculpted Bengali 'ব' Letter in Dynamic Crimson Red */}
        <g id="bengali-bo-glyph">
          {/* Main 3D Shape of 'ব' */}
          <path
            d="M 40 76 C 58 74, 98 72, 132 78 C 138 79, 142 84, 138 90 C 130 102, 114 116, 96 128 L 126 162 C 130 166, 126 172, 120 172 L 95 172 C 90 172, 86 169, 83 165 L 68 142 L 58 152 L 58 168 C 58 172, 54 176, 50 176 L 38 176 C 34 176, 30 172, 30 168 L 30 84 C 30 79, 34 76, 40 76 Z"
            fill="url(#bb-red-bengali)"
          />

          {/* Inner Loop / Counter of 'ব' */}
          <path
            d="M 58 96 L 102 96 C 108 96, 102 108, 92 118 L 68 118 C 62 118, 58 112, 58 106 Z"
            fill="#FFFFFF"
            opacity={isLight ? 0.95 : 0.98}
          />

          {/* Gloss Top Wing Highlight on 'ব' */}
          <path
            d="M 38 78 C 65 74, 105 74, 134 80 C 122 88, 100 88, 70 88 C 52 88, 42 84, 38 78 Z"
            fill="url(#bb-red-highlight)"
          />

          {/* Dynamic Red Sweep Point at Top-Left */}
          <path
            d="M 42 76 C 28 78, 18 84, 14 90 C 18 88, 28 85, 40 85 Z"
            fill="#E11D48"
          />
        </g>
      </g>
    </svg>
  );
};

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
      emblem: 'w-7 h-7 sm:w-8 sm:h-8',
      titleSize: 'text-base sm:text-lg',
      subSize: 'text-[9px] sm:text-[10px]',
      gap: 'gap-2',
      leafSize: 'w-3.5 h-3.5',
    },
    md: {
      emblem: 'w-9 h-9 sm:w-11 sm:h-11',
      titleSize: 'text-xl sm:text-2xl',
      subSize: 'text-[10.5px] sm:text-[11.5px]',
      gap: 'gap-2.5',
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
      {/* 1. Dynamic Logo Emblem Mark (User's Official 3D Cart App Icon) */}
      <div className={`relative shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-1 overflow-hidden rounded-2xl shadow-sm ${
        isLight ? 'bg-white/10 ring-1 ring-white/20 p-0.5' : 'bg-white ring-1 ring-slate-200/80 p-0.5'
      }`}>
        <img
          src={brandAppIcon}
          alt="বাংলা বাজার (Bangla Bazar)"
          className={`${sizeStyles.emblem} object-cover rounded-xl shrink-0`}
        />
      </div>

      {/* 2. Custom Designed Brand Typography reproducing the exact uploaded design */}
      <div className="flex flex-col justify-center leading-none">
        {/* Top Line: "বাংলা বাজার" with sprout leaves over "বাংলা" and vibrant green/red split */}
        <div className="relative flex items-center">
          {/* Leaves Blooming on top of "বাংলা" */}
          <span
            className="absolute -top-2.5 left-4 sm:left-5 text-emerald-600 dark:text-emerald-400 select-none pointer-events-none transform -translate-x-1/2 scale-90"
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
                  ? 'text-[#22C55E] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
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
                  ? 'text-[#FF4D6D] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
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
