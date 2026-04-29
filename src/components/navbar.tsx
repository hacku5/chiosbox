"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/hooks/use-translation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-chios-purple"
          >
            <rect
              width="32"
              height="32"
              rx="8"
              fill="currentColor"
            />
            <path
              d="M8 12L16 8L24 12V20L16 24L8 20V12Z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M16 8V24"
              stroke="white"
              strokeWidth="2"
              opacity="0.5"
            />
            <path
              d="M8 12L16 16L24 12"
              stroke="white"
              strokeWidth="2"
              opacity="0.5"
            />
          </svg>
          <span className="font-display text-xl font-semibold text-deep-sea-teal">
            ChiosBox
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/#nasil-calisir"
            className="text-sm font-medium text-deep-sea-teal/70 hover:text-chios-purple transition-colors duration-200"
          >
            {t("nav.howItWorks")}
          </Link>
          <Link
            href="/#fiyat"
            className="text-sm font-medium text-deep-sea-teal/70 hover:text-chios-purple transition-colors duration-200"
          >
            {t("nav.pricing")}
          </Link>
          <Link
            href="/#guven"
            className="text-sm font-medium text-deep-sea-teal/70 hover:text-chios-purple transition-colors duration-200"
          >
            {t("nav.trust")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {loading ? (
            <div className="w-24 h-9 rounded-full bg-deep-sea-teal/5 animate-pulse" />
          ) : isAuthenticated && user ? (
            <>
              <Link
                href="/user"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-deep-sea-teal/[0.03] hover:bg-chios-purple/10 transition-colors duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-chios-purple/15 flex items-center justify-center">
                  <span className="text-xs font-semibold text-chios-purple">
                    {user.name?.[0] || "?"}
                  </span>
                </div>
                <span className="text-sm font-medium text-deep-sea-teal/70">
                  {user.name?.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-deep-sea-teal/40 hover:text-danger-red transition-colors duration-200 cursor-pointer"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-medium text-deep-sea-teal/70 hover:text-chios-purple transition-colors duration-200"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-5 py-2.5 bg-chios-purple text-white text-sm font-semibold rounded-full hover:bg-chios-purple-dark transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                {t("nav.getAddress")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
