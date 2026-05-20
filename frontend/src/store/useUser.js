import { create } from 'zustand';

const useUser = create((set) => ({
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    setUser: (user) => {
        set(() => {
            localStorage.setItem('user', JSON.stringify(user));
            return { user }
        })
    },
    clearUser: () => {
        localStorage.removeItem('user')
        set({ user: null })
    }
}))

export default useUser;