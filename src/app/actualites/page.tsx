import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Newspaper, Sparkles, Calendar, ArrowRight } from "lucide-react";
import { getNews } from "@/lib/data";
import { getT, parseLang } from "@/lib/i18n";

export default async function ActualitesPage() {
  const cookieStore = await cookies();
  const lang = parseLang(cookieStore.get("aoi_lang")?.value);
  const t = getT(lang);
  const newsList = await getNews(20);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
          <Newspaper className="w-3.5 h-3.5" />
          <span>{t("news.badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t("news.title")}
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          {t("news.subtitle")}
        </p>
      </div>

      {/* News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsList.map((item) => (
          <article
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/40 transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden bg-slate-950">
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-6 space-y-3">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
                <h3 className="font-bold text-lg text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>{item.author_name}</span>
              <span>{new Date(item.published_at).toLocaleDateString("fr-FR")}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
