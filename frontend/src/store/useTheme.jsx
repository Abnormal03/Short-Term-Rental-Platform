import { create } from 'zustand'
import { applyTheme, getSavedTheme, THEME_STORAGE_KEY } from '../constants/colors'

const initialTheme = getSavedTheme()
applyTheme(initialTheme)

const useThemeStore = create((set) => ({
    theme: initialTheme,
    setTheme: (theme) => {
        const next = theme === 'dark' ? 'dark' : 'light'
        localStorage.setItem(THEME_STORAGE_KEY, next)
        applyTheme(next)
        set({ theme: next })
    },
    toggleTheme: () => set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light'
        localStorage.setItem(THEME_STORAGE_KEY, next)
        applyTheme(next)
        return { theme: next }
    }),
}))

export function useTheme() {
    return useThemeStore()
}

export default useThemeStore
