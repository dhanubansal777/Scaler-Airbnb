"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { SearchProvider } from "@/lib/search-context";
import AuthModal from "@/components/navbar/AuthModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <FavoritesProvider>
          <SearchProvider>
            {children}
            <AuthModal />
            <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />
          </SearchProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
