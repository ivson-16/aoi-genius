"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  Eye,
  Heart,
  Sparkles,
  Trash2,
} from "lucide-react";

function PublicationsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const initialCategory = searchParams.get("categoryId") || "";
  const initialSearch = searchParams.get("search") || "";

  const [publications, setPublications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [selectedCategory, selectedType, sort]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (selectedType && selectedType !== "all") params.append("type", selectedType);
      if (search) params.append("search", search);
      if (sort) params.append("sort", sort);

      const res = await fetch(`/api/publications?${params.toString()}`);
      const data = await res.json();
      if (data.publications) setPublications(data.publications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublications();
  };

  const handleDeletePublication = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette publication ? Cette action est définitive.")) return;
    try {
      const res = await fetch(`/api/publications/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Impossible de supprimer cette publication.");
        return;
      }
      setPublications((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur réseau pendant la suppression.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/50 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("pub.badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t("pub.title")}
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          {t("pub.subtitle")}
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={t("pub.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md"
          >
            {t("pub.searchBtn")}
          </button>
        </form>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          {/* Category Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">{t("pub.domain")}</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="">{t("pub.allDomains")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            {["all", "innovation", "project", "technical_report", "article"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-lg font-medium transition capitalize ${
                  selectedType === t
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "all"
                  ? lang === "en" ? "All" : "Tous"
                  : t === "technical_report"
                  ? lang === "en" ? "Reports" : "Rapports"
                  : t === "innovation"
                  ? "Innovations"
                  : t === "project"
                  ? lang === "en" ? "Projects" : "Projets"
                  : lang === "en" ? "Articles" : "Articles"}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{t("pub.sortBy")}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="recent">{t("pub.recent")}</option>
              <option value="popular">{t("pub.popular")}</option>
              <option value="views">{t("pub.views")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Publications Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">{t("pub.loading")}</p>
        </div>
      ) : publications.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-base text-slate-300 font-bold">{t("pub.empty")}</p>
          <button
            onClick={() => {
              setSelectedCategory("");
              setSelectedType("all");
              setSearch("");
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            {t("pub.reset")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub) => (
            <article
              key={pub.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition duration-300 flex flex-col group hover:shadow-xl hover:shadow-cyan-950/20"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={pub.cover_image}
                  alt={pub.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    {pub.category_name}
                  </span>
                  <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize">
                    {pub.type === "technical_report"
                      ? "Rapport"
                      : pub.type === "article"
                      ? "Article"
                      : pub.type === "project"
                      ? "Projet"
                      : "Innovation"}
                  </span>
                </div>
                {(user?.role === "admin" || user?.id === pub.author_id) && (
                  <button
                    onClick={() => handleDeletePublication(pub.id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg transition"
                    title="Supprimer cette publication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Link href={`/publications/${pub.id}`}>
                    <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition line-clamp-2">
                      {pub.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {pub.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
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
                    <span className="text-slate-300 truncate max-w-[120px]">
                      {pub.author_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
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
      )}
    </div>
  );
}

export default function PublicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs mt-2">Chargement...</p>
        </div>
      }
    >
      <PublicationsContent />
    </Suspense>
  );
}
