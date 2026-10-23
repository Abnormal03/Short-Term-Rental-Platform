import { create } from 'zustand';

const useUserStore = create((set) => ({
    user: null,
    role: null,
    phoneNumber: null,
    profileStatus: 'loading',
    isLoaded: false,
    setUser: (user, role, phoneNumber, profileComplete) => set({
        user,
        role,
        phoneNumber,
        profileStatus: profileComplete === true ? 'complete' : profileComplete === false ? 'incomplete' : 'error',
        isLoaded: true,
    }),
    setProfileLoading: () => set({ profileStatus: 'loading' }),
    clearUser: () => set({ user: null, role: null, phoneNumber: null, profileStatus: 'loading', isLoaded: true }),
}));

export default useUserStore;
