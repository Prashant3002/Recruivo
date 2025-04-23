import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          // Use a try/catch around the fetch to handle network errors
          let response;
          try {
            response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
              })
            });
          } catch (fetchError) {
            console.error("Fetch error:", fetchError);
            throw new Error(`Connection error: ${fetchError.message}`);
          }

          if (!response.ok) {
            // Try to parse error as JSON, but handle HTML responses gracefully
            let errorData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              errorData = await response.json();
              console.error("Auth failed:", errorData);
            } else {
              const text = await response.text();
              console.error("Auth failed with non-JSON response:", text.substring(0, 100) + "...");
              errorData = { message: "Server returned an invalid response" };
            }
            throw new Error(errorData.message || `HTTP error ${response.status}`);
          }

          // Verify JSON response
          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            console.error("JSON parse error:", jsonError);
            throw new Error("Failed to parse authentication response");
          }
          
          if (!data.user) {
            throw new Error("Invalid response format: missing user data");
          }

          // Return user with token
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            token: data.token,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only add these properties when user is passed (on sign in)
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-for-development",
  debug: process.env.NODE_ENV === "development",
};

// Add better error handling
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create the NextAuth handler with proper error handling
const handler = NextAuth(authOptions);

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST }; 