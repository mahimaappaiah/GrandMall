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
    if (s.includes('vuitton') || s.includes('lv')) return 'lv';
    if (s.includes('apple')) return 'apple';
    if (s.includes('ray-ban') || s.includes('rayban')) return 'rayban';
    if (s.includes('rolex')) return 'rolex';
    if (s.includes('starbucks')) return 'starbucks';
    if (s.includes('tiffany')) return 'tiffany';
    if (s.includes('sephora')) return 'sephora';
    if (s.includes('cartier')) return 'cartier';
    if (s.includes('polo') || s.includes('ralph')) return 'polo';
    if (s.includes('van heusen')) return 'vanheusen';
    if (s.includes('peter england')) return 'peterengland';
    if (s.includes('blackberry')) return 'blackberrys';
    if (s.includes('mufti')) return 'mufti';
    if (s.includes('spykar')) return 'spykar';
    if (s.includes('jack') || s.includes('jones')) return 'jackjones';
    if (s.includes('lee cooper')) return 'leecooper';
    if (s.includes('flying machine')) return 'flyingmachine';
    if (s.includes('arrow')) return 'arrow';
    if (s.includes('manyavar')) return 'manyavar';
    if (s.includes('louis philippe')) return 'louisphilippe';
    if (s.includes('din tai fung') || s.includes('dintaifung')) return 'dintaifung';
    if (s.includes('kfc')) return 'kfc';
    if (s.includes('le cirque')) return 'lecirque';
    if (s.includes('timezone')) return 'timezone';
    if (s.includes('bose')) return 'bose';
    if (s.includes('sony')) return 'sony';
    if (s.includes('adidas')) return 'adidas';
    return 'default';
  })();

  // 1. ZARA FLAGSHIP (Black Luxury Block with Crisp Serif)
  if (variant === 'zara') {
    return (
      <div className={`${className} bg-stone-950 text-stone-100 rounded-2xl flex flex-col items-center justify-center border border-stone-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="ZARA">
        <span className="font-serif font-light text-[11px] sm:text-xs tracking-[0.28em] text-stone-100 uppercase transform scale-y-110">ZARA</span>
      </div>
    );
  }

  // 2. GUCCI BOUTIQUE (Black & Gold Florence Luxury Gradient)
  if (variant === 'gucci') {
    return (
      <div className={`${className} bg-gradient-to-b from-stone-950 via-neutral-900 to-black text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-amber-900/50 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="GUCCI">
        <span className="font-serif font-extrabold text-[10px] sm:text-[11px] tracking-[0.24em] text-amber-200 uppercase">GUCCI</span>
        <span className="text-[6px] tracking-widest text-amber-400/60 uppercase font-sans mt-0.5">FLORENCE</span>
      </div>
    );
  }

  // 3. PRADA ATELIER (Pitch Black with Bold Milano Subtitle)
  if (variant === 'prada') {
    return (
      <div className={`${className} bg-black text-white rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="PRADA">
        <span className="font-sans font-black text-[10px] sm:text-[11px] tracking-[0.22em] text-white uppercase">PRADA</span>
        <span className="text-[6px] tracking-wider text-slate-400 font-mono mt-0.5">MILANO</span>
      </div>
    );
  }

  // 4. LOUIS VUITTON MAISON (Dark Mocha & Intertwined Gold Monogram)
  if (variant === 'lv') {
    return (
      <div className={`${className} bg-gradient-to-br from-amber-950 via-stone-900 to-neutral-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-800/40 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="LOUIS VUITTON">
        <span className="font-serif font-black text-xs sm:text-sm tracking-widest text-amber-300">LV</span>
        <span className="text-[6px] font-sans font-semibold text-amber-400/70 tracking-wider">PARIS</span>
      </div>
    );
  }

  // 5. NIKE FLAGSHIP (Bold Italic Nike + Swoosh Bar)
  if (variant === 'nike') {
    return (
      <div className={`${className} bg-slate-950 text-white rounded-2xl flex flex-col items-center justify-center border border-slate-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="NIKE">
        <span className="font-sans font-black italic text-xs sm:text-sm tracking-tighter transform -skew-x-12 uppercase text-white">NIKE</span>
        <span className="w-5 h-0.5 bg-rose-600 rounded-full mt-0.5 transform -skew-x-12 opacity-90"></span>
      </div>
    );
  }

  // 6. APPLE EXPERIENCE STORE (Clean Minimalist Silver Block)
  if (variant === 'apple') {
    return (
      <div className={`${className} bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center border border-slate-300 shadow-xs overflow-hidden relative shrink-0 select-none p-1`} title="APPLE">
        <span className="font-sans font-extrabold text-[10px] sm:text-xs tracking-[0.24em] text-slate-900 uppercase">APPLE</span>
      </div>
    );
  }

  // 7. RAY-BAN SUNGLASS HUT (Crimson Red + Italic Script)
  if (variant === 'rayban') {
    return (
      <div className={`${className} bg-red-700 text-white rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="RAY-BAN">
        <span className="font-sans font-black italic text-[9px] sm:text-[10px] tracking-tight transform -rotate-6 uppercase">RAY-BAN</span>
      </div>
    );
  }

  // 8. ROLEX BOUTIQUE (Imperial Green & Gold Crown)
  if (variant === 'rolex') {
    return (
      <div className={`${className} bg-emerald-950 text-amber-300 rounded-2xl flex flex-col items-center justify-center border border-amber-500/40 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="ROLEX">
        <span className="text-xs leading-none">👑</span>
        <span className="font-serif font-black text-[9px] tracking-widest text-amber-300 uppercase mt-0.5">ROLEX</span>
      </div>
    );
  }

  // 9. TIFFANY & CO. (Signature Tiffany Cyan)
  if (variant === 'tiffany') {
    return (
      <div className={`${className} bg-teal-600 text-white rounded-2xl flex flex-col items-center justify-center border border-teal-700 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="TIFFANY & CO.">
        <span className="font-serif font-bold text-[9px] sm:text-[10px] tracking-wider text-white uppercase text-center leading-tight">TIFFANY & CO.</span>
      </div>
    );
  }

  // 10. CARTIER HIGH JEWELRY (Burgundy Red + Gold Script)
  if (variant === 'cartier') {
    return (
      <div className={`${className} bg-red-950 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-red-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="CARTIER">
        <span className="font-serif italic font-bold text-xs sm:text-sm tracking-wide text-amber-200">Cartier</span>
      </div>
    );
  }

  // 11. STARBUCKS RESERVE (Emerald Green & Gold Star)
  if (variant === 'starbucks') {
    return (
      <div className={`${className} bg-emerald-950 text-emerald-100 rounded-2xl flex flex-col items-center justify-center border border-emerald-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="STARBUCKS">
        <span className="text-amber-400 text-xs">★</span>
        <span className="font-serif font-bold text-[8px] tracking-widest text-amber-200 uppercase mt-0.5">RESERVE</span>
      </div>
    );
  }

  // 12. DIN TAI FUNG (Imperial Red & Gold Gourmet)
  if (variant === 'dintaifung') {
    return (
      <div className={`${className} bg-rose-950 text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-amber-900/50 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="DIN TAI FUNG">
        <span className="font-serif font-bold text-[9px] tracking-wider text-amber-200 uppercase">DIN TAI FUNG</span>
        <span className="text-[6px] text-amber-400/70 font-sans tracking-widest mt-0.5">鼎泰豐</span>
      </div>
    );
  }

  // 13. POLO RALPH LAUREN / U.S. POLO ASSN. (Navy Blue Block - Reference Image 1)
  if (variant === 'polo') {
    return (
      <div className={`${className} bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center border border-slate-700 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="POLO">
        <span className="font-serif font-extrabold text-[9px] tracking-widest text-white uppercase">U.S. POLO</span>
        <span className="text-[6px] tracking-wider text-amber-400 font-sans mt-0.5">ASSN.</span>
      </div>
    );
  }

  // 14. VAN HEUSEN (Black Power Dressing Block - Reference Image 1)
  if (variant === 'vanheusen') {
    return (
      <div className={`${className} bg-black text-white rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="VAN HEUSEN">
        <span className="text-[9px] text-amber-300 font-serif font-bold">V</span>
        <span className="font-sans font-bold text-[8px] tracking-widest text-white uppercase mt-0.5">VAN HEUSEN</span>
      </div>
    );
  }

  // 15. PETER ENGLAND (Green & Red Split Block - Reference Image 1)
  if (variant === 'peterengland') {
    return (
      <div className={`${className} bg-gradient-to-r from-emerald-900 to-red-900 text-white rounded-2xl flex items-center justify-center border border-slate-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="PETER ENGLAND">
        <div className="bg-black/90 px-1.5 py-0.5 rounded border border-slate-700 text-center">
          <span className="font-sans font-extrabold text-[8px] tracking-wider text-white uppercase">PETER ENGLAND</span>
        </div>
      </div>
    );
  }

  // 16. BLACKBERRYS (Dark Brown Bird Block - Reference Image 1)
  if (variant === 'blackberrys') {
    return (
      <div className={`${className} bg-[#2c221e] text-amber-200 rounded-2xl flex flex-col items-center justify-center border border-[#44352e] shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="BLACKBERRYS">
        <span className="text-amber-300 text-[10px]">🦅</span>
        <span className="font-sans font-bold text-[8px] tracking-widest text-amber-100 uppercase mt-0.5">BLACKBERRYS</span>
      </div>
    );
  }

  // 17. MUFTI (Black Alternative Clothing Block - Reference Image 1)
  if (variant === 'mufti') {
    return (
      <div className={`${className} bg-black text-white rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="MUFTI">
        <span className="font-sans font-extrabold text-xs tracking-wider text-white lowercase">mufti</span>
      </div>
    );
  }

  // 18. SPYKAR (Red Spykar Block - Reference Image 1)
  if (variant === 'spykar') {
    return (
      <div className={`${className} bg-red-600 text-white rounded-2xl flex items-center justify-center border border-red-700 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="SPYKAR">
        <div className="bg-black px-1.5 py-0.5 rounded text-center">
          <span className="font-sans font-black text-[9px] tracking-wider text-white uppercase">spykar</span>
        </div>
      </div>
    );
  }

  // 19. JACK & JONES (White Clean Block - Reference Image 1)
  if (variant === 'jackjones') {
    return (
      <div className={`${className} bg-white text-black rounded-2xl flex items-center justify-center border border-slate-300 shadow-xs overflow-hidden relative shrink-0 select-none p-1`} title="JACK & JONES">
        <span className="font-sans font-black text-[8px] sm:text-[9px] tracking-tight text-slate-950 uppercase">JACK&JONES</span>
      </div>
    );
  }

  // 20. SEPHORA (Black & White Stripe Accent)
  if (variant === 'sephora') {
    return (
      <div className={`${className} bg-black text-white rounded-2xl flex flex-col items-center justify-center border border-neutral-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="SEPHORA">
        <span className="font-sans font-black text-[9px] tracking-[0.2em] text-white uppercase">SEPHORA</span>
      </div>
    );
  }

  // 21. ADIDAS ORIGINALS (Royal Blue Trefoil)
  if (variant === 'adidas') {
    return (
      <div className={`${className} bg-blue-900 text-white rounded-2xl flex flex-col items-center justify-center border border-blue-800 shadow-md overflow-hidden relative shrink-0 select-none p-1`} title="ADIDAS">
        <span className="font-sans font-black text-xs tracking-tight text-white lowercase">adidas</span>
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
