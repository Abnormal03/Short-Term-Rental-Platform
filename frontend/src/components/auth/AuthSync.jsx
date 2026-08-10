import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import useUserStore from '../../store/useUser';
import api from '../../lib/axios';

const AuthSync = () => {
    const { isLoaded, isSignedIn, user: clerkUser } = useUser();
    const { setUser, clearUser } = useUserStore();

    useEffect(() => {
        const syncUserWithBackend = async () => {
            if (isLoaded && isSignedIn && clerkUser) {
                try {
                    const response = await api.get(`/auth/me`);
                    
                    const dbUser = response.data;
                    setUser(clerkUser, dbUser?.role || 'GUEST', dbUser?.phoneNumber || null);
                } catch (error) {
                    console.error("Failed to sync user with backend:", error.message);
                    setUser(clerkUser, 'GUEST');
                }
            } else if (isLoaded && !isSignedIn) {
                clearUser();
            }
        };

        syncUserWithBackend();
    }, [isLoaded, isSignedIn, clerkUser, setUser, clearUser]);

    return null;
};

export default AuthSync;
