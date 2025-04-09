"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function AuthProvider({ 
  children, 
  session 
}: { 
  children: ReactNode,
  session?: any 
}) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
