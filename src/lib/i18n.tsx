"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

interface Language {
  code: string;
  name: string;
  flag: string;
  is_default: boolean;
  is_enabled: boolean;
}

interface TranslationContextType {
  t: (key: string, params?: Record<string, string | number>) => string;
  lang: string;
  changeLang: (code: string) => void;
  languages: Language[];
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  t: (key) => key,
  lang: "en",
  changeLang: () => {},
  languages: [],
  loading: true,
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  const maxAge = 365 * 24 * 60 * 60; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

/**
 * Minimal loading screen shown while translations are being fetched.
 * Prevents users from seeing raw translation keys like "hero.title".
 */
function TranslationLoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F9F9F7",
        zIndex: 9999,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(93, 63, 211, 0.15)",
            borderTopColor: "#5D3FD3",
            borderRadius: "50%",
            animation: "i18n-spin 0.7s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <div
          style={{
            fontFamily: "'Rubik', system-ui, sans-serif",
            fontSize: 20,
            fontWeight: 600,
            color: "#5D3FD3",
            letterSpacing: "-0.02em",
          }}
        >
          ChiosBox
        </div>
        <style>{`@keyframes i18n-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [fallbackTranslations, setFallbackTranslations] = useState<Record<string, string>>({});
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  // Track if we've ever successfully loaded translations (including from cache)
  const [ready, setReady] = useState(false);

  // Load languages list
  useEffect(() => {
    fetch("/api/translations")
      .then((r) => r.json())
      .then((data) => {
        if (data.languages) {
          setLanguages(data.languages);
          // Set default language from DB if no cookie
          const cookieLang = getCookie("lang");
          if (!cookieLang) {
            const defaultLang = data.languages.find((l: Language) => l.is_default);
            if (defaultLang) {
              setCookie("lang", defaultLang.code);
              setLang(defaultLang.code);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Load translations for current language
  useEffect(() => {
    const cookieLang = getCookie("lang") || "en";
    setLang(cookieLang);
    setLoading(true);

    // Static file first (built at deploy time from DB), API fallback
    fetch(`/locales/${cookieLang}.json`)
      .then((r) => {
        if (!r.ok) throw new Error("no static file");
        return r.json();
      })
      .then((entries) => {
        setTranslations(entries);
        setLoading(false);
        setReady(true);
      })
      .catch(() => {
        fetch(`/api/translations?lang=${cookieLang}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.entries) setTranslations(data.entries);
            setLoading(false);
            setReady(true);
          })
          .catch(() => {
            setLoading(false);
            setTimeout(() => setReady(true), 100);
          });
      });

    // Load English fallback
    if (cookieLang !== "en") {
      fetch("/locales/en.json")
        .then((r) => {
          if (!r.ok) throw new Error("no static file");
          return r.json();
        })
        .then((entries) => setFallbackTranslations(entries))
        .catch(() => {
          fetch("/api/translations?lang=en")
            .then((r) => r.json())
            .then((data) => {
              if (data.entries) setFallbackTranslations(data.entries);
            })
            .catch(() => {});
        });
    }
  }, [lang]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = translations[key];
      if (value !== undefined) return interpolate(value, params);

      // Fallback to EN
      const fallback = fallbackTranslations[key];
      if (fallback !== undefined) return interpolate(fallback, params);

      // If still loading, return empty string to avoid flashing keys
      if (!ready) return "\u00A0"; // non-breaking space — prevents layout collapse

      // Return raw key as last resort (only after loading is complete)
      return key;
    },
    [translations, fallbackTranslations, ready]
  );

  const changeLang = useCallback((code: string) => {
    setCookie("lang", code);
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({ t, lang, changeLang, languages, loading }),
    [t, lang, changeLang, languages, loading]
  );

  return (
    <TranslationContext.Provider value={value}>
      {ready ? children : <TranslationLoadingScreen />}
    </TranslationContext.Provider>
  );
}

export { TranslationContext };
