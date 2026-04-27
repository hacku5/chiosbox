"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-deep-sea-teal/[0.03] border-t border-deep-sea-teal/5">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                className="text-chios-purple"
              >
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path
                  d="M8 12L16 8L24 12V20L16 24L8 20V12Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-display text-lg font-semibold text-deep-sea-teal">
                ChiosBox
              </span>
            </div>
            <p className="text-sm text-deep-sea-teal/60 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-deep-sea-teal mb-3 text-sm">
              {t("footer.service")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#nasil-calisir"
                  className="text-sm text-deep-sea-teal/60 hover:text-chios-purple transition-colors duration-200"
                >
                  {t("footer.howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="#fiyat"
                  className="text-sm text-deep-sea-teal/60 hover:text-chios-purple transition-colors duration-200"
                >
                  {t("footer.pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/konsolidasyon"
                  className="text-sm text-deep-sea-teal/60 hover:text-chios-purple transition-colors duration-200"
                >
                  {t("footer.consolidation")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-deep-sea-teal mb-3 text-sm">
              {t("footer.support")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/sss"
                  className="text-sm text-deep-sea-teal/60 hover:text-chios-purple transition-colors duration-200"
                >
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link
                  href="/iletisim"
                  className="text-sm text-deep-sea-teal/60 hover:text-chios-purple transition-colors duration-200"
                >
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/takip"
                  className="text-sm text-deep-sea-teal/60 hover:text-chios-purple transition-colors duration-200"
                >
                  {t("footer.tracking")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-deep-sea-teal mb-3 text-sm">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/gizlilik"
                  className="text-sm text-deep-sea-teal/60 hover:text-chios-purple transition-colors duration-200"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/kullanim-kosullari"
                  className="text-sm text-deep-sea-teal/60 hover:text-chios-purple transition-colors duration-200"
                >
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-green/10 rounded-full">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-success-green"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-xs font-medium text-success-green">
                  {t("footer.sslSecure")}
                </span>
              </div>
              <div className="px-2.5 py-1 bg-chios-purple/10 rounded-full">
                <span className="text-xs font-medium text-chios-purple">
                  Stripe
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-deep-sea-teal/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-deep-sea-teal/40">
            {t("footer.copyright")}
          </p>
          <p className="text-xs text-deep-sea-teal/40">
            {t("footer.location")}
          </p>
        </div>
      </div>
    </footer>
  );
}
