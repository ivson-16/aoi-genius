import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  Zap,
  Sprout,
  HeartPulse,
  Leaf,
  Laptop,
  BrainCircuit,
  Bot,
  GraduationCap,
  Rocket,
  Layers,
  FileText,
  Eye,
  Heart,
} from "lucide-react";
import { getCategories, getPublications, getNews } from "@/lib/data";
import { getT, parseLang } from "@/lib/i18n";

const categoryIconMap: Record<string, any> = {
  energie: Zap,
  agriculture: Sprout,
  sante: HeartPulse,
  environnement: Leaf,
  informatique: Laptop,
  "intelligence-artificielle": BrainCircuit,
  robotique: Bot,
  education: GraduationCap,
  entrepreneuriat: Rocket,
  autres: Layers,
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const lang = parseLang(cookieStore.get("aoi_lang")?.value);
  const t = getT(lang);

  const [categories, publications, newsList] = await Promise.all([
    getCategories(),
    getPublications({ featuredOnly: true, limit: 6 }),
    getNews(3),
  ]);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10 animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t("hero.badge")}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight sm:leading-none">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Think Bold.
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
                Create Together.
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                Transform the Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/publications"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-105 transition flex items-center gap-2"
              >
                <span>{t("hero.ctaExplore")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-sm hover:border-cyan-500/50 transition flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>{t("hero.ctaPublish")}</span>
              </Link>
              <Link
                href="/bibliotheque"
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{t("hero.ctaLibrary")}</span>
              </Link>
            </div>

            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-cyan-400">10</span>
                <span className="text-xs text-slate-400 font-medium">{t("hero.statDomains")}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-blue-400">100%</span>
                <span className="text-xs text-slate-400 font-medium">{t("hero.statAccess")}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-400">+2.4k</span>
                <span className="text-xs text-slate-400 font-medium">{t("hero.statViews")}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 text-center">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">V1.0</span>
                <span className="text-xs text-slate-400 font-medium">{t("hero.statVersion")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              {t("home.catEyebrow")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t("home.catTitle")}
            </h2>
          </div>
          <Link
            href="/publications"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            <span>{t("home.catAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.map((cat: any) => {
            const IconComponent = categoryIconMap[cat.slug] || Layers;
            return (
              <Link
                key={cat.id}
                href={`/publications?categoryId=${cat.id}`}
                className="group relative p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition duration-200 flex flex-col justify-between hover:-translate-y-1 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-blue-600/20 text-cyan-400 group-hover:text-cyan-300 flex items-center justify-center mb-3 transition">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                    {cat.publications_count || 0} {t("home.pubCount")}
                    {(cat.publications_count || 0) > 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PUBLICATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              {t("home.featEyebrow")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t("home.featTitle")}
            </h2>
          </div>
          <Link
            href="/publications"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            <span>{t("home.featAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub: any) => (
            <article
              key={pub.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition duration-300 flex flex-col group hover:shadow-xl hover:shadow-cyan-950/30"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={pub.cover_image}
                  alt={pub.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {pub.category_name || "Innovation"}
                  </span>
                  <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg capitalize">
                    {pub.type === "technical_report"
                      ? lang === "en" ? "Report" : "Rapport"
                      : pub.type === "article"
                      ? lang === "en" ? "Article" : "Article"
                      : pub.type === "project"
                      ? lang === "en" ? "Project" : "Projet"
                      : "Innovation"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Link href={`/publications/${pub.id}`}>
                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition line-clamp-2 leading-snug">
                      {pub.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {pub.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    {pub.author_photo ? (
                      <img
                        src={pub.author_photo}
                        alt={pub.author_name}
                        className="w-6 h-6 rounded-full object-cover border border-cyan-500/40"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                        {pub.author_name?.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium text-slate-200 truncate max-w-[110px]">
                      {pub.author_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      {pub.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      {pub.likes_count}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. PILLARS */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 p-8 sm:p-12">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              {t("home.pillarEyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {t("home.pillarTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">{t("home.pillarSub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-xl border border-blue-500/30">01</div>
              <h3 className="text-xl font-bold text-white">{t("home.p1Title")}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t("home.p1Desc")}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-500/30">02</div>
              <h3 className="text-xl font-bold text-white">{t("home.p2Title")}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t("home.p2Desc")}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-black text-xl border border-cyan-500/30">03</div>
              <h3 className="text-xl font-bold text-white">{t("home.p3Title")}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t("home.p3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              {t("home.newsEyebrow")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t("home.newsTitle")}
            </h2>
          </div>
          <Link
            href="/actualites"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            <span>{t("home.newsAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsList.map((item: any) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition flex flex-col"
            >
              <div className="h-44 overflow-hidden bg-slate-950">
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {item.tag}
                  </span>
                  <h3 className="font-bold text-base text-white hover:text-cyan-300 transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{item.summary}</p>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                  <span>{item.author_name}</span>
                  <span>{new Date(item.published_at).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-900 p-8 sm:p-14 text-center border border-cyan-500/30 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100 font-light">{t("home.ctaSub")}</p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-[#ffffff] text-blue-950 font-black text-xs sm:text-sm shadow-xl hover:bg-cyan-100 transition transform hover:scale-105"
              >
                {t("home.ctaRegister")}
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-xl bg-blue-950/60 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm border border-white/20 transition"
              >
                {t("home.ctaContact")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
