import { create } from 'zustand';

const useUserStore = create((set) => ({
    user: null,
    role: null,
    phoneNumber: null,
    isLoaded: false,
    setUser: (user, role, phoneNumber) => set({ user, role, phoneNumber, isLoaded: true }),
    clearUser: () => set({ user: null, role: null, isLoaded: true }),
}));

export default useUserStore;