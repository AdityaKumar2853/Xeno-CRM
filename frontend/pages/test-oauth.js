import { useEffect } from 'react';

export default function TestOAuth() {
  useEffect(() => {
    console.log('Environment Variables:');
    console.log('NEXT_PUBLIC_GOOGLE_CLIENT_ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Current origin:', window.location.origin);
    
    // Test Google OAuth loading
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      console.log('Google OAuth script loaded successfully');
      
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: (response) => {
            console.log('OAuth callback received:', response);
          }
        });
        
        console.log('Google OAuth initialized successfully');
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google OAuth script');
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>OAuth Test Page</h1>
      <p>Check the browser console for detailed information.</p>
      <p>Client ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}</p>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      <p>Current Origin: {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
    </div>
  );
}
