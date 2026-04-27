"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";

export function AdminLanguageSwitcher() {
  const { lang, languages, changeLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const enabledLanguages = languages.filter((l) => l.is_enabled);
  const current = enabledLanguages.find((l) => l.code === lang);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (enabledLanguages.length <= 1) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
      >
        <span className="text-sm">{current?.flag || "🌐"}</span>
        <span className="text-[10px] font-medium uppercase">{lang}</span>
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[140px] z-50">
          {enabledLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                changeLang(language.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer ${
                language.code === lang
                  ? "text-deep-sea-teal font-semibold"
                  : "text-gray-600"
              }`}
            >
              <span className="text-base">{language.flag}</span>
              <span>{language.name}</span>
              {language.code === lang && (
                <svg
                  className="w-3.5 h-3.5 ml-auto text-deep-sea-teal"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
