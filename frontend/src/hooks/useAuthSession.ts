import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { signalRService } from '@/src/services/SignalRService';

export function useAuthSession() {
    const login = async (token: string, refreshToken: string, role?: string) => {
        try {
            await SecureStore.setItemAsync('accessToken', token);
            await SecureStore.setItemAsync('refreshToken', refreshToken);

            if (role === 'Master') {
                router.replace('/(master)/dashboard');
                signalRService.start();
            } else {
                router.replace('/(home)/home');
            }
        } catch (e) {
            console.error('Failed to save tokens during login', e);
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            signalRService.stop();
            router.replace('/(auth)/login');
        } catch (e) {
            console.error('Failed to clear tokens during logout', e);
        }
    };

    return { login, logout };
}
