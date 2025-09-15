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
    } else {
      // Reset Google OAuth state when not authenticated
      setIsLoading(false);
      setIsGoogleLoaded(false);
    }
  }, [isAuthenticated, router]);

  // Initialize Google OAuth
  useEffect(() => {
    const initGoogle = async () => {
      try {
        // Check if we're on the login page and not already initialized
        if (typeof window === 'undefined' || window.location.pathname !== '/login') {
          return;
        }

        // Reset Google OAuth state
        setIsLoading(false);
        setIsGoogleLoaded(false);

        // Check if Google is already loaded
        if ((window as any).google && (window as any).google.accounts) {
          // Re-initialize Google OAuth
          (window as any).google.accounts.id.initialize({
            client_id: googleOAuthConfig.clientId,
            callback: handleGoogleLogin,
            auto_select: false,
            cancel_on_tap_outside: false,
            use_fedcm_for_prompt: false,
          });
          
          // Re-render the button
          const buttonElement = document.getElementById('google-signin-button');
          if (buttonElement) {
            buttonElement.innerHTML = ''; // Clear existing button
            (window as any).google.accounts.id.renderButton(buttonElement, {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
            });
          }
          
          setIsGoogleLoaded(true);
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
            console.log('Current origin:', window.location.origin);
            
            // Check if client ID is properly configured
            if (!googleOAuthConfig.clientId || googleOAuthConfig.clientId === 'your-google-client-id-here') {
              console.warn('Google OAuth Client ID not properly configured. Using test login only.');
              setIsGoogleLoaded(true);
              return;
            }
            
            // Initialize Google OAuth with additional configuration
            (window as any).google.accounts.id.initialize({
              client_id: googleOAuthConfig.clientId,
              callback: handleGoogleLogin,
              auto_select: false,
              cancel_on_tap_outside: false,
              use_fedcm_for_prompt: false, // Disable FedCM to avoid issues
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

  const handleGoogleLogin = async (response: any) => {
    try {
      console.log('Google login response received:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Extract credential from response
      const credential = response?.credential || response;
      console.log('Extracted credential:', credential ? 'Yes' : 'No');
      console.log('Credential type:', typeof credential);
      console.log('Credential length:', credential?.length);
      
      if (!credential) {
        console.error('No credential found in response:', response);
        toast.error('Google Sign-In failed: No credential received');
        return;
      }
      
      console.log('Starting Google login process...');
      setIsLoading(true);
      
      const result = await googleLogin(credential);
      console.log('Google login result:', result);
      
      toast.success('Login successful!');
      console.log('Redirecting to dashboard...');
      router.push('/');
    } catch (error: any) {
      console.error('Google login failed:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      toast.error(error.response?.data?.error?.message || 'Login failed');
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
              {isGoogleLoaded && (!googleOAuthConfig.clientId || googleOAuthConfig.clientId === 'your-google-client-id-here') && (
                <div className="text-center p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    Google OAuth not configured. Please set GOOGLE_CLIENT_ID environment variable.
                  </p>
                </div>
              )}
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
