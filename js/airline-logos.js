// Official Vector Airline Logos & Branding for VoyaFlights Platform
// Provides crisp, high-resolution SVG logos for verified global carriers

const AIRLINE_LOGOS = {
  'AA': {
    name: 'American Airlines',
    primaryColor: '#0078d2',
    accentColor: '#c8102e',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <defs>
        <linearGradient id="aa-wing-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0078d2"/>
          <stop offset="100%" stop-color="#004b87"/>
        </linearGradient>
        <linearGradient id="aa-wing-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e01a35"/>
          <stop offset="100%" stop-color="#a60c20"/>
        </linearGradient>
      </defs>
      <path d="M12 70 L 46 22 L 46 70 Z" fill="url(#aa-wing-blue)"/>
      <path d="M88 70 L 54 22 L 54 70 Z" fill="url(#aa-wing-red)"/>
      <polygon points="46,42 54,42 50,56" fill="#ffffff"/>
      <rect x="47.5" y="60" width="5" height="10" rx="2.5" fill="#d1d5db"/>
    </svg>`
  },
  'DL': {
    name: 'Delta Air Lines',
    primaryColor: '#002244',
    accentColor: '#e01933',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <polygon points="50,15 88,80 50,62" fill="#ba0c2f"/>
      <polygon points="50,15 12,80 50,62" fill="#e01933"/>
      <polygon points="50,62 88,80 50,72 12,80" fill="#002244"/>
    </svg>`
  },
  'UA': {
    name: 'United Airlines',
    primaryColor: '#002244',
    accentColor: '#005da3',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <circle cx="50" cy="50" r="44" fill="#002244"/>
      <circle cx="50" cy="50" r="41" fill="none" stroke="#005da3" stroke-width="2"/>
      <ellipse cx="50" cy="50" rx="38" ry="18" fill="none" stroke="#69b3e7" stroke-width="3.5"/>
      <ellipse cx="50" cy="50" rx="22" ry="41" fill="none" stroke="#69b3e7" stroke-width="3.5"/>
      <line x1="9" y1="50" x2="91" y2="50" stroke="#69b3e7" stroke-width="3.5"/>
      <line x1="50" y1="9" x2="50" y2="91" stroke="#69b3e7" stroke-width="3.5"/>
    </svg>`
  },
  'B6': {
    name: 'JetBlue Airways',
    primaryColor: '#0033a0',
    accentColor: '#00a3e0',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <rect x="6" y="6" width="88" height="88" rx="18" fill="#0033a0"/>
      <circle cx="34" cy="34" r="9" fill="#00a3e0"/>
      <circle cx="66" cy="34" r="9" fill="#ffffff"/>
      <circle cx="34" cy="66" r="9" fill="#ffffff"/>
      <circle cx="66" cy="66" r="9" fill="#00a3e0"/>
      <path d="M44 44 L 56 56 M56 44 L 44 56" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  },
  'AS': {
    name: 'Alaska Airlines',
    primaryColor: '#01426a',
    accentColor: '#00a3b4',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <circle cx="50" cy="50" r="45" fill="#01426a"/>
      <circle cx="50" cy="50" r="41" fill="#022a45"/>
      <path d="M26 65 Q 40 32, 70 34 Q 80 48, 72 65 Q 54 82, 26 65 Z" fill="#00a3b4"/>
      <path d="M38 56 Q 48 42, 60 44 Q 66 52, 62 60 Q 50 68, 38 56 Z" fill="#ffffff"/>
      <circle cx="48" cy="50" r="4" fill="#01426a"/>
    </svg>`
  },
  'BA': {
    name: 'British Airways',
    primaryColor: '#075aaa',
    accentColor: '#eb2226',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <path d="M10 65 Q 45 40, 90 42 Q 65 72, 10 65" fill="#075aaa"/>
      <path d="M42 42 Q 65 34, 90 42 Q 78 54, 52 50" fill="#eb2226"/>
      <circle cx="28" cy="48" r="5" fill="#ffffff"/>
    </svg>`
  },
  'EK': {
    name: 'Emirates',
    primaryColor: '#d71921',
    accentColor: '#d4af37',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <rect x="6" y="6" width="88" height="88" rx="16" fill="#d71921"/>
      <path d="M22 34 Q 38 24, 50 34 Q 62 24, 78 34 Q 68 54, 50 74 Q 32 54, 22 34 Z" fill="#d4af37"/>
      <circle cx="50" cy="44" r="8" fill="#ffffff"/>
      <text x="50" y="88" font-family="sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">EMIRATES</text>
    </svg>`
  },
  'QR': {
    name: 'Qatar Airways',
    primaryColor: '#5c0632',
    accentColor: '#a71930',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <circle cx="50" cy="50" r="45" fill="#5c0632"/>
      <path d="M50 20 L 62 38 L 78 30 L 68 48 L 84 54 L 66 60 L 72 78 L 50 64 L 28 78 L 34 60 L 16 54 L 32 48 L 22 30 L 38 38 Z" fill="#ffffff"/>
      <circle cx="50" cy="48" r="10" fill="#5c0632"/>
      <circle cx="50" cy="48" r="5" fill="#d4af37"/>
    </svg>`
  },
  'SQ': {
    name: 'Singapore Airlines',
    primaryColor: '#00205b',
    accentColor: '#f1b73e',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <circle cx="50" cy="50" r="45" fill="#00205b"/>
      <path d="M22 64 L 50 20 L 78 64 L 50 50 Z" fill="#f1b73e"/>
      <path d="M50 32 L 64 56 L 50 48 L 36 56 Z" fill="#ffffff"/>
    </svg>`
  },
  'LH': {
    name: 'Lufthansa',
    primaryColor: '#05164d',
    accentColor: '#ffad00',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <circle cx="50" cy="50" r="45" fill="#05164d"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#ffad00" stroke-width="4"/>
      <path d="M28 58 Q 42 36, 68 36 Q 52 46, 38 52 Q 62 48, 72 44 Q 54 58, 36 64 Z" fill="#ffad00"/>
    </svg>`
  },
  'AF': {
    name: 'Air France',
    primaryColor: '#002157',
    accentColor: '#ed1c24',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <rect x="8" y="8" width="84" height="84" rx="16" fill="#002157"/>
      <polygon points="35,22 75,22 60,78 20,78" fill="#ed1c24"/>
      <polygon points="45,30 68,30 55,70 32,70" fill="#ffffff"/>
    </svg>`
  },
  'F9': {
    name: 'Frontier Airlines',
    primaryColor: '#006643',
    accentColor: '#78be20',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <circle cx="50" cy="50" r="45" fill="#006643"/>
      <text x="50" y="68" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="52" fill="#ffffff" text-anchor="middle">F</text>
      <circle cx="72" cy="30" r="7" fill="#78be20"/>
    </svg>`
  },
  'WN': {
    name: 'Southwest Airlines',
    primaryColor: '#304cb2',
    accentColor: '#f9b612',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <path d="M50 82 C 18 56, 12 32, 32 18 C 45 10, 50 24, 50 24 C 50 24, 55 10, 68 18 C 88 32, 82 56, 50 82 Z" fill="#f9b612"/>
      <path d="M50 74 C 28 52, 22 34, 36 24" stroke="#c8102e" stroke-width="5" fill="none"/>
      <circle cx="50" cy="46" r="8" fill="#304cb2"/>
    </svg>`
  },
  'NK': {
    name: 'Spirit Airlines',
    primaryColor: '#ffde00',
    accentColor: '#000000',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <rect x="8" y="8" width="84" height="84" rx="16" fill="#ffde00"/>
      <text x="50" y="66" font-family="'Arial Black', sans-serif" font-weight="900" font-size="28" fill="#000000" text-anchor="middle">spirit</text>
    </svg>`
  },
  'AI': {
    name: 'Air India',
    primaryColor: '#ed1b24',
    accentColor: '#f7941d',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <circle cx="50" cy="50" r="45" fill="#ed1b24"/>
      <circle cx="50" cy="50" r="32" fill="#f7941d"/>
      <polygon points="50,22 62,44 44,36 50,56 36,46 42,70 30,58 26,76 34,50" fill="#ffffff"/>
      <circle cx="64" cy="48" r="8" fill="#ffffff"/>
    </svg>`
  },
  '6E': {
    name: 'IndiGo',
    primaryColor: '#001b94',
    accentColor: '#2b5ce6',
    svg: `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
      <circle cx="50" cy="50" r="45" fill="#001b94"/>
      <circle cx="34" cy="40" r="6" fill="#ffffff"/>
      <circle cx="46" cy="34" r="6" fill="#ffffff"/>
      <circle cx="58" cy="40" r="6" fill="#ffffff"/>
      <circle cx="66" cy="52" r="6" fill="#ffffff"/>
      <circle cx="58" cy="64" r="6" fill="#ffffff"/>
      <circle cx="46" cy="70" r="6" fill="#ffffff"/>
      <circle cx="34" cy="64" r="6" fill="#ffffff"/>
      <circle cx="50" cy="52" r="7" fill="#2b5ce6"/>
    </svg>`
  }
};

// Carrier Code Mapper: converts carrier string (e.g. "American", "JetBlue") or code ("AA") to Logo
function getAirlineLogoSVG(carrierIdentifier) {
  if (!carrierIdentifier) carrierIdentifier = 'AA';
  const cleanId = String(carrierIdentifier).trim().toUpperCase();

  // Check direct 2-letter code
  if (AIRLINE_LOGOS[cleanId]) {
    return AIRLINE_LOGOS[cleanId].svg;
  }

  // Check by carrier name
  const nameLower = String(carrierIdentifier).toLowerCase();
  if (nameLower.includes('alaska')) return AIRLINE_LOGOS['AS'].svg;
  if (nameLower.includes('american')) return AIRLINE_LOGOS['AA'].svg;
  if (nameLower.includes('delta')) return AIRLINE_LOGOS['DL'].svg;
  if (nameLower.includes('jetblue')) return AIRLINE_LOGOS['B6'].svg;
  if (nameLower.includes('united')) return AIRLINE_LOGOS['UA'].svg;
  if (nameLower.includes('british')) return AIRLINE_LOGOS['BA'].svg;
  if (nameLower.includes('emirates')) return AIRLINE_LOGOS['EK'].svg;
  if (nameLower.includes('qatar')) return AIRLINE_LOGOS['QR'].svg;
  if (nameLower.includes('singapore')) return AIRLINE_LOGOS['SQ'].svg;
  if (nameLower.includes('lufthansa')) return AIRLINE_LOGOS['LH'].svg;
  if (nameLower.includes('air france')) return AIRLINE_LOGOS['AF'].svg;
  if (nameLower.includes('frontier')) return AIRLINE_LOGOS['F9'].svg;
  if (nameLower.includes('southwest')) return AIRLINE_LOGOS['WN'].svg;
  if (nameLower.includes('spirit')) return AIRLINE_LOGOS['NK'].svg;
  if (nameLower.includes('air india')) return AIRLINE_LOGOS['AI'].svg;
  if (nameLower.includes('indigo')) return AIRLINE_LOGOS['6E'].svg;

  // Generic Aviation Badge for other international carriers
  const initials = (cleanId.length === 2) ? cleanId : cleanId.substring(0, 2);
  return `<svg viewBox="0 0 100 100" class="airline-svg-symbol">
    <rect x="8" y="8" width="84" height="84" rx="18" fill="#0f62fe"/>
    <path d="M25 65 L 50 25 L 75 65 L 50 52 Z" fill="#ffffff"/>
    <text x="50" y="86" font-family="sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle">${initials}</text>
  </svg>`;
}

// Extract standard 2-letter IATA carrier code
function getCarrierCode(carrierIdentifier) {
  if (!carrierIdentifier) return 'AA';
  const cleanId = String(carrierIdentifier).trim().toUpperCase();
  if (cleanId.length === 2) return cleanId;

  const nameLower = String(carrierIdentifier).toLowerCase();
  if (nameLower.includes('alaska')) return 'AS';
  if (nameLower.includes('american')) return 'AA';
  if (nameLower.includes('delta')) return 'DL';
  if (nameLower.includes('jetblue')) return 'B6';
  if (nameLower.includes('united')) return 'UA';
  if (nameLower.includes('british')) return 'BA';
  if (nameLower.includes('emirates')) return 'EK';
  if (nameLower.includes('qatar')) return 'QR';
  if (nameLower.includes('singapore')) return 'SQ';
  if (nameLower.includes('lufthansa')) return 'LH';
  if (nameLower.includes('air france')) return 'AF';
  if (nameLower.includes('frontier')) return 'F9';
  if (nameLower.includes('southwest')) return 'WN';
  if (nameLower.includes('spirit')) return 'NK';
  if (nameLower.includes('air india')) return 'AI';
  if (nameLower.includes('indigo')) return '6E';
  return cleanId.substring(0, 2);
}

// Render Real Airline Logo with Google Flights CDN and Kiwi fallback
function getAirlineLogoHTML(carrierIdentifier, carrierName = '') {
  const code = getCarrierCode(carrierIdentifier || carrierName) || 'generic';
  const altText = carrierName || carrierIdentifier || 'Airline';
  const gstaticUrl = `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;
  const kiwiUrl = `https://images.kiwi.com/airlines/64x64/${code}.png`;

  return `<img src="${gstaticUrl}" alt="${altText} Logo" class="airline-real-logo-img" 
      loading="lazy"
      onerror="if(this.src!=='${kiwiUrl}'){this.src='${kiwiUrl}';}else{this.onerror=null;this.src='https://www.gstatic.com/flights/airline_logos/70px/generic.png';}" 
      style="width: 100%; height: 100%; object-fit: contain; display: block; margin: auto;" />`;
}

// Make getAirlineLogoSVG also return the official image logo
function getAirlineLogoSVG(carrierIdentifier) {
  return getAirlineLogoHTML(carrierIdentifier);
}

window.getAirlineLogoSVG = getAirlineLogoSVG;
window.getAirlineLogoHTML = getAirlineLogoHTML;
window.getCarrierCode = getCarrierCode;
window.AIRLINE_LOGOS = AIRLINE_LOGOS;


