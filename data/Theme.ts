export const THEME_NAME_LIST = [
  "AURORA_INK",
  "DUSTY_ORCHID",
  "CITRUS_SLATE",
  "MOSS_PARCHMENT",
  "POLAR_MINT",
  "OBSIDIAN_BLOOM",
] as const;

export const THEMES = {
  AURORA_INK: {
    background: "#0b1020",
    foreground: "#f4f6ff",
    card: "#121a33",
    cardForeground: "#f4f6ff",
    popover: "#121a33",
    popoverForeground: "#f4f6ff",
    primary: "#7c5cff",
    primaryRgb: "124, 92, 255",
    primaryForeground: "#0b1020",
    secondary: "#1a2547",
    secondaryForeground: "#e8ebff",
    muted: "#141d3a",
    mutedForeground: "#a9b2d6",
    accent: "#38bdf8",
    accentForeground: "#0b1020",
    destructive: "#ff4b4b",
    border: "#1e293b",
    input: "#1e293b",
    ring: "#7c5cff",
    radius: "0.5rem",
    chart: ["#ff4fd8", "#6dffb2", "#5cc8ff", "#ffb84d", "#b18cff"],
  },
  DUSTY_ORCHID: {
    background: "#1a1625",
    foreground: "#f3f0ff",
    card: "#251f33",
    cardForeground: "#f3f0ff",
    popover: "#251f33",
    popoverForeground: "#f3f0ff",
    primary: "#d4a5ff",
    primaryRgb: "212, 165, 255",
    primaryForeground: "#1a1625",
    secondary: "#2d2440",
    secondaryForeground: "#e9e4ff",
    muted: "#241d30",
    mutedForeground: "#b4a9c3",
    accent: "#f0abfc",
    accentForeground: "#1a1625",
    destructive: "#ff5e7e",
    border: "#3a2e4d",
    input: "#3a2e4d",
    ring: "#d4a5ff",
    radius: "0.5rem",
    chart: ["#f472b6", "#a78bfa", "#818cf8", "#fb7185", "#d946ef"],
  },
  CITRUS_SLATE: {
    background: "#0f141a",
    foreground: "#f5f7fb",
    card: "#18212c",
    cardForeground: "#f5f7fb",
    popover: "#18212c",
    popoverForeground: "#f5f7fb",
    primary: "#ff7a2f",
    primaryRgb: "255, 122, 47",
    primaryForeground: "#0f141a",
    secondary: "#1f2a36",
    secondaryForeground: "#f5f7fb",
    muted: "#18212c",
    mutedForeground: "#aab5c3",
    accent: "#7dd3ff",
    accentForeground: "#0f141a",
    destructive: "#ff3b5c",
    border: "#2a394a",
    input: "#2a394a",
    ring: "#ff7a2f",
    radius: "0.5rem",
    chart: ["#ff4fd8", "#6dffb2", "#5cc8ff", "#ffb84d", "#b18cff"],
  },
  MOSS_PARCHMENT: {
    background: "#fdfcf0",
    foreground: "#1a2421",
    card: "#f4f1db",
    cardForeground: "#1a2421",
    popover: "#f4f1db",
    popoverForeground: "#1a2421",
    primary: "#4a6741",
    primaryRgb: "74, 103, 65",
    primaryForeground: "#fdfcf0",
    secondary: "#e5e0c1",
    secondaryForeground: "#1a2421",
    muted: "#efe9d5",
    mutedForeground: "#5c6b65",
    accent: "#8b9d77",
    accentForeground: "#1a2421",
    destructive: "#963a3a",
    border: "#dcd4b8",
    input: "#dcd4b8",
    ring: "#4a6741",
    radius: "0.5rem",
    chart: ["#5b8266", "#a1917b", "#8e7c68", "#6a5d4d", "#4a3b2a"],
  },
  POLAR_MINT: {
    background: "#f0f9f6",
    foreground: "#0a2f2b",
    card: "#e2f2ed",
    cardForeground: "#0a2f2b",
    popover: "#e2f2ed",
    popoverForeground: "#0a2f2b",
    primary: "#2dd4bf",
    primaryRgb: "45, 212, 191",
    primaryForeground: "#0a2f2b",
    secondary: "#cceff3",
    secondaryForeground: "#0a2f2b",
    muted: "#d8ede8",
    mutedForeground: "#4b7a74",
    accent: "#5eead4",
    accentForeground: "#0a2f2b",
    destructive: "#f43f5e",
    border: "#b2dbd4",
    input: "#b2dbd4",
    ring: "#2dd4bf",
    radius: "0.5rem",
    chart: ["#14b8a6", "#0ea5e9", "#2dd4bf", "#5eead4", "#bbf7d0"],
  },
  OBSIDIAN_BLOOM: {
    background: "#080808",
    foreground: "#ffffff",
    card: "#141414",
    cardForeground: "#ffffff",
    popover: "#141414",
    popoverForeground: "#ffffff",
    primary: "#ff2d55",
    primaryRgb: "255, 45, 85",
    primaryForeground: "#ffffff",
    secondary: "#1f1f1f",
    secondaryForeground: "#e0e0e0",
    muted: "#1a1a1a",
    mutedForeground: "#888888",
    accent: "#ff3b30",
    accentForeground: "#ffffff",
    destructive: "#ff453a",
    border: "#2c2c2e",
    input: "#2c2c2e",
    ring: "#ff2d55",
    radius: "0.5rem",
    chart: ["#ff375f", "#ff9f0a", "#32d74b", "#64d2ff", "#bf5af2"],
  },
} as const;

export type ThemeKey = keyof typeof THEMES;

// Widen all string-literal fields to plain `string` so that dynamically
// derived themes (e.g. from deriveFullTheme) are assignable to Theme.
type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : T[K] extends readonly (infer U)[] ? U extends string ? readonly string[] : T[K] : T[K];
};

export type Theme = Widen<(typeof THEMES)[ThemeKey]> & {
  fontFamily?: string;
};

// ─── Color Utility Functions ─────────────────────────────────────────────────

/** Parse a hex string (#rrggbb or #rgb) into [r, g, b] 0-255 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Format [r, g, b] back to hex */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}

/** WCAG relative luminance (0 = black, 1 = white) */
export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Returns #ffffff or #0a0a0a — whichever contrasts better against the given bg */
export function getContrastColor(bg: string): string {
  return getLuminance(bg) > 0.35 ? '#0a0a0a' : '#ffffff'
}

/**
 * Mix hex color toward white (amount > 0) or toward black (amount < 0).
 * amount: -1.0 (full black) to 1.0 (full white)
 */
function tintColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const target = amount > 0 ? 255 : 0
  const t = Math.abs(amount)
  return rgbToHex(r + (target - r) * t, g + (target - g) * t, b + (target - b) * t)
}

/** Lighten a color by a given ratio (0-1) */
function lighten(hex: string, ratio: number): string { return tintColor(hex, ratio) }
/** Darken a color by a given ratio (0-1) */
function darken(hex: string, ratio: number): string { return tintColor(hex, -ratio) }

/**
 * Derive a full, harmonious 18-token theme from 3-5 user-selected colors.
 * Foreground / text colors are auto-calculated using WCAG contrast.
 */
export function deriveFullTheme(
  primary: string,
  background: string,
  card: string,
  accent?: string,
  foreground?: string,
  radius?: string,
  fontFamily?: string,
): Theme {
  const isLightBg = getLuminance(background) > 0.35

  // Auto-derive foreground if not provided
  const fg = foreground || getContrastColor(background)
  const cardFg = getContrastColor(card)
  const primaryFg = getContrastColor(primary)

  // Derive accent from primary if not provided (complementary tint)
  const derivedAccent = accent || (isLightBg ? lighten(primary, 0.35) : lighten(primary, 0.25))
  const accentFg = getContrastColor(derivedAccent)

  // Secondary is a subtle tone between background and card
  const secondary = isLightBg ? darken(background, 0.07) : lighten(background, 0.07)
  const secondaryFg = getContrastColor(secondary)

  // Muted is a softer version of background
  const muted = isLightBg ? darken(background, 0.04) : lighten(background, 0.04)
  const mutedFg = isLightBg ? darken(fg, 0.35) : lighten(fg, 0.35)

  // Border is a slightly more prominent version of muted
  const border = isLightBg ? darken(background, 0.12) : lighten(background, 0.12)

  // Extract rgb components for primaryRgb
  const [pr, pg, pb] = hexToRgb(primary)

  // Chart colors: variations of primary + accent
  const chart = [
    primary,
    derivedAccent,
    isLightBg ? darken(primary, 0.2) : lighten(primary, 0.25),
    isLightBg ? lighten(derivedAccent, 0.2) : darken(derivedAccent, 0.2),
    isLightBg ? darken(background, 0.25) : lighten(background, 0.3),
  ]

  return {
    background,
    foreground: fg,
    card,
    cardForeground: cardFg,
    popover: card,
    popoverForeground: cardFg,
    primary,
    primaryRgb: `${pr}, ${pg}, ${pb}`,
    primaryForeground: primaryFg,
    secondary,
    secondaryForeground: secondaryFg,
    muted,
    mutedForeground: mutedFg,
    accent: derivedAccent,
    accentForeground: accentFg,
    destructive: '#ef4444',
    border,
    input: border,
    ring: primary,
    radius: radius || '0.5rem',
    fontFamily: fontFamily || 'Inter, system-ui, sans-serif',
    chart,
  }
}

export function buildCustomTheme(overrides: Partial<Theme>): string {
  // Use AURORA_INK as base
  const baseTheme = THEMES['AURORA_INK'];
  const customTheme = { ...baseTheme, ...overrides };
  return `CUSTOM:${JSON.stringify(customTheme)}`;
}

export function parseTheme(themeString: string | undefined): Theme {
  if (!themeString) return THEMES['AURORA_INK'] as Theme;
  
  if (themeString.startsWith('CUSTOM:')) {
    try {
      const json = themeString.replace('CUSTOM:', '');
      return JSON.parse(json) as Theme;
    } catch (e) {
      console.error("Failed to parse custom theme", e);
      return THEMES['AURORA_INK'] as Theme;
    }
  }

  // Fallback to standard theme
  const key = themeString as ThemeKey;
  return (THEMES[key] as Theme) || (THEMES['AURORA_INK'] as Theme);
}

export function themeToCssVars(themeObj: Theme | string) {
  const theme = typeof themeObj === 'string' ? parseTheme(themeObj) : themeObj;
  return `
    :root {
      --background: ${theme.background};
      --foreground: ${theme.foreground};

      --card: ${theme.card};
      --card-foreground: ${theme.cardForeground};

      --popover: ${theme.popover};
      --popover-foreground: ${theme.popoverForeground};

      --primary: ${theme.primary};
      --primary-rgb: ${theme.primaryRgb};
      --primary-foreground: ${theme.primaryForeground};

      --secondary: ${theme.secondary};
      --secondary-foreground: ${theme.secondaryForeground};

      --muted: ${theme.muted};
      --muted-foreground: ${theme.mutedForeground};

      --accent: ${theme.accent};
      --accent-foreground: ${theme.accentForeground};

      --destructive: ${theme.destructive};

      --border: ${theme.border};
      --input: ${theme.input};
      --ring: ${theme.ring};

      --radius: ${theme.radius};
      --font-family: ${theme.fontFamily || 'Inter, system-ui, sans-serif'};

      /* charts */
      --chart-1: ${theme.chart?.[0] || '#ff4fd8'};
      --chart-2: ${theme.chart?.[1] || '#6dffb2'};
      --chart-3: ${theme.chart?.[2] || '#5cc8ff'};
      --chart-4: ${theme.chart?.[3] || '#ffb84d'};
      --chart-5: ${theme.chart?.[4] || '#b18cff'};
    }
  `;
}

