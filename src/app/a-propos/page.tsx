import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Lightbulb, Target, Shield, HeartHandshake, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { getT, parseLang } from "@/lib/i18n";

export default async function AProposPage() {
  const cookieStore = await cookies();
  const lang = parseLang(cookieStore.get("aoi_lang")?.value);
  const t = getT(lang);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30 text-xs font-semibold">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{t("about.badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t("about.title")}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {t("about.subtitle")}
        </p>
      </div>

      {/* Core Mission Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12">
        <div className="space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">
            {t("about.mission")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t("about.missionTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === "en"
              ? "We firmly believe that the greatest innovations are born when creative minds, researchers and entrepreneurs join forces within a transparent and rigorous framework."
              : "Nous croyons fermement que les plus grandes innovations naissent lorsque les esprits créatifs, les chercheurs et les entrepreneurs unissent leurs forces dans un cadre transparent et rigoureux."}
          </p>
          <div className="pt-2 flex flex-col gap-2.5 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Publication ouverte et transparente des prototypes et résultats techniques.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Accompagnement et revue par les pairs pour garantir l'excellence.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Passage à l'échelle pour des projets énergétiques, agricoles et sanitaires.</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-72">
          <img
            src="https://images.pexels.com/photos/29320998/pexels-photo-29320998.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
            alt="Laboratoire AOI Genius"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 4 Pillars of Values */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">
            Nos Valeurs Fondatrices
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ce qui Guide Notre Communauté
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Target className="w-8 h-8 text-blue-400" />
            <h3 className="font-bold text-white text-base">Rigueur & Impact</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Toutes les publications sont validées scientifiquement pour garantir leur faisabilité et utilité réelle.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <HeartHandshake className="w-8 h-8 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Partage Ouvert</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              La mutualisation des documentations accélère le progrès collectif et la souveraineté technologique.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Éthique & Sécurité</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Respect absolu des droits de propriété intellectuelle et protection des données de nos membres.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
            <h3 className="font-bold text-white text-base">Audace Créative</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Oser des solutions disruptives pour l'énergie solaire, l'e-santé et l'agriculture autonome.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
