import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { googleOAuth, googleOAuthConfig } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const { googleLogin, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Initialize Google OAuth
  useEffect(() => {
    const initGoogle = async () => {
      try {
        // Check if we're on the login page
        if (typeof window === 'undefined' || window.location.pathname !== '/login') {
          return;
        }

        // Load Google OAuth script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          if (typeof window !== 'undefined' && (window as any).google) {
            console.log('Google OAuth Client ID:', googleOAuthConfig.clientId);
            
            // Initialize Google OAuth
            (window as any).google.accounts.id.initialize({
              client_id: googleOAuthConfig.clientId,
              callback: handleGoogleLogin,
              auto_select: false,
              cancel_on_tap_outside: false,
            });
            
            // Wait for DOM to be ready before rendering button
            const renderButton = () => {
              const buttonElement = document.getElementById('google-signin-button');
              if (buttonElement) {
                try {
                  (window as any).google.accounts.id.renderButton(buttonElement, {
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                  });
                  setIsGoogleLoaded(true);
                } catch (error) {
                  console.error('Failed to render Google button:', error);
                  setIsGoogleLoaded(true); // Still set loaded to show fallback button
                }
              } else {
                console.error('Google sign-in button element not found, retrying...');
                // Retry after a short delay
                setTimeout(renderButton, 200);
              }
            };
            
            // Try to render immediately, then retry if needed
            setTimeout(renderButton, 100);
          }
        };
        
        script.onerror = () => {
          console.error('Failed to load Google OAuth script');
          toast.error('Failed to load Google Sign-In');
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to initialize Google OAuth:', error);
        toast.error('Failed to load Google Sign-In');
      }
    };

    initGoogle();
  }, []);

  const handleGoogleLogin = async (credential: string) => {
    try {
      setIsLoading(true);
      await googleLogin(credential);
      toast.success('Login successful!');
      router.push('/');
    } catch (error: any) {
      console.error('Google login failed:', error);
      toast.error(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Temporary bypass for testing
  const handleTestLogin = async () => {
    try {
      setIsLoading(true);
      // Create a mock user for testing
      const mockUser = {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token-123');
      
      // Force a complete page reload to reset all React state
      window.location.reload();
    } catch (error: any) {
      console.error('Test login failed:', error);
      toast.error('Test login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    console.error('Google OAuth error:', error);
    toast.error('Google Sign-In failed');
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Mini CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your customer relationship management platform
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <div className="space-y-4">
              <div id="google-signin-button" className="flex justify-center" />
              {!isGoogleLoaded && (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                  <span className="ml-2 text-sm text-gray-500">Loading Google Sign-In...</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).google) {
                    (window as any).google.accounts.id.prompt();
                  } else {
                    toast.error('Google OAuth not initialized');
                  }
                }}
                disabled={isLoading || !isGoogleLoaded}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Sign in with Google'
                )}
              </button>
              
              {/* Test Login Button */}
              <button
                onClick={handleTestLogin}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Test Login (Bypass Google OAuth)'
                )}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
