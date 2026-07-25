"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Lightbulb,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ShieldAlert,
  LogOut,
  Sparkles,
  Languages,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, switchDemoRole, theme, toggleTheme } = useAuth();
  const { lang, t, setLang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/publications?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.publications"), href: "/publications" },
    { name: t("nav.library"), href: "/bibliotheque" },
    { name: t("nav.members"), href: "/membres" },
    { name: t("nav.news"), href: "/actualites" },
    { name: t("nav.vision"), href: "/vision" },
    { name: t("nav.about"), href: "/a-propos" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800 text-white transition-colors duration-200">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 px-4 py-1.5 text-xs text-white flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-bold">V1.0</span>
            <span className="hidden sm:inline">{t("nav.tagline")}</span>
            <span className="sm:hidden">{t("nav.subtitle")}</span>
          </div>

          {/* Quick Demo Switcher Toolbar */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-white/80 font-normal">{t("nav.demoRole")}</span>
            <button
              onClick={() => switchDemoRole("visitor")}
              className={`px-2 py-0.5 rounded transition ${
                role === "visitor" ? "bg-[#ffffff] text-blue-900 font-bold shadow-sm" : "bg-black/20 hover:bg-black/40 text-white"
              }`}
            >
              {t("nav.visitor")}
            </button>
            <button
              onClick={() => switchDemoRole("member")}
              className={`px-2 py-0.5 rounded transition ${
                role === "member" ? "bg-emerald-400 text-slate-950 font-bold shadow-sm" : "bg-black/20 hover:bg-black/40 text-white"
              }`}
            >
              {t("nav.member")}
            </button>
            <button
              onClick={() => switchDemoRole("admin")}
              className={`px-2 py-0.5 rounded transition ${
                role === "admin" ? "bg-amber-400 text-slate-950 font-bold shadow-sm" : "bg-black/20 hover:bg-black/40 text-white"
              }`}
            >
              {t("nav.admin")}
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition transform">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-300 transition">
                    AOI <span className="text-cyan-400 font-black">GENIUS</span>
                  </span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono">
                    V1.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold hidden sm:inline">
                  {t("nav.subtitle")}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Auth */}
            <div className="flex items-center gap-2.5">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title={t("nav.searchTitle")}
                aria-label={t("nav.searchTitle")}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Language Switcher FR / EN */}
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <button
                  onClick={() => lang !== "fr" && setLang("fr")}
                  className={`px-1.5 py-1 rounded-md text-[10px] font-black transition ${
                    lang === "fr" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                  title="Français"
                >
                  FR
                </button>
                <button
                  onClick={() => lang !== "en" && setLang("en")}
                  className={`px-1.5 py-1 rounded-md text-[10px] font-black transition ${
                    lang === "en" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                  title="English"
                >
                  EN
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Thème"
                aria-label="Thème"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
              </button>

              {/* User Profile / Auth Area */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <Link
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    className="flex items-center gap-2 group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1.5 transition"
                  >
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-cyan-400"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-semibold text-white group-hover:text-cyan-300 leading-none">
                        {user.name.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-medium capitalize">
                        {user.role === "admin" ? t("nav.admin") : t("nav.member")}
                      </span>
                    </div>
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="hidden sm:flex items-center gap-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-lg font-medium hover:bg-amber-500/30 transition"
                      title="Console Administrateur"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{t("nav.admin")}</span>
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3.5 py-1.5 rounded-lg shadow-md hover:shadow-cyan-500/20 hover:scale-105 transition"
                  >
                    {t("nav.join")}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    pathname === item.href ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-semibold">{t("nav.demoRole")}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    switchDemoRole("visitor");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-1.5 rounded text-xs font-bold ${
                    role === "visitor" ? "bg-[#ffffff] text-slate-900" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {t("nav.visitor")}
                </button>
                <button
                  onClick={() => {
                    switchDemoRole("member");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-1.5 rounded text-xs font-bold ${
                    role === "member" ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {t("nav.member")}
                </button>
                <button
                  onClick={() => {
                    switchDemoRole("admin");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-1.5 rounded text-xs font-bold ${
                    role === "admin" ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {t("nav.admin")}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{t("nav.searchTitle")}</span>
              </div>
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={t("nav.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-11 pr-24 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition"
                >
                  {t("nav.searchFind")}
                </button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="text-slate-500 font-medium">{t("nav.popular")}</span>
              {["Solaire", "Agriculture", "Robotique"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    router.push(`/publications?search=${tag}`);
                    setSearchOpen(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-cyan-300"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
