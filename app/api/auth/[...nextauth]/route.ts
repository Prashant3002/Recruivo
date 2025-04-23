import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Add better error handling
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create the NextAuth handler with proper error handling
const handler = NextAuth(authOptions);

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST }; 