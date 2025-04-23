import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export default function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  // Login user
  const login = useCallback(async (email?: string, password?: string) => {
    // Debug what's being passed
    console.log('Login called with:', { 
      emailProvided: !!email, 
      passwordProvided: !!password,
      emailType: typeof email,
      passwordType: typeof password
    });
    
    // Validate inputs to prevent the "Illegal arguments" error
    if (!email || !password) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Email and password are required',
      }));
      return Promise.reject(new Error('Email and password are required'));
    }
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Create a safe payload object to avoid JSON stringify issues
      const payload = {
        email: String(email),
        password: String(password)
      };
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Login failed',
        }));
        throw new Error(data.error || 'Login failed');
      }
      
      setAuthState({
        user: data.user,
        loading: false,
        error: null,
      });
      
      // Redirect based on user role
      if (data.user.role === 'student') {
        router.push('/student');
      } else if (data.user.role === 'recruiter') {
        router.push('/recruiter');
      } else if (data.user.role === 'admin') {
        router.push('/admin');
      }
      
      return data;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Login failed',
      }));
      return Promise.reject(error);
    }
  }, [router]);

  // Register user
  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'recruiter';
  }) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Registration failed',
        }));
        throw new Error(data.error || 'Registration failed');
      }
      
      setAuthState({
        user: data.user,
        loading: false,
        error: null,
      });
      
      // Redirect based on user role
      if (data.user.role === 'student') {
        router.push('/student');
      } else if (data.user.role === 'recruiter') {
        router.push('/recruiter');
      }
      
      return data;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Registration failed',
      }));
      return Promise.reject(error);
    }
  }, [router]);

  // Logout user
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Logout failed',
        }));
        console.error('Logout API call failed:', data);
      }
      
      // Clear client-side authentication state regardless of API response
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('session');
      
      // Clear cookies manually as a fallback
      document.cookie = "isLoggedIn=false; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; 
      document.cookie = "next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "next-auth.callback-url=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Reset auth state
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      
      // Navigate to login page with logout parameter to ensure complete logout
      window.location.href = '/login?logout=true';
      return;
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Even if there's an error, try to clear state and redirect anyway
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      
      setAuthState({
        user: null,
        loading: false,
        error: error.message || 'Logout failed',
      });
      
      // Force navigation to login page with logout parameter
      window.location.href = '/login?logout=true';
      return Promise.resolve(); // Don't reject on logout errors
    }
  }, []);

  // Check if user is logged in
  const checkAuth = useCallback(async () => {
    // Set loading state, but don't change other states yet to avoid UI flicker
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch('/api/auth/me');
      
      // Handle 401 (Unauthorized) or 404 (Not Found) as non-authenticated but not error states
      if (response.status === 401 || response.status === 404) {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
        return null;
      }
      
      if (!response.ok) {
        setAuthState({
          user: null,
          loading: false,
          error: 'Authentication check failed',
        });
        return null;
      }
      
      const data = await response.json();
      
      setAuthState({
        user: data.user,
        loading: false,
        error: null,
      });
      
      return data.user;
    } catch (error: any) {
      // For other errors, set error state but don't throw to prevent component crashes
      setAuthState({
        user: null,
        loading: false,
        error: 'Authentication service unavailable',
      });
      console.error('Auth check error:', error);
      return null;
    }
  }, []);

  // Direct login - simplified version that bypasses complex logic
  const directLogin = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    console.log('Using direct login with:', { emailProvided: !!email, passwordProvided: !!password });
    
    try {
      // Try the main login endpoint first
      try {
        // Simple fetch call without any complex logic
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: String(email), 
            password: String(password) 
          }),
          credentials: 'include', // Important: include cookies in the request
        });
        
        // Add better handling for empty responses
        let data;
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('Failed to parse login response:', parseError);
          throw new Error('Invalid response from login API');
        }
        
        if (!response.ok) {
          console.error('Login API error:', data);
          
          // Handle case where middleware blocked the request with a 401
          if (response.status === 401) {
            throw new Error('Authentication error: ' + (data.message || 'Login endpoint authentication error'));
          }
          
          throw new Error(data.error || 'Login failed');
        }
        
        // Handle empty user data
        if (!data || !data.user) {
          throw new Error('Invalid user data received from login API');
        }
        
        // Set local storage for client-side auth
        localStorage.setItem('authUser', JSON.stringify(data.user));
        document.cookie = `isLoggedIn=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        
        // Set auth state with the returned user data
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
        });
        
        console.log('Login successful, user:', data.user);
        
        // Return the complete response data to allow role-based routing
        return data;
      } catch (mainError) {
        // If the main login fails, try the fallback login endpoint
        console.warn('Main login endpoint failed, trying fallback:', mainError);
        
        const fallbackResponse = await fetch('/api/login-fallback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: String(email), 
            password: String(password) 
          }),
          credentials: 'include', // Important: include cookies in the request
        });
        
        // Parse fallback response
        let fallbackData;
        try {
          const text = await fallbackResponse.text();
          fallbackData = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('Failed to parse fallback login response:', parseError);
          throw new Error('Invalid response from fallback login API');
        }
        
        if (!fallbackResponse.ok) {
          console.error('Fallback login API error:', fallbackData);
          throw new Error(fallbackData.error || 'Login failed on all endpoints');
        }
        
        // Handle empty user data
        if (!fallbackData || !fallbackData.user) {
          throw new Error('Invalid user data received from fallback login API');
        }
        
        // Set local storage for client-side auth
        localStorage.setItem('authUser', JSON.stringify(fallbackData.user));
        localStorage.setItem('authToken', fallbackData.token || '');
        document.cookie = `isLoggedIn=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        
        // Set auth state with the returned user data
        setAuthState({
          user: fallbackData.user,
          loading: false,
          error: null,
        });
        
        console.log('Fallback login successful, user:', fallbackData.user);
        
        // Return the complete response data to allow role-based routing
        return fallbackData;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Login failed',
      }));
      
      throw error;
    }
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    directLogin,
    register,
    logout,
    checkAuth,
  };
} 