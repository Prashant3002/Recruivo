"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useAuthContext } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { directLogin, user, loading: authLoading } = useAuthContext()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Check if user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user explicitly navigated to login page with special parameters
        const urlParams = new URLSearchParams(window.location.search);
        const isExplicitLoginRequest = urlParams.has('explicit') || urlParams.has('force');
        const isLogoutRequest = urlParams.has('logout');
        
        // Handle explicit logout request
        if (isLogoutRequest) {
          console.log('Logout request detected - clearing auth data');
          
          // Direct simple logout function to bypass any NextAuth issues
          const simpleLogout = () => {
            // Clear localStorage
            try {
              localStorage.clear();
            } catch (e) {
              console.error("Error clearing localStorage:", e);
            }
            
            // Clear all cookies
            document.cookie.split(";").forEach(function(c) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // Remove URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Show toast
            toast({
              title: "Logged Out",
              description: "You have been successfully logged out.",
            });
          };
          
          // First try the API, then fall back to direct method
          try {
            const response = await fetch('/api/auth/logout', {
              method: 'GET',
              credentials: 'include',
            });
            
            if (response.ok) {
              console.log('Logout API call successful');
            } else {
              console.error('Logout API call failed, using direct method instead');
              simpleLogout();
            }
          } catch (apiError) {
            console.error('Error calling logout API, using direct method instead:', apiError);
            simpleLogout();
          }
          
          // Regardless of API call, also do direct logout for redundancy
          simpleLogout();
          
          // Force page reload after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 500);
          
          return;
        }
        
        // If this is an explicit login request, don't auto-redirect
        if (isExplicitLoginRequest) {
          console.log('Explicit login request detected - not redirecting');
          
          // Clear any existing session data to ensure a fresh login
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
          document.cookie = "isLoggedIn=false; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          return;
        }
        
        // Check localStorage first (faster than API call)
        const storedUser = localStorage.getItem('authUser');
        const isLoggedInCookie = document.cookie.includes('isLoggedIn=true');
        
        if (storedUser || isLoggedInCookie || user) {
          // If user data is available, redirect based on role
          let role = 'student'; // Default
          
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              role = userData.role || 'student';
            } catch (e) {
              console.error('Error parsing stored user data:', e);
            }
          } else if (user) {
            role = user.role;
          }
          
          console.log('User already logged in, redirecting to dashboard. Role:', role);
          
          if (role === 'student') {
            router.replace('/student');
          } else if (role === 'recruiter') {
            router.replace('/recruiter');
          } else if (role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/');
          }
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };
    
    checkAuth();
  }, [router, user, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    
    try {
      // Log current authentication state before login attempt
      console.log("Attempting login with:", { email: values.email })
      
      // Use the simplified directLogin method to avoid complex auth flows
      const response = await directLogin(values.email, values.password)
      
      console.log("Login response:", {
        success: !!response,
        userReceived: !!response?.user,
        role: response?.user?.role
      })
      
      // Redirect based on user role
      if (response && response.user) {
        const { role } = response.user;
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.user.name || ''}!`,
        })
        
        // Store auth data in localStorage to persist it
        localStorage.setItem('authUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token || '');
        document.cookie = `isLoggedIn=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        
        console.log("Redirecting to dashboard based on role:", role);
        
        // Force immediate navigation instead of using setTimeout
        if (role === 'student') {
          window.location.replace('/student');
        } else if (role === 'recruiter') {
          window.location.replace('/recruiter');
        } else if (role === 'admin') {
          window.location.replace('/admin');
        } else {
          window.location.replace('/');
        }
      } else {
        // If no user in response, show error
        console.error("Login successful but no user data received");
        toast({
          title: "Login issue",
          description: "Logged in successfully but profile data could not be loaded. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Determine the appropriate error message based on the error
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (error.message?.includes("Authentication error")) {
        errorMessage = "Authentication service error. Please try again later.";
      } else if (error.message?.includes("Invalid user data")) {
        errorMessage = "Could not retrieve user profile. Please try again.";
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading indicator while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Checking login status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center w-full max-w-md p-8 mx-auto">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:underline mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-t from-primary to-primary-foreground flex items-center justify-center">
          <div className="max-w-md p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Campus Recruitment</h2>
            <p className="text-lg">
              Connect with top employers, showcase your skills, and find your dream job with our innovative platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 