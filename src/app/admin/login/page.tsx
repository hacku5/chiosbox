"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-deep-sea-teal flex">
      {/* Left: Branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 xl:w-[45%] items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-chios-purple/[0.08] blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Shield icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-white/20">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <h2 className="font-display text-2xl font-bold text-white">
              ChiosBox Yönetim Paneli
            </h2>
            <p className="mt-2 text-sm text-white/40 max-w-xs">
              Paket yönetimi, faturalama ve müşteri işlemleri için admin girişi
            </p>
          </motion.div>

          {/* Decorative dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 flex gap-2"
          >
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/10" />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right: Login form */}
      <div className="w-full lg:w-1/2 xl:w-[55%] flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="font-display text-xl font-bold text-white group-hover:text-white/80 transition-colors duration-200">
              ChiosBox
            </span>
          </Link>

          {/* Heading */}
          <h1 className="font-display text-2xl font-bold text-white">
            Yönetim Paneli
          </h1>
          <p className="mt-1.5 text-sm text-white/40">
            Admin hesabınızla giriş yapın
          </p>

          {/* Form */}
          <div className="mt-8">
            <Suspense fallback={<div className="h-64 animate-pulse bg-white/5 rounded-2xl" />}>
              <AdminLoginForm />
            </Suspense>
          </div>

          {/* Customer login link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-white/20 mt-8"
          >
            Müşteri misiniz?{" "}
            <Link href="/login" className="text-white/40 hover:text-white/60 transition-colors cursor-pointer">
              Müşteri Girişi
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
