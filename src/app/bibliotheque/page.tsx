import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { BookOpen, Download, FileText, Sparkles, Eye, Heart, Filter, CheckCircle2 } from "lucide-react";
import { getPublications, getCategories } from "@/lib/data";
import { getT, parseLang } from "@/lib/i18n";

export default async function BibliothequePage() {
  const cookieStore = await cookies();
  const lang = parseLang(cookieStore.get("aoi_lang")?.value);
  const t = getT(lang);

  const [publications, categories] = await Promise.all([
    getPublications({ status: "approved" }),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t("lib.badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t("lib.title")}
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          {t("lib.subtitle")}
        </p>
      </div>

      {/* Library Table / Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publications.map((pub) => (
          <div
            key={pub.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition duration-200 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg uppercase">
                  {pub.category_name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  DOC-ID #{pub.id.toString().padStart(4, "0")}
                </span>
              </div>

              <Link href={`/publications/${pub.id}`}>
                <h3 className="text-base font-bold text-white hover:text-cyan-300 transition line-clamp-2">
                  {pub.title}
                </h3>
              </Link>

              <p className="text-xs text-slate-300 line-clamp-3">
                {pub.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="truncate max-w-[140px] text-slate-300">
                  Par {pub.author_name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-slate-500" /> {pub.views_count}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /> {pub.likes_count}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/publications/${pub.id}`}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition"
                >
                  {t("lib.consult")}
                </Link>
                {pub.pdf_url && (
                  <a
                    href={pub.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
