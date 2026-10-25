import { create } from 'zustand'

const useLanguageStore = create((set) => ({
    language: localStorage.getItem('language') || 'en',
    setLanguage: (language) => set(() => {
        const next = language === 'am' ? 'am' : 'en'
        localStorage.setItem('language', next)
        return { language: next }
    }),
    toggleLanguage: () =>
        set((state) => {
            const next = state.language === 'en' ? 'am' : 'en'
            localStorage.setItem('language', next)
            return { language: next }
        }),
}))

export default useLanguageStore
