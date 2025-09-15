import { authAPI } from './api';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authUtils = {
  // Get stored auth data
  getAuthData: (): AuthState => {
    if (typeof window === 'undefined') {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading: false,
    };
  },

  // Set auth data
  setAuthData: (user: User, token: string): void => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear auth data
  clearAuthData: (): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Google login
  googleLogin: async (googleToken: string): Promise<{ user: User; token: string }> => {
    try {
      console.log('Calling authAPI.googleLogin with token length:', googleToken?.length);
      const response = await authAPI.googleLogin(googleToken);
      console.log('Auth API response:', response.data);
      
      const { user, token } = response.data.data;
      console.log('Extracted user and token:', { user, token: token?.substring(0, 20) + '...' });
      
      authUtils.setAuthData(user, token);
      console.log('Auth data set in localStorage');
      return { user, token };
    } catch (error: any) {
      console.error('Google login failed:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      authUtils.clearAuthData();
    }
  },

  // Refresh token
  refreshToken: async (): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await authAPI.refreshToken(token);
      const { token: newToken } = response.data.data;
      
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      authUtils.clearAuthData();
      return null;
    }
  },

  // Verify token
  verifyToken: async (): Promise<boolean> => {
    try {
      const response = await authAPI.verifyToken();
      return response.data.success;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  },

  // Get profile
  getProfile: async (): Promise<User | null> => {
    try {
      const response = await authAPI.getProfile();
      const { user } = response.data.data;
      
      // Update stored user data
      const token = localStorage.getItem('token');
      if (token) {
        authUtils.setAuthData(user, token);
      }
      
      return user;
    } catch (error) {
      console.error('Get profile failed:', error);
      return null;
    }
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User | null> => {
    try {
      const response = await authAPI.updateProfile(data);
      const { user } = response.data.data;
      
      // Update stored user data
      const token = localStorage.getItem('token');
      if (token) {
        authUtils.setAuthData(user, token);
      }
      
      return user;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },
};

// Google OAuth configuration
export const googleOAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '7230563022-th5imecc10i0pgcv4esc0dke1v9s2pf2.apps.googleusercontent.com',
  scope: 'openid email profile',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  // Check if current origin is a Vercel deployment
  isVercelDeployment: typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'),
  // Base Vercel domain pattern
  vercelDomainPattern: /^https:\/\/xeno-crm-v5.*\.vercel\.app$/,
};

// Google OAuth helper
export const googleOAuth = {
  // Initialize Google OAuth
  init: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google OAuth can only be initialized in browser'));
        return;
      }

      if (!googleOAuthConfig.clientId) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      // Load Google OAuth script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
      document.head.appendChild(script);
    });
  },

  // Render Google Sign-In button
  renderButton: (elementId: string, onSuccess: (credential: string) => void, onError?: (error: string) => void): void => {
    if (typeof window === 'undefined' || !(window as any).google) {
      console.error('Google OAuth not initialized');
      return;
    }

    const currentOrigin = window.location.origin;
    console.log('Current origin:', currentOrigin);
    console.log('Is Vercel deployment:', googleOAuthConfig.isVercelDeployment);
    console.log('Matches pattern:', googleOAuthConfig.vercelDomainPattern.test(currentOrigin));

    (window as any).google.accounts.id.initialize({
      client_id: googleOAuthConfig.clientId,
      callback: (response: any) => {
        console.log('Google OAuth callback received:', response);
        if (response.credential) {
          onSuccess(response.credential);
        } else {
          onError?.('No credential received');
        }
      },
      auto_select: false,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: false,
    });

    (window as any).google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      }
    );
  },

  // Prompt for Google Sign-In
  prompt: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !(window as any).google) {
        reject(new Error('Google OAuth not initialized'));
        return;
      }

      (window as any).google.accounts.id.prompt((response: any) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('No credential received'));
        }
      });
    });
  },
};
