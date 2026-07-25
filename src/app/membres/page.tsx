"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Phone, Globe, Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MembresPage() {
  const { t } = useLanguage();
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [domain]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (domain && domain !== "all") params.append("domain", domain);

      const res = await fetch(`/api/members?${params.toString()}`);
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
          <Users className="w-3.5 h-3.5" />
          <span>{t("mem.badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t("mem.title")}
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          {t("mem.subtitle")}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder={t("mem.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </form>
        <button
          onClick={fetchMembers}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition"
        >
          {t("mem.filter")}
        </button>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs mt-2">{t("mem.loading")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/60 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                      {member.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-base text-white">{member.name}</h3>
                    <p className="text-xs text-indigo-300 font-medium">{member.profession}</p>
                    <p className="text-[11px] text-slate-400">
                      {member.city}, {member.country}
                    </p>
                  </div>
                </div>

                <div className="inline-block bg-slate-800/80 text-cyan-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-700">
                  {t("mem.specialty")} {member.expertise_domain}
                </div>

                {member.bio && (
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  {member.publications_count || 0} publication{(member.publications_count || 0) > 1 ? "s" : ""}
                </span>

                <div className="flex items-center gap-2">
                  {member.whatsapp && (
                    <a
                      href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition text-xs flex items-center gap-1 font-semibold"
                      title="Contacter sur WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
