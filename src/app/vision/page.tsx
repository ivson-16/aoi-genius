import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Sparkles, Rocket, BrainCircuit, Smartphone, Users, Award, ShieldCheck, Database, Layers, ArrowRight } from "lucide-react";
import { getT, parseLang } from "@/lib/i18n";

export default async function VisionPage() {
  const cookieStore = await cookies();
  const lang = parseLang(cookieStore.get("aoi_lang")?.value);
  const t = getT(lang);
  const roadmapItems = [
    {
      title: lang === "en" ? "Collaborative Workspaces" : "Espaces de travail collaboratifs",
      desc: lang === "en" ? "Co-development rooms to design and test hardware and software in real time." : "Salons de co-développement pour concevoir et tester du matériel et des logiciels en temps réel.",
      icon: Users,
    },
    {
      title: lang === "en" ? "Innovation Contests" : "Concours d'innovation",
      desc: lang === "en" ? "Themed hackathons and research grants with direct funding." : "Hackathons thématiques et bourses de recherche dotées de financements directs.",
      icon: Award,
    },
    {
      title: lang === "en" ? "Specialized AI Assistant" : "Assistant IA Spécialisé",
      desc: lang === "en" ? "Integrated language model to assist report writing and mechatronic simulation." : "Modèle de langage intégré pour assister la rédaction des rapports et la simulation mécatronique.",
      icon: BrainCircuit,
    },
    {
      title: lang === "en" ? "Hybrid Mobile App" : "Application Mobile Hybride",
      desc: lang === "en" ? "Project tracking, real-time notifications and offline document access." : "Suivi des projets, notifications temps réel et accès aux documents hors ligne.",
      icon: Smartphone,
    },
    {
      title: lang === "en" ? "Funding & Partner Matching" : "Financement & Recherche de Partenaires",
      desc: lang === "en" ? "Direct connection between innovators and impact funds, industrials and donors." : "Connexion directe entre innovateurs et fonds d'impact, industriels et bailleurs.",
      icon: Rocket,
    },
    {
      title: lang === "en" ? "Scientific Review System & Public API" : "Système de Revue Scientifique & API Publique",
      desc: lang === "en" ? "Formal peer review and programming interfaces for universities." : "Évaluation formelle par les pairs et interfaces de programmation pour les universités.",
      icon: Database,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("vision.badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t("vision.title")}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {t("vision.subtitle")}
        </p>
      </div>

      {/* The 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">{lang === "en" ? "Pillar I" : "Pilier I"}</span>
          <h3 className="text-2xl font-black text-white">Think Bold</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === "en"
              ? "Rejecting conformity. We encourage bold approaches that break through major technological barriers."
              : "Rejeter le conformisme. Nous encourageons les approches audacieuses qui brisent les verrous technologiques majeurs."}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">{lang === "en" ? "Pillar II" : "Pilier II"}</span>
          <h3 className="text-2xl font-black text-white">Create Together</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === "en"
              ? "The strength of the collective. By breaking down interdisciplinary silos, our solutions gain robustness."
              : "La force du collectif. En décloisonnant les compétences interdisciplinaires, nos solutions gagnent en robustesse."}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">{lang === "en" ? "Pillar III" : "Pilier III"}</span>
          <h3 className="text-2xl font-black text-white">Transform the Future</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === "en"
              ? "Utility above all. Every prototype is meant to be tested, patented or deployed in the field in service of society."
              : "L'utilité avant tout. Chaque prototype a pour vocation d'être testé, breveté ou déployé sur le terrain au service de la société."}
          </p>
        </div>
      </div>

      {/* Roadmap of Future Evolutions */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">
            {t("vision.roadmapEyebrow")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t("vision.roadmapTitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-cyan-500/40 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
