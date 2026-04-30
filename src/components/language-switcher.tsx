"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";

export function LanguageSwitcher() {
  const { lang, languages, changeLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const current = languages.find((l) => l.code === lang);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setUp(rect.bottom + 220 > window.innerHeight);
    }
    setOpen(!open);
  }

  if (languages.length <= 1) return null;

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={toggle}
        className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-sm hover:bg-deep-sea-teal/5 transition-colors cursor-pointer"
      >
        <span className="text-lg leading-none">{current?.flag || "🌐"}</span>
        <svg
          className={`w-3 h-3 text-deep-sea-teal/40 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={`absolute right-0 bg-white rounded-xl shadow-lg border border-deep-sea-teal/10 py-1 min-w-[140px] z-50 ${up ? "bottom-full mb-1" : "top-full mt-1"}`}>
          {languages
            .filter((l) => l.is_enabled)
            .map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  changeLang(language.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-deep-sea-teal/5 transition-colors cursor-pointer ${
                  language.code === lang
                    ? "text-deep-sea-teal font-semibold"
                    : "text-deep-sea-teal/60"
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
