import React from 'react';

export interface BrandLogoProps {
  logoVariant?: string;
  logoImg?: string;
  storeName?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoVariant,
  logoImg,
  storeName = '',
  className = 'w-12 h-12'
}) => {
  // If an explicit SVG or dedicated logo data URI is provided, use it
  if (logoImg && (logoImg.startsWith('data:image/svg+xml') || logoImg.includes('brand-logo-official'))) {
    return (
      <div className={`${className} rounded-2xl overflow-hidden border border-slate-200 shadow-xs shrink-0 select-none bg-slate-950 flex items-center justify-center`}>
        <img src={logoImg} alt={storeName || 'Brand Logo'} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Infer variant from storeName if not provided
  const s = (storeName || '').toLowerCase();
  const variant = (logoVariant || '').toLowerCase() || (() => {
    if (s.includes('nike')) return 'nike';
    if (s.includes('zara')) return 'zara';
    if (s.includes('gucci')) return 'gucci';
    if (s.includes('prada')) return 'prada';
    if (s.includes('polo') || s.includes('us polo') || s.includes('u.s. polo')) return 'uspolo';
    if (s.includes('h&m') || s.includes('hm')) return 'hm';
    if (s.includes('hermes') || s.includes('hermès')) return 'hermes';
    if (s.includes('coach')) return 'coach';
    if (s.includes('bottega')) return 'bottega';
    if (s.includes('vuitton') || s.includes('lv')) return 'lv';
    if (s.includes('bvlgari') || s.includes('bulgari')) return 'bvlgari';
    if (s.includes('swarovski')) return 'swarovski';
    if (s.includes('tanishq')) return 'tanishq';
    if (s.includes('malabar')) return 'malabar';
    if (s.includes('apple')) return 'apple';
    if (s.includes('ray-ban') || s.includes('rayban')) return 'rayban';
    if (s.includes('oakley')) return 'oakley';
    if (s.includes('tom ford') || s.includes('tomford')) return 'tomford';
    if (s.includes('lenskart')) return 'lenskart';
    if (s.includes('rolex')) return 'rolex';
    if (s.includes('omega')) return 'omega';
    if (s.includes('tag heuer') || s.includes('tagheuer')) return 'tagheuer';
    if (s.includes('tissot')) return 'tissot';
    if (s.includes('titan') || s.includes('nebula')) return 'titan';
    if (s.includes('starbucks')) return 'starbucks';
    if (s.includes('tiffany')) return 'tiffany';
    if (s.includes('sephora')) return 'sephora';
    if (s.includes('cartier')) return 'cartier';
    if (s.includes('din tai fung') || s.includes('dintaifung')) return 'dintaifung';
    return 'default';
  })();

  // 1. NIKE FLAGSHIP
  if (variant === 'nike') {
    return (
      <div className={`${className} bg-black text-white rounded-2xl flex items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-2`} title="Nike">
        <svg viewBox="0 0 100 50" className="w-full h-full text-white fill-current">
          <text x="50%" y="40%" textAnchor="middle" dominantBaseline="middle" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="24" letterSpacing="-1">NIKE</text>
          <path d="M15 42 C 35 45, 65 38, 85 24 C 65 32, 40 35, 25 36 C 20 36, 17 38, 15 42 Z" fill="white" />
        </svg>
      </div>
    );
  }

  // 2. ZARA FLAGSHIP
  if (variant === 'zara') {
    return (
      <div className={`${className} bg-black text-white rounded-2xl flex items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1.5`} title="ZARA">
        <span className="font-serif font-black text-xs sm:text-sm tracking-[-0.05em] text-white uppercase transform scale-y-110">ZARA</span>
      </div>
    );
  }

  // 3. GUCCI BOUTIQUE
  if (variant === 'gucci') {
    return (
      <div className={`${className} bg-black text-[#d4af37] rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="GUCCI">
        <span className="font-serif font-medium text-[8px] tracking-[0.2em] text-[#d4af37] uppercase">GUCCI</span>
        <svg viewBox="0 0 40 24" className="w-6 h-3.5 text-[#d4af37] fill-none stroke-current stroke-[2.2] mt-0.5">
          <circle cx="15" cy="12" r="8" />
          <path d="M15 12 L21 12" />
          <circle cx="25" cy="12" r="8" />
          <path d="M25 12 L19 12" />
        </svg>
      </div>
    );
  }

  // 4. PRADA ATELIER
  if (variant === 'prada') {
    return (
      <div className={`${className} bg-black text-white rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="PRADA">
        <span className="font-serif font-extrabold text-[9px] tracking-[0.2em] text-white uppercase">PRADA</span>
        <span className="text-[5px] tracking-[0.25em] text-stone-300 font-sans uppercase font-bold mt-0.5">MILANO</span>
      </div>
    );
  }

  // 5. U.S. POLO ASSN.
  if (variant === 'uspolo' || variant === 'polo') {
    return (
      <div className={`${className} bg-[#0b1c3d] text-white rounded-2xl flex flex-col items-center justify-center border border-blue-950 shadow-md overflow-hidden relative shrink-0 select-none p-1.5`} title="U.S. Polo Assn.">
        <svg viewBox="0 0 30 30" className="w-6 h-6 text-white fill-current">
          <path d="M10 6 C10 4, 12 3, 14 4 C15 5, 15 7, 14 8 C13 9, 11 8, 10 6 Z M8 12 C10 10, 14 9, 17 11 C19 12, 21 15, 20 18 C19 21, 16 23, 13 22 C11 21, 8 18, 8 15 Z M18 8 L24 2 M12 22 L11 28 M17 22 L19 28 M6 16 L3 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 6. H&M FLAGSHIP
  if (variant === 'hm') {
    return (
      <div className={`${className} bg-white text-[#e50010] rounded-2xl flex items-center justify-center border border-slate-200 shadow-xs overflow-hidden relative shrink-0 select-none p-1`} title="H&M">
        <span className="font-sans font-black italic text-base sm:text-lg tracking-tighter text-[#e50010] transform -skew-x-6">H&M</span>
      </div>
    );
  }

  // 7. LOUIS VUITTON MAISON
  if (variant === 'lv') {
    return (
      <div className={`${className} bg-gradient-to-br from-amber-950 via-stone-900 to-neutral-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-800/40 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="LOUIS VUITTON">
        <span className="font-serif font-black text-xs sm:text-sm tracking-widest text-amber-300">LV</span>
        <span className="text-[6px] font-sans font-semibold text-amber-400/70 tracking-wider">PARIS</span>
      </div>
    );
  }

  // 8. HERMÈS LEATHER LOUNGE
  if (variant === 'hermes') {
    return (
      <div className={`${className} bg-[#f37021] text-white rounded-2xl flex flex-col items-center justify-center border border-orange-600 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="HERMÈS">
        <span className="font-serif font-black text-[9px] tracking-widest text-white uppercase">HERMÈS</span>
        <span className="text-[6px] tracking-widest text-orange-100 font-sans uppercase">PARIS</span>
      </div>
    );
  }

  // 9. COACH NEW YORK
  if (variant === 'coach') {
    return (
      <div className={`${className} bg-stone-900 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-stone-700 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="COACH">
        <span className="font-serif font-black text-[10px] tracking-widest text-amber-200 uppercase">COACH</span>
        <span className="text-[5px] tracking-wider text-stone-400 font-sans uppercase">NEW YORK</span>
      </div>
    );
  }

  // 10. BOTTEGA VENETA
  if (variant === 'bottega') {
    return (
      <div className={`${className} bg-[#004d25] text-[#b3ff99] rounded-2xl flex flex-col items-center justify-center border border-emerald-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="BOTTEGA VENETA">
        <span className="font-sans font-bold text-[8px] tracking-[0.18em] text-[#d4ffc2] uppercase text-center leading-tight">BOTTEGA VENETA</span>
      </div>
    );
  }

  // 11. BVLGARI HAUTE JOAILLERIE
  if (variant === 'bvlgari') {
    return (
      <div className={`${className} bg-stone-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-800/40 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="BVLGARI">
        <span className="font-serif font-bold text-[9px] tracking-[0.25em] text-amber-300 uppercase">BVLGARI</span>
        <span className="text-[5px] tracking-widest text-amber-500 font-sans uppercase mt-0.5">ROMA</span>
      </div>
    );
  }

  // 12. SWAROVSKI CRYSTAL PAVILION
  if (variant === 'swarovski') {
    return (
      <div className={`${className} bg-pink-950 text-pink-200 rounded-2xl flex flex-col items-center justify-center border border-pink-800/40 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="SWAROVSKI">
        <span className="text-xs">🦢</span>
        <span className="font-sans font-bold text-[7px] tracking-widest text-pink-100 uppercase mt-0.5">SWAROVSKI</span>
      </div>
    );
  }

  // 13. TANISHQ ROYAL HERITAGE
  if (variant === 'tanishq') {
    return (
      <div className={`${className} bg-red-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="TANISHQ">
        <span className="font-serif font-black text-[10px] tracking-wider text-amber-300 uppercase">TANISHQ</span>
        <span className="text-[5px] text-amber-400 font-sans uppercase">A TATA PRODUCT</span>
      </div>
    );
  }

  // 14. MALABAR GOLD & DIAMONDS
  if (variant === 'malabar') {
    return (
      <div className={`${className} bg-amber-950 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-amber-700 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="MALABAR">
        <span className="font-serif font-bold text-[9px] tracking-wider text-amber-200 uppercase">MALABAR</span>
        <span className="text-[5px] text-amber-400 font-sans uppercase">GOLD & DIAMONDS</span>
      </div>
    );
  }

  // 15. APPLE EXPERIENCE STORE
  if (variant === 'apple') {
    return (
      <div className={`${className} bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-300 shadow-xs overflow-hidden relative shrink-0 select-none p-1`} title="APPLE">
        <span className="font-sans font-extrabold text-[10px] sm:text-xs tracking-[0.24em] text-slate-900 uppercase">APPLE</span>
      </div>
    );
  }

  // 16. RAY-BAN SUNGLASS HUT
  if (variant === 'rayban') {
    return (
      <div className={`${className} bg-red-700 text-white rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="RAY-BAN">
        <span className="font-sans font-black italic text-[9px] sm:text-[10px] tracking-tight transform -rotate-6 uppercase">RAY-BAN</span>
      </div>
    );
  }

  // 17. OAKLEY PERFORMANCE VISION
  if (variant === 'oakley') {
    return (
      <div className={`${className} bg-black text-red-500 rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="OAKLEY">
        <span className="font-sans font-black text-xs sm:text-sm tracking-tight text-white uppercase">OAKLEY</span>
      </div>
    );
  }

  // 18. TOM FORD EYEWEAR
  if (variant === 'tomford') {
    return (
      <div className={`${className} bg-black text-white rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="TOM FORD">
        <span className="font-serif font-black text-[9px] tracking-widest text-white uppercase">TOM FORD</span>
        <span className="text-[5px] tracking-widest text-stone-400 font-sans uppercase">EYEWEAR</span>
      </div>
    );
  }

  // 19. LENSKART GOLD LOUNGE
  if (variant === 'lenskart') {
    return (
      <div className={`${className} bg-slate-900 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-500/30 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="LENSKART">
        <span className="text-xs">👓</span>
        <span className="font-sans font-black text-[8px] tracking-wider text-white uppercase">LENSKART</span>
      </div>
    );
  }

  // 20. ROLEX BOUTIQUE
  if (variant === 'rolex') {
    return (
      <div className={`${className} bg-emerald-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-500/40 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="ROLEX">
        <span className="text-xs leading-none">👑</span>
        <span className="font-serif font-black text-[9px] tracking-widest text-amber-300 uppercase mt-0.5">ROLEX</span>
      </div>
    );
  }

  // 21. OMEGA WATCH ATELIER
  if (variant === 'omega') {
    return (
      <div className={`${className} bg-red-950 text-white rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="OMEGA">
        <span className="font-serif font-black text-sm text-red-500">Ω</span>
        <span className="font-sans font-extrabold text-[8px] tracking-widest text-white uppercase">OMEGA</span>
      </div>
    );
  }

  // 22. TAG HEUER FLAGSHIP
  if (variant === 'tagheuer') {
    return (
      <div className={`${className} bg-emerald-950 text-white rounded-2xl flex flex-col items-center justify-center border border-emerald-700 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="TAG HEUER">
        <span className="font-sans font-black text-[8px] tracking-wider text-green-400 uppercase">TAG</span>
        <span className="font-serif font-bold text-[7px] tracking-wider text-red-400 uppercase">HEUER</span>
      </div>
    );
  }

  // 23. TISSOT SWISS WATCHES
  if (variant === 'tissot') {
    return (
      <div className={`${className} bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center border border-slate-700 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="TISSOT">
        <span className="font-sans font-black text-[9px] tracking-wider text-white uppercase">TISSOT</span>
        <span className="text-[5px] text-red-500 font-bold uppercase">SWISS 1853</span>
      </div>
    );
  }

  // 24. TITAN NEBULA GOLD WATCHES
  if (variant === 'titan') {
    return (
      <div className={`${className} bg-neutral-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-600/40 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="TITAN NEBULA">
        <span className="font-serif font-black text-[9px] tracking-wider text-amber-300 uppercase">NEBULA</span>
        <span className="text-[5px] text-amber-500 font-sans uppercase">BY TITAN 18K</span>
      </div>
    );
  }

  // 25. TIFFANY & CO.
  if (variant === 'tiffany') {
    return (
      <div className={`${className} bg-teal-600 text-white rounded-2xl flex flex-col items-center justify-center border border-teal-700 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="TIFFANY & CO.">
        <span className="font-serif font-bold text-[9px] sm:text-[10px] tracking-wider text-white uppercase text-center leading-tight">TIFFANY & CO.</span>
      </div>
    );
  }

  // 26. CARTIER HIGH JEWELRY
  if (variant === 'cartier') {
    return (
      <div className={`${className} bg-red-950 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="CARTIER">
        <span className="font-serif italic font-bold text-xs sm:text-sm tracking-wide text-amber-200">Cartier</span>
      </div>
    );
  }

  // 27. STARBUCKS RESERVE
  if (variant === 'starbucks') {
    return (
      <div className={`${className} bg-emerald-950 text-emerald-100 rounded-2xl flex flex-col items-center justify-center border border-emerald-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="STARBUCKS">
        <span className="text-amber-400 text-xs">★</span>
        <span className="font-serif font-bold text-[8px] tracking-widest text-amber-200 uppercase mt-0.5">RESERVE</span>
      </div>
    );
  }

  // 28. SEPHORA BEAUTY
  if (variant === 'sephora') {
    return (
      <div className={`${className} bg-black text-white rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="SEPHORA">
        <span className="font-sans font-black text-[9px] tracking-[0.2em] text-white uppercase">SEPHORA</span>
      </div>
    );
  }

  // DEFAULT FALLBACK GRAPHIC BADGE
  const initials = storeName
    ? storeName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : 'GM';

  return (
    <div 
      className={`${className} bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl flex flex-col items-center justify-center border border-slate-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`}
      title={storeName || 'Store Logo'}
    >
      <span className="font-serif font-extrabold text-xs sm:text-sm tracking-wider text-amber-200">{initials}</span>
      <span className="text-[6px] tracking-widest text-slate-400 uppercase font-sans mt-0.5">{storeName ? storeName.split(' ')[0] : 'BOUTIQUE'}</span>
    </div>
  );
};

// ============================================================================
// BRAND HERO BANNER COMPONENT (EXACT REPLICA OF USER'S REFERENCE IMAGE 2)
// ============================================================================
export interface BrandBannerProps {
  storeName: string;
  logoVariant?: string;
  className?: string;
}

export const BrandBanner: React.FC<BrandBannerProps> = ({
  storeName = '',
  logoVariant,
  className = 'w-full h-40 rounded-2xl'
}) => {
  const s = (storeName || '').toLowerCase();
  const v = (logoVariant || '').toLowerCase();

  // 1. NIKE FLAGSHIP
  if (v === 'nike' || s.includes('nike')) {
    return (
      <div className={`${className} bg-black rounded-2xl flex items-center justify-center p-6 select-none overflow-hidden shadow-xs border border-neutral-900`}>
        <div className="flex flex-col items-center justify-center">
          <svg viewBox="0 0 240 100" className="w-48 sm:w-56 h-auto text-white fill-current">
            <text x="50%" y="42%" textAnchor="middle" dominantBaseline="middle" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="52" letterSpacing="-2">NIKE</text>
            <path d="M30 82 C 75 92, 155 78, 215 42 C 160 62, 100 68, 55 70 C 45 70, 38 74, 30 82 Z" fill="white" />
          </svg>
        </div>
      </div>
    );
  }

  // 2. ZARA FLAGSHIP
  if (v === 'zara' || s.includes('zara')) {
    return (
      <div className={`${className} bg-white rounded-2xl flex items-center justify-center p-6 select-none overflow-hidden shadow-xs border border-slate-200/80`}>
        <span className="font-serif font-black text-5xl sm:text-6xl text-black tracking-[-0.05em] uppercase transform scale-y-110">
          ZARA
        </span>
      </div>
    );
  }

  // 3. GUCCI BOUTIQUE
  if (v === 'gucci' || s.includes('gucci')) {
    return (
      <div className={`${className} bg-black rounded-2xl flex flex-col items-center justify-center p-6 select-none overflow-hidden shadow-xs border border-neutral-900 space-y-2`}>
        <span className="font-serif font-normal text-3xl sm:text-4xl text-[#d4af37] tracking-[0.28em] uppercase">
          GUCCI
        </span>
        <svg viewBox="0 0 60 36" className="w-16 h-10 text-[#d4af37] fill-none stroke-current stroke-[3.5]">
          <circle cx="22" cy="18" r="14" />
          <path d="M22 18 L32 18" strokeLinecap="square" />
          <circle cx="38" cy="18" r="14" />
          <path d="M38 18 L28 18" strokeLinecap="square" />
        </svg>
      </div>
    );
  }

  // 4. PRADA ATELIER
  if (v === 'prada' || s.includes('prada')) {
    return (
      <div className={`${className} bg-black rounded-2xl flex flex-col items-center justify-center p-6 select-none overflow-hidden shadow-xs border border-neutral-900 space-y-1.5`}>
        <span className="font-serif font-black text-4xl sm:text-5xl text-white tracking-[0.22em] uppercase">
          PRADA
        </span>
        <span className="font-sans font-bold text-xs sm:text-sm text-stone-200 tracking-[0.38em] uppercase">
          MILANO
        </span>
      </div>
    );
  }

  // 5. U.S. POLO ASSN.
  if (v === 'uspolo' || v === 'polo' || s.includes('polo')) {
    return (
      <div className={`${className} bg-[#0b1c3d] rounded-2xl flex flex-col items-center justify-center p-6 select-none overflow-hidden shadow-xs border border-blue-950 space-y-2`}>
        <svg viewBox="0 0 50 45" className="w-12 h-11 text-white fill-current">
          <path d="M16 8 C16 5, 19 4, 22 5 C24 7, 24 9, 22 11 C20 12, 17 11, 16 8 Z M13 18 C16 15, 23 13, 28 16 C31 18, 34 22, 33 26 C31 31, 26 34, 21 32 C17 31, 13 26, 13 22 Z M29 12 L38 3 M18 32 L16 41 M26 32 L29 41 M10 23 L5 29" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <div className="text-center">
          <span className="font-serif font-black text-sm sm:text-base text-white tracking-[0.2em] uppercase block">
            U.S. POLO ASSN.
          </span>
          <span className="font-sans font-extrabold text-[9px] text-[#e50010] tracking-[0.25em] uppercase block mt-0.5">
            SINCE 1890
          </span>
        </div>
      </div>
    );
  }

  // 6. H&M FLAGSHIP
  if (v === 'hm' || s.includes('h&m') || s.includes('hm')) {
    return (
      <div className={`${className} bg-white rounded-2xl flex items-center justify-center p-6 select-none overflow-hidden shadow-xs border border-slate-200/80`}>
        <span className="font-sans font-black italic text-6xl sm:text-7xl text-[#e50010] tracking-tighter transform -skew-x-12">
          H&M
        </span>
      </div>
    );
  }

  // Fallback Generic Luxury Store Banner
  return (
    <div className={`${className} bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl flex items-center justify-center p-6 select-none overflow-hidden shadow-xs border border-slate-800`}>
      <span className="font-serif font-extrabold text-2xl text-white tracking-[0.2em] uppercase">
        {storeName}
      </span>
    </div>
  );
};
