import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { googleOAuth } from '@/lib/auth';
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
        await googleOAuth.init();
        setIsGoogleLoaded(true);
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
            {isGoogleLoaded ? (
              <div className="space-y-4">
                <div id="google-signin-button" />
                <button
                  onClick={() => googleOAuth.prompt()}
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Sign in with Google'
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="lg" />
                <span className="ml-2 text-sm text-gray-500">Loading Google Sign-In...</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Google OAuth Script */}
      <script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).google) {
            (window as any).google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              callback: handleGoogleLogin,
            });
            
            (window as any).google.accounts.id.renderButton(
              document.getElementById('google-signin-button'),
              {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
              }
            );
          }
        }}
      />
    </div>
  );
};

export default Login;
