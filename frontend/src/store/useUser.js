import { create } from 'zustand';

const useUserStore = create((set) => ({
    user: null,
    role: null,
    accountStatus: null,
    phoneNumber: null,
    profileStatus: 'loading',
    isLoaded: false,
    setUser: (user, role, phoneNumber, profileComplete, accountStatus) => set((state) => ({
        user,
        role,
        phoneNumber,
        accountStatus: accountStatus ?? state.accountStatus ?? 'ACTIVE',
        profileStatus: profileComplete === true ? 'complete' : profileComplete === false ? 'incomplete' : 'error',
        isLoaded: true,
    })),
    setProfileLoading: () => set({ profileStatus: 'loading' }),
    clearUser: () => set({ user: null, role: null, accountStatus: null, phoneNumber: null, profileStatus: 'loading', isLoaded: true }),
}));

export default useUserStore;
