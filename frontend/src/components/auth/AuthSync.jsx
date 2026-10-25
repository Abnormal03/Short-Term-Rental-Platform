import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import useUserStore from '../../store/useUser';
import api from '../../lib/axios';
import useLanguageStore from '../../store/useLanguageStore';

const AuthSync = () => {
    const { isLoaded, isSignedIn, user: clerkUser } = useUser();
    const { getToken } = useAuth();
    const { setUser, clearUser, setProfileLoading } = useUserStore();

    useEffect(() => {
        let isCurrent = true;
        const syncUserWithBackend = async () => {
            if (isLoaded && isSignedIn && clerkUser) {
                setProfileLoading();
                try {
                    const token = await getToken();
                    const response = await api.get('/auth/me', {
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    });
                    const dbUser = response.data;
                    if (isCurrent) {
                        setUser(clerkUser, dbUser?.role || 'GUEST', dbUser?.phoneNumber || null, dbUser?.profileComplete, dbUser?.accountStatus);
                        useLanguageStore.getState().setLanguage(dbUser?.role === 'ADMIN' ? 'en' : dbUser?.language || 'en');
                    }
                } catch (error) {
                    console.error("Failed to sync user with backend:", error.message);
                    if (isCurrent) setUser(clerkUser, 'GUEST', null, null);
                }
            } else if (isLoaded && !isSignedIn) {
                clearUser();
                useLanguageStore.getState().setLanguage('en');
            }
        };

        syncUserWithBackend();
        return () => { isCurrent = false; };
    }, [isLoaded, isSignedIn, clerkUser, getToken, setUser, clearUser, setProfileLoading]);

    return null;
};

export default AuthSync;
