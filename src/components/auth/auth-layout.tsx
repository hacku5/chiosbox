"use client";

import { motion } from "framer-motion";
import { AuthIllustration } from "./auth-illustration";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-mastic-white via-white to-chios-purple/[0.03]">
      <div className="min-h-screen flex">
        {/* Left: Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-1/2 xl:w-[45%] items-center justify-center p-12 relative overflow-hidden"
        >
          {/* Decorative background circles */}
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-chios-purple/[0.04] blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-deep-sea-teal/[0.04] blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            <AuthIllustration />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <h2 className="font-display text-xl font-semibold text-deep-sea-teal">
                {t("authLayout.heading")}
              </h2>
              <p className="mt-2 text-sm text-deep-sea-teal/50 max-w-xs">
                {t("authLayout.description")}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Form */}
        <div className="w-full lg:w-1/2 xl:w-[55%] flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md"
          >
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-chios-purple">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="font-display text-xl font-bold text-deep-sea-teal group-hover:text-chios-purple transition-colors duration-200">
                ChiosBox
              </span>
            </Link>

            {/* Heading */}
            <h1 className="font-display text-2xl font-bold text-deep-sea-teal">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-deep-sea-teal/50">
              {subtitle}
            </p>

            {/* Form */}
            <div className="mt-8">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
