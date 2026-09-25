// ===============================================================
// SADQ OFFICIAL BADGE AVATARS
// 100% Modest, Islamic Geometric & Scholar Vector Emblems
// Strictly ZERO human/women stock photos
// ===============================================================

export interface BadgeAvatar {
  id: string;
  name: string;
  category: string;
  svgDataUri: string;
}

// Helper to create safe SVG data URIs
function createSvgUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const SADQ_BADGE_AVATARS: BadgeAvatar[] = [
  {
    id: 'sadq-crest',
    name: 'SADQ Royal Crest',
    category: 'Official Emblem',
    svgDataUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffe259"/>
            <stop offset="100%" stop-color="#ffa751"/>
          </linearGradient>
          <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#02167f"/>
            <stop offset="100%" stop-color="#050b38"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#navyGrad)" stroke="url(#goldGrad)" stroke-width="4"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="3 3"/>
        <path d="M60 26 C44 26 31 39 31 55 C31 71 44 84 60 84 C66 84 72 82 77 78 C65 76 56 66 56 55 C56 44 65 34 77 32 C72 28 66 26 60 26 Z" fill="url(#goldGrad)"/>
        <polygon points="76,46 78,52 84,52 79,56 81,62 76,58 71,62 73,56 68,52 74,52" fill="#ffd014"/>
        <text x="60" y="102" font-family="Cinzel, Georgia, serif" font-size="12" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="3">SADQ</text>
      </svg>
    `),
  },
  {
    id: 'mushaf-quran',
    name: 'Darul Quran Mushaf',
    category: 'Quranic Heritage',
    svgDataUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#064e3b"/>
            <stop offset="100%" stop-color="#022c22"/>
          </linearGradient>
          <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffd014"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#emeraldGrad)" stroke="url(#goldGrad2)" stroke-width="4"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke="#34d399" stroke-width="1" opacity="0.4"/>
        <!-- Rehal Stand -->
        <path d="M38 78 L60 62 L82 78 M42 84 L60 68 L78 84" stroke="url(#goldGrad2)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Open Quran Pages -->
        <path d="M32 50 C44 46 56 48 60 52 C64 48 76 46 88 50 L86 68 C74 64 64 66 60 70 C56 66 46 64 34 68 Z" fill="#fef3c7" stroke="url(#goldGrad2)" stroke-width="2"/>
        <line x1="60" y1="52" x2="60" y2="70" stroke="url(#goldGrad2)" stroke-width="2"/>
        <!-- Decorative Rosette -->
        <circle cx="60" cy="34" r="5" fill="none" stroke="url(#goldGrad2)" stroke-width="1.5"/>
        <circle cx="60" cy="34" r="2" fill="url(#goldGrad2)"/>
        <text x="60" y="104" font-family="Cinzel, Georgia, serif" font-size="10" font-weight="700" fill="#fef3c7" text-anchor="middle" letter-spacing="2">QURAN</text>
      </svg>
    `),
  },
  {
    id: 'rub-el-hizb',
    name: 'Islamic Geometric Star',
    category: 'Geometric Art',
    svgDataUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="sapphireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#sapphireGrad)" stroke="url(#starGold)" stroke-width="4"/>
        <g transform="translate(60,60)">
          <!-- Square 1 -->
          <rect x="-26" y="-26" width="52" height="52" fill="none" stroke="url(#starGold)" stroke-width="2.5" rx="3"/>
          <!-- Square 2 (rotated 45 deg) -->
          <rect x="-26" y="-26" width="52" height="52" fill="none" stroke="url(#starGold)" stroke-width="2.5" rx="3" transform="rotate(45)"/>
          <!-- Central Circle & Star -->
          <circle cx="0" cy="0" r="14" fill="#1e1b4b" stroke="url(#starGold)" stroke-width="2"/>
          <circle cx="0" cy="0" r="6" fill="url(#starGold)"/>
        </g>
        <text x="60" y="106" font-family="Cinzel, Georgia, serif" font-size="9" font-weight="800" fill="url(#starGold)" text-anchor="middle" letter-spacing="2.5">ISLAMIC ART</text>
      </svg>
    `),
  },
  {
    id: 'emerald-dome',
    name: 'Emerald Dome & Minaret',
    category: 'Architecture',
    svgDataUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="domeBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#047857"/>
            <stop offset="100%" stop-color="#064e3b"/>
          </linearGradient>
          <linearGradient id="goldDome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde68a"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#domeBg)" stroke="url(#goldDome)" stroke-width="4"/>
        <!-- Main Dome -->
        <path d="M38 78 C38 52 52 40 60 34 C68 40 82 52 82 78 Z" fill="#065f46" stroke="url(#goldDome)" stroke-width="2.5"/>
        <!-- Crescent atop dome -->
        <circle cx="60" cy="30" r="3.5" fill="none" stroke="url(#goldDome)" stroke-width="1.5"/>
        <line x1="60" y1="34" x2="60" y2="25" stroke="url(#goldDome)" stroke-width="1.5"/>
        <!-- Arched Window -->
        <path d="M53 78 C53 68 56 64 60 64 C64 64 67 68 67 78 Z" fill="url(#goldDome)" opacity="0.9"/>
        <!-- Minaret Spire on side -->
        <rect x="25" y="55" width="6" height="23" fill="#065f46" stroke="url(#goldDome)" stroke-width="1.5"/>
        <polygon points="28,45 25,55 31,55" fill="url(#goldDome)"/>
        <text x="60" y="104" font-family="Cinzel, Georgia, serif" font-size="10" font-weight="700" fill="#fef3c7" text-anchor="middle" letter-spacing="2">MASJID</text>
      </svg>
    `),
  },
  {
    id: 'scholar-quill',
    name: 'Scholar Quill & Scroll',
    category: 'Knowledge & Literature',
    svgDataUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgScholar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e1e38"/>
            <stop offset="100%" stop-color="#0a0a1a"/>
          </linearGradient>
          <linearGradient id="goldQuill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffd700"/>
            <stop offset="100%" stop-color="#ff9900"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgScholar)" stroke="url(#goldQuill)" stroke-width="4"/>
        <!-- Scroll/Parchment -->
        <rect x="36" y="44" width="48" height="34" rx="4" fill="#fef9c3" stroke="url(#goldQuill)" stroke-width="2"/>
        <line x1="44" y1="52" x2="76" y2="52" stroke="#ca8a04" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="44" y1="58" x2="72" y2="58" stroke="#ca8a04" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="44" y1="64" x2="68" y2="64" stroke="#ca8a04" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Feather Quill -->
        <path d="M78 28 C74 38 68 54 52 74 L50 78 L54 76 C66 64 78 50 84 32 C85 29 82 26 78 28 Z" fill="url(#goldQuill)" stroke="#b45309" stroke-width="1"/>
        <text x="60" y="104" font-family="Cinzel, Georgia, serif" font-size="10" font-weight="700" fill="url(#goldQuill)" text-anchor="middle" letter-spacing="2">SCHOLAR</text>
      </svg>
    `),
  },
  {
    id: 'kiswa-calligraphy',
    name: 'Kiswa Calligraphy Seal',
    category: 'Spiritual Calligraphy',
    svgDataUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="kiswaBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#18181b"/>
            <stop offset="100%" stop-color="#09090b"/>
          </linearGradient>
          <linearGradient id="kiswaGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#a16207"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#kiswaBg)" stroke="url(#kiswaGold)" stroke-width="4"/>
        <circle cx="60" cy="60" r="48" fill="none" stroke="url(#kiswaGold)" stroke-width="1" stroke-dasharray="2 4"/>
        <!-- Stylized Traditional Calligraphy Motif -->
        <path d="M40 50 C44 42 54 40 60 48 C66 40 76 42 80 50 C80 62 60 76 60 76 C60 76 40 62 40 50 Z" fill="none" stroke="url(#kiswaGold)" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="60" cy="56" r="4" fill="url(#kiswaGold)"/>
        <text x="60" y="102" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="url(#kiswaGold)" text-anchor="middle">العلم نور</text>
      </svg>
    `),
  },
];
