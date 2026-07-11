"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { Menu, User as UserIcon, Moon, Sun, Heart, Luggage, LayoutGrid, BadgeCheck } from "lucide-react";
import { FaAirbnb } from "react-icons/fa6";
import SearchBar from "./SearchBar";
import { useAuth } from "@/lib/auth-context";
import { useSearchState } from "@/lib/search-context";

const logoFont = Poppins({ subsets: ["latin"], weight: ["700"] });

export default function Navbar() {
  const { user, loading, openAuthModal, logout, becomeHost } = useAuth();
  const { reset: resetSearch } = useSearchState();
  const { setTheme, resolvedTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const isHostArea = pathname?.startsWith("/host");
  const compactSearch = !isHome || scrolled;

  const handleHostToggle = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!user.is_host) {
      try {
        await becomeHost();
        toast.success("You're now a host!");
      } catch {
        toast.error("Could not switch to hosting");
        return;
      }
    }
    router.push("/host");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={() => {
              resetSearch();
              if (isHome) window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex shrink-0 items-center gap-0.5 text-primary"
          >
            <FaAirbnb size={28} />
            <span className={`hidden text-xl tracking-tight sm:block ${logoFont.className}`}>airbnb</span>
          </Link>

          {!isHostArea && compactSearch && (
            <div className="flex min-w-0 flex-1 justify-center">
              <SearchBar compact />
            </div>
          )}

          {!isHostArea && !compactSearch && (
            <div className="hidden min-w-0 flex-1 justify-center md:flex">
              <SearchBar />
            </div>
          )}

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleHostToggle}
              className="hidden rounded-full px-4 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 sm:block"
            >
              {user?.is_host ? "Host dashboard" : "Become a host"}
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-full p-2.5 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-3 pr-1.5 shadow-sm hover:shadow-md"
              >
                <Menu size={16} />
                {user ? (
                  <img src={user.avatar_url} alt={user.name} className="h-7 w-7 rounded-full bg-muted" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/40 text-muted">
                    <UserIcon size={16} />
                  </span>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-64 overflow-hidden rounded-2xl border border-border bg-card py-2 shadow-2xl">
                  {loading ? null : user ? (
                    <>
                      <div className="border-b border-border px-4 pb-2 pt-1">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                      <MenuLink href="/trips" icon={<Luggage size={16} />} label="My trips" onClick={() => setMenuOpen(false)} />
                      <MenuLink href="/wishlist" icon={<Heart size={16} />} label="Wishlist" onClick={() => setMenuOpen(false)} />
                      <MenuLink
                        href="/host"
                        icon={<LayoutGrid size={16} />}
                        label={user.is_host ? "Host dashboard" : "Become a host"}
                        onClick={() => setMenuOpen(false)}
                      />
                      <MenuLink
                        href="/coming-soon?topic=Identity%20verification"
                        icon={<BadgeCheck size={16} />}
                        label="Verify identity"
                        onClick={() => setMenuOpen(false)}
                      />
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                          toast("Logged out");
                          router.push("/");
                        }}
                        className="mt-1 block w-full border-t border-border px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          openAuthModal("login");
                          setMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => {
                          openAuthModal("signup");
                          setMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!isHostArea && !compactSearch && (
          <div className="flex justify-center md:hidden">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10">
      {icon}
      {label}
    </Link>
  );
}
