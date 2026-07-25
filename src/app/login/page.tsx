"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lightbulb, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();

  const [email, setEmail] = useState("Kindeivson@gmail.com");
  const [password, setPassword] = useState("YelectroK@5736.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      if (email.toLowerCase() === "kindeivson@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError("Identifiants incorrects ou compte introuvable.");
    }
  };

  const handleQuickDemo = (role: "admin" | "member") => {
    switchDemoRole(role);
    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
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
            Accédez à votre espace pour gérer la plateforme et publier vos innovations.
          </p>
        </div>

        {/* Quick Demo Switcher Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
            ⚡ Connexion Démo Rapide (1-Clic)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 transition flex flex-col"
            >
              <span className="text-xs font-bold text-amber-400 truncate">Codjo Ivson O. KINDE</span>
              <span className="text-[10px] text-slate-400">Rôle : Admin (Fondateur)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo("member")}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 transition flex flex-col"
            >
              <span className="text-xs font-bold text-emerald-400">Koffi Mensah</span>
              <span className="text-[10px] text-slate-400">Rôle : Membre</span>
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <span>{loading ? "Connexion..." : "Se Connecter"}</span>
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
