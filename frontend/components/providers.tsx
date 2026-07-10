"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import AuthModal from "@/components/navbar/AuthModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <FavoritesProvider>
          {children}
          <AuthModal />
          <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
