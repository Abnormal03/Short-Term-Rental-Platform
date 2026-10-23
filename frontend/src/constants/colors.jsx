export const THEME_STORAGE_KEY = 'theme'
export const DEFAULT_THEME = 'light'

export const COLOR_PALETTES = {
    light: {
        bg: '#ffffff',
        bg2: '#f0f3ff',
        surface: '#ffffff',
        primary: '#1b6b45',
        secondary: '#f59e0b',
        tertiary: '#0d3d27',
        neutral: '#f3f4f6',
        text: '#334155',
        text2: '#64748b',
        border: '#e5e7eb',
        buttonText: '#ffffff',
        onSecondary: '#1f2937',
        danger: '#b91c1c',
        success: '#15803d',
    },
    dark: {
        bg: '#0f172a',
        bg2: '#1e293b',
        surface: '#1e293b',
        primary: '#2d9e61',
        secondary: '#f59e0b',
        tertiary: '#f59e0b',
        neutral: '#334155',
        text: '#f1f5f9',
        text2: '#cbd5e1',
        border: '#334155',
        buttonText: '#ffffff',
        onSecondary: '#1f2937',
        danger: '#f87171',
        success: '#4ade80',
    },
}

const CSS_COLOR_NAMES = {
    bg: '--bg',
    bg2: '--bg-2',
    surface: '--surface',
    primary: '--primary',
    secondary: '--secondary',
    tertiary: '--tertiary',
    neutral: '--neutral',
    text: '--text',
    text2: '--text-2',
    border: '--border',
    buttonText: '--button-text',
    onSecondary: '--on-secondary',
    danger: '--danger',
    success: '--success',
}

export function applyTheme(theme) {
    if (typeof document === 'undefined') return
    const selectedTheme = COLOR_PALETTES[theme] ? theme : DEFAULT_THEME
    const root = document.documentElement
    Object.entries(COLOR_PALETTES[selectedTheme]).forEach(([name, value]) => {
        root.style.setProperty(CSS_COLOR_NAMES[name], value)
    })
    root.classList.toggle('dark', selectedTheme === 'dark')
    root.dataset.theme = selectedTheme
    root.style.colorScheme = selectedTheme
}

export function getSavedTheme() {
    if (typeof localStorage === 'undefined') return DEFAULT_THEME
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : DEFAULT_THEME
}
