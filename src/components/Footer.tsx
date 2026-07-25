import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Lightbulb, Lock } from "lucide-react";
import { getT, parseLang } from "@/lib/i18n";

export default async function Footer() {
  const cookieStore = await cookies();
  const lang = parseLang(cookieStore.get("aoi_lang")?.value);
  const t = getT(lang);

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      {/* Top Footer Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-950/80 to-slate-900 border-b border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
              {t("footer.mottoLabel")}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Think Bold. Create Together. Transform the Future.
            </h3>
            <p className="text-xs text-slate-300">{t("footer.mottoSub")}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition transform hover:scale-105"
            >
              {t("footer.joinCta")}
            </Link>
            <Link
              href="/publications"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition"
            >
              {t("footer.exploreCta")}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white">
                <Lightbulb className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                AOI <span className="text-cyan-400">GENIUS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{t("footer.desc")}</p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 hover:text-blue-400 flex items-center justify-center transition text-[10px] font-bold"
                title="Facebook"
              >
                FB
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 hover:text-cyan-400 flex items-center justify-center transition text-[10px] font-bold"
                title="LinkedIn"
              >
                IN
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 flex items-center justify-center transition text-[10px] font-bold"
                title="WhatsApp"
              >
                WA
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500 hover:text-rose-400 flex items-center justify-center transition text-[10px] font-bold"
                title="YouTube"
              >
                YT
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-3">{t("footer.platform")}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-cyan-400 transition">{t("nav.home")}</Link></li>
              <li><Link href="/publications" className="hover:text-cyan-400 transition">{t("footer.allPubs")}</Link></li>
              <li><Link href="/bibliotheque" className="hover:text-cyan-400 transition">{t("footer.libraryLink")}</Link></li>
              <li><Link href="/membres" className="hover:text-cyan-400 transition">{t("footer.membersLink")}</Link></li>
              <li><Link href="/actualites" className="hover:text-cyan-400 transition">{t("footer.newsLink")}</Link></li>
            </ul>
          </div>

          {/* Col 3: Domaines / Catégories */}
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-3">{t("footer.domains")}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/publications?category=energie" className="hover:text-cyan-400 transition">{t("footer.energy")}</Link></li>
              <li><Link href="/publications?category=agriculture" className="hover:text-cyan-400 transition">{t("footer.agri")}</Link></li>
              <li><Link href="/publications?category=sante" className="hover:text-cyan-400 transition">{t("footer.health")}</Link></li>
              <li><Link href="/publications?category=intelligence-artificielle" className="hover:text-cyan-400 transition">{t("footer.ai")}</Link></li>
              <li><Link href="/publications?category=robotique" className="hover:text-cyan-400 transition">{t("footer.robotics")}</Link></li>
            </ul>
          </div>

          {/* Col 4: Vision & Sécurité */}
          <div>
            <h4 className="text-xs uppercase font-bold text-white tracking-wider mb-3">{t("footer.trust")}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/vision" className="hover:text-cyan-400 transition">{t("footer.visionLink")}</Link></li>
              <li><Link href="/a-propos" className="hover:text-cyan-400 transition">{t("footer.aboutLink")}</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition">{t("footer.contactLink")}</Link></li>
            </ul>

            <div className="mt-4 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>{t("footer.security")}</span>
              </div>
              <p className="text-[10px] text-slate-500">{t("footer.securityDesc")}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AOI GENIUS V1.0. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <span>{t("footer.powered")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
