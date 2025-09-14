import { useState, useEffect, useCallback } from 'react';
import { authUtils, User } from '@/lib/auth';
import { useRouter } from 'next/router';

export const useAuth = () => {
  const [authState, setAuthState] = useState(authUtils.getAuthData());
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (authState.isAuthenticated) {
        // Verify token is still valid
        const isValid = await authUtils.verifyToken();
        if (!isValid) {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };

    initAuth();
  }, []);

  // Google login
  const googleLogin = useCallback(async (googleToken: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { user, token } = await authUtils.googleLogin(googleToken);
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { user, token };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authUtils.logout();
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      router.push('/login');
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [router]);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const user = await authUtils.updateProfile(data);
      
      setAuthState(prev => ({
        ...prev,
        user: user || prev.user,
        isLoading: false,
      }));

      return user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const newToken = await authUtils.refreshToken();
      if (newToken) {
        setAuthState(prev => ({
          ...prev,
          token: newToken,
        }));
        return newToken;
      } else {
        // Token refresh failed, logout user
        await logout();
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return null;
    }
  }, [logout]);

  return {
    ...authState,
    googleLogin,
    logout,
    updateProfile,
    refreshToken,
  };
};
