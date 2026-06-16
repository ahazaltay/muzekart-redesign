/**
 * V2 Theme and Font Manager - Müzekart Redesign
 * Ensures persistent themes, dynamic color customizations, and fluid typography.
 */

// Default design tokens as defined in the design system handoff
const defaultThemeKeys = {
  '--surface': '#FBF9F6',               // Kum Beji
  '--surface-dim': '#E6DFD5',           // Warm Stone Gray
  '--surface-bright': '#FBF9F6',
  '--surface-container-lowest': '#FFFFFF', // Temiz Beyaz
  '--surface-container-low': '#F7F4EF',
  '--surface-container': '#F0EAE1',
  '--surface-container-high': '#E8E0D5',
  '--surface-container-highest': '#DFD6C9',
  '--on-surface': '#1E2022',            // Derin Kömür
  '--on-surface-variant': '#4A4D50',
  '--outline': '#8A8D90',
  
  '--primary-color': '#10cdda',         // Mavi (Heritage Accent Blue)
  '--elegant-gold': '#FF9377',          // Accent Gold
  '--background-color': '#FBF9F6',       // Kum Beji
  '--stone-gray': '#E6DFD5',            // Warm Stone Gray
  '--deep-charcoal': '#1E2022',          // Derin Kömür
  '--paper-white': '#FFFFFF',            // Temiz Beyaz
  '--heritage-blue': '#00539C',          // Tertiary Accent Blue

  '--font-headline': 'Inter',          // Editorial Header Font
  '--font-body': 'Inter',                // Modern Body/UI Font

  '--margin-desktop': '64px',
  '--section-gap': '120px',

  '--radius-default': '4px',
  '--radius-lg': '6px',
  '--radius-xl': '8px'
};

// Dynamically inject Google Fonts links
function loadGoogleFont(fontName) {
  if (!fontName) return;
  const standardFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif'];
  if (standardFonts.includes(fontName.toLowerCase())) return;

  const normalized = fontName.trim();
  const fontUrlName = normalized.replace(/\s+/g, '+');
  const id = `google-font-${fontUrlName.toLowerCase()}`;
  
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontUrlName}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

// Convert Hex to RGBA utility helper
function hexToRgba(hex, alpha) {
  if (!hex || hex.indexOf('#') !== 0) return hex;
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Set up CSS custom properties on document root
function applyActiveTheme() {
  const root = document.documentElement;
  
  // 1. Dark Mode Class Detection
  const isNightMuseum = window.location.pathname.includes('night-museum.html');
  let savedDarkMode = localStorage.getItem('user-theme-pref');
  
  if (!savedDarkMode) {
    savedDarkMode = localStorage.getItem('theme-mode') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    localStorage.setItem('user-theme-pref', savedDarkMode);
  }

  if (isNightMuseum) {
    root.classList.add('dark');
  } else {
    if (savedDarkMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // 2. Custom Property Overrides from LocalStorage
  const appliedValues = {};
  for (const [key, defaultValue] of Object.entries(defaultThemeKeys)) {
    const savedValue = localStorage.getItem(`v2-theme-${key}`);
    if (savedValue !== null) {
      root.style.setProperty(key, savedValue);
      appliedValues[key] = savedValue;
    } else {
      root.style.removeProperty(key);
      appliedValues[key] = defaultValue;
    }
    
    // Auto-load font files if matching typography keys
    if (key === '--font-headline' || key === '--font-body') {
      loadGoogleFont(appliedValues[key]);
    }
  }

  // 3. Apply custom dynamic overrides like backdrop color and selection
  let styleEl = document.getElementById('v2-theme-global-overrides');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'v2-theme-global-overrides';
    document.head.appendChild(styleEl);
  }

  const primaryColor = getComputedStyle(root).getPropertyValue('--primary-color').trim() || appliedValues['--primary-color'] || defaultThemeKeys['--primary-color'];
  const elegantGold = getComputedStyle(root).getPropertyValue('--elegant-gold').trim() || appliedValues['--elegant-gold'] || defaultThemeKeys['--elegant-gold'];
  const background = getComputedStyle(root).getPropertyValue('--background-color').trim() || appliedValues['--background-color'] || defaultThemeKeys['--background-color'];
  const paperWhite = getComputedStyle(root).getPropertyValue('--paper-white').trim() || appliedValues['--paper-white'] || defaultThemeKeys['--paper-white'];
  const deepCharcoal = getComputedStyle(root).getPropertyValue('--deep-charcoal').trim() || appliedValues['--deep-charcoal'] || defaultThemeKeys['--deep-charcoal'];

  styleEl.innerHTML = `
    /* Custom selections & dynamic header scrolls */
    ::selection {
      background-color: ${primaryColor};
      color: #ffffff;
    }
    
    /* Root custom variables mapping for theme variables sync */
    :root {
      --font-headline-family: "${appliedValues['--font-headline'] || 'Cinzel'}", serif;
      --font-body-family: "${appliedValues['--font-body'] || 'Inter'}", sans-serif;
    }
    
    header.scrolled {
      background-color: ${hexToRgba(background, 0.85)} !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border-bottom: 1px solid ${hexToRgba(elegantGold, 0.2)} !important;
    }
    .dark header.scrolled {
      background-color: ${hexToRgba(deepCharcoal, 0.85)} !important;
      border-bottom: 1px solid ${hexToRgba(elegantGold, 0.2)} !important;
    }
  `;

  // 4. Dynamically update favicon color to match primary color
  updateDynamicFavicon(primaryColor);
}

function updateDynamicFavicon(primaryColor) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  
  const fillHex = primaryColor.replace('#', '%23');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="${fillHex}" stroke="${fillHex}" stroke-width="6"/>
    <path d="M16 80V56H21V20H26L50 51L74 20H79V80H74V45L50 64L26 45V56H31V80H16Z" fill="white"/>
  </svg>`;
  
  const dataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent.trim());
  link.href = dataUri;
}

// Set Dark/Light Mode
function setThemeMode(mode) {
  localStorage.setItem('user-theme-pref', mode);
  localStorage.setItem('theme-mode', mode); // legacy sync
  applyActiveTheme();
}

// Toggle Dark/Light Mode
function toggleThemeMode() {
  const isDark = document.documentElement.classList.contains('dark');
  setThemeMode(isDark ? 'light' : 'dark');
}

// Update specific custom property
function updateThemeVariable(key, value) {
  if (defaultThemeKeys[key] !== undefined) {
    localStorage.setItem(`v2-theme-${key}`, value);
    applyActiveTheme();
  }
}

// Reset theme settings
function resetThemeVariables() {
  for (const key of Object.keys(defaultThemeKeys)) {
    localStorage.removeItem(`v2-theme-${key}`);
  }
  localStorage.removeItem('theme-mode');
  applyActiveTheme();
}

// Run immediately before window paint to avoid FOUC (Flash of Unstyled Content)
applyActiveTheme();

// Expose API globally
window.V2Theme = {
  toggleMode: toggleThemeMode,
  setMode: setThemeMode,
  updateVariable: updateThemeVariable,
  reset: resetThemeVariables,
  defaultKeys: defaultThemeKeys,
  loadFont: loadGoogleFont
};
