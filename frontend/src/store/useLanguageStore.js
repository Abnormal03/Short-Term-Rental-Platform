import { create } from 'zustand'

const useLanguageStore = create((set) => ({
    language: localStorage.getItem('language') || 'en',
    toggleLanguage: () =>
        set((state) => {
            const next = state.language === 'en' ? 'am' : 'en'
            localStorage.setItem('language', next)
            return { language: next }
        }),
}))

export default useLanguageStore