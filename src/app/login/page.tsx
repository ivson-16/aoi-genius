"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, getStoredToken, refreshNow } from "@/context/AuthContext";
import { Lightbulb, Lock, Mail, ArrowRight, ShieldCheck, RotateCcw, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("");
  const [recovered, setRecovered] = useState<any>(null);

  // Si une session existe déjà (jeton retrouvé), on propose de la reprendre
  // immédiatement au lieu de ressaisir les identifiants.
  useEffect(() => {
    if (getStoredToken()) {
      refreshNow().then((u) => {
        if (u) setRecovered(u);
      });
    }
  }, []);

  const goTo = (role: string, token?: string) => {
    const dest = role === "admin" ? "/admin" : "/dashboard";
    // On utilise window.location : c'est une navigation complète, le nouveau
    // contexte relit tous les canaux de session à froid (cookie client, jeton,
    // URL) sans dépendre d'un état React qui pourrait ne pas se propager.
    const q = token ? `?_aoi=${encodeURIComponent(token)}` : "";
    window.location.assign(`${dest}${q}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStep("Étape 1/3 — Vérification des identifiants auprès du serveur...");
    await new Promise((r) => setTimeout(r, 150));
    const result = await login(email.trim(), password);
    if (result.success && result.user) {
      setStep(`Étape 2/3 — Identité confirmée. Rôle : ${result.user.role === "admin" ? "Administrateur" : "Membre"}.`);

      // Les consoles sont autonomes : elles relisent ces identifiants dans
      // sessionStorage et les vérifient directement à chaque action serveur.
      // Aucun cookie ni jeton partagé n'est nécessaire.
      try {
        const key = result.user.role === "admin" ? "aoi_admin_creds_v1" : "aoi_member_creds_v1";
        sessionStorage.setItem(key, JSON.stringify({ e: email.trim(), p: password }));
      } catch {}

      await new Promise((r) => setTimeout(r, 250));
      setStep("Étape 3/3 — Ouverture de votre espace...");
      window.location.assign(result.user.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setLoading(false);
      setStep("");
      setError(result.error || "Identifiants incorrects.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Connexion à AOI Genius</h1>
          <p className="text-xs text-slate-300">
            Accédez à votre espace personnel sécurisé pour publier et gérer vos travaux.
          </p>
        </div>

        {/* Session recovery banner */}
        {recovered && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Session retrouvée : {recovered.name}</p>
                <p className="text-[10px] text-slate-400">Reprenez directement sans ressaisir vos identifiants.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setUser(recovered);
                goTo(recovered.role);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reprendre
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Connexion sécurisée par session chiffrée. Vos privilèges (Membre ou Administrateur) sont
            déterminés automatiquement par votre compte.
          </p>
        </div>

        <p className="text-center text-[10px] text-slate-500 font-mono">
          AOI Genius · build V1.0.7 (28/08/2026)
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Adresse E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {step && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>{step}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <span>{loading ? "Connexion en cours..." : "Se Connecter"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-cyan-400 font-semibold hover:underline">
            S'inscrire comme Membre
          </Link>
        </p>
      </div>
    </div>
  );
}
