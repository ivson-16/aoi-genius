"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  PlusCircle,
  Eye,
  Heart,
  Download,
  Bell,
  MessageSquare,
  Sparkles,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Save,
  Layers,
} from "lucide-react";

export default function MemberDashboard() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"publications" | "publish" | "profile" | "notifications">("publications");
  const [myPublications, setMyPublications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Publication Form State
  const [pubTitle, setPubTitle] = useState("");
  const [pubType, setPubType] = useState("innovation");
  const [pubCategoryId, setPubCategoryId] = useState("1");
  const [pubSummary, setPubSummary] = useState("");
  const [pubContent, setPubContent] = useState("");
  const [pubCover, setPubCover] = useState("https://images.pexels.com/photos/29320998/pexels-photo-29320998.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200");
  const [pubPdf, setPubPdf] = useState("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
  const [pubVideo, setPubVideo] = useState("");
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [photo, setPhoto] = useState(user?.photo || "");
  const [profession, setProfession] = useState(user?.profession || "");
  const [expertiseDomain, setExpertiseDomain] = useState(user?.expertise_domain || "");
  const [country, setCountry] = useState(user?.country || "");
  const [city, setCity] = useState(user?.city || "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const [pubsRes, catsRes, notifsRes] = await Promise.all([
        fetch(`/api/publications?authorId=${user.id}&status=all`),
        fetch("/api/categories"),
        fetch(`/api/notifications?userId=${user.id}`),
      ]);

      const [pubsData, catsData, notifsData] = await Promise.all([
        pubsRes.json(),
        catsRes.json(),
        notifsRes.json(),
      ]);

      if (pubsData.publications) setMyPublications(pubsData.publications);
      if (catsData.categories) setCategories(catsData.categories);
      if (notifsData.notifications) setNotifications(notifsData.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pubTitle,
          type: pubType,
          summary: pubSummary,
          content: pubContent,
          categoryId: pubCategoryId,
          authorId: user.id,
          coverImage: pubCover,
          pdfUrl: pubPdf,
          videoUrl: pubVideo.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishSuccess(true);
        setPubTitle("");
        setPubSummary("");
        setPubContent("");
        fetchDashboardData();
        setTimeout(() => {
          setPublishSuccess(false);
          setActiveTab("publications");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePublication = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette publication ?")) return;
    try {
      const res = await fetch(`/api/publications/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Impossible de supprimer cette publication pour le moment.");
        return;
      }
      setMyPublications((prev) => prev.filter((p) => p.id !== id));
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert("Erreur réseau pendant la suppression de la publication.");
    }
  };

  const uploadImageFromDevice = async (
    file: File,
    onSuccess: (url: string) => void,
    setUploading: (value: boolean) => void
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        alert(data.error || "Impossible de charger cette image.");
        return;
      }
      onSuccess(data.url);
    } catch (err) {
      console.error(err);
      alert("Erreur pendant l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageFromDevice(file, setPubCover, setCoverUploading);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageFromDevice(file, setPubPdf, setPdfUploading);
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageFromDevice(file, setPhoto, setProfilePhotoUploading);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name,
          photo,
          profession,
          expertiseDomain,
          country,
          city,
          whatsapp,
          bio,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser({ ...user, ...data.user });
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compute aggregated stats
  const totalViews = myPublications.reduce((acc, p) => acc + (p.views_count || 0), 0);
  const totalLikes = myPublications.reduce((acc, p) => acc + (p.likes_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user?.name}</h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Membre Vérifié
              </span>
            </div>
            <p className="text-xs text-cyan-300 font-medium">{user?.profession}</p>
            <p className="text-[11px] text-slate-400">
              {user?.city}, {user?.country} • Spécialité : {user?.expertise_domain}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("publish")}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publier un Projet</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">Mes Publications</span>
          <span className="block text-2xl sm:text-3xl font-black text-white mt-1">
            {myPublications.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">Total Vues</span>
          <span className="block text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
            {totalViews}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">Mentions J'aime</span>
          <span className="block text-2xl sm:text-3xl font-black text-rose-400 mt-1">
            {totalLikes}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">Notifications</span>
          <span className="block text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {notifications.length}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("publications")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "publications"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mes Publications ({myPublications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("publish")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "publish"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouvelle Publication</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Modifier mon Profil</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "notifications"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({notifications.length})</span>
        </button>
      </div>

      {/* TAB 1: MY PUBLICATIONS */}
      {activeTab === "publications" && (
        <div className="space-y-4">
          {myPublications.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <p className="text-slate-300 text-sm font-semibold">Vous n'avez pas encore publié d'innovation.</p>
              <button
                onClick={() => setActiveTab("publish")}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Créer ma première publication
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPublications.map((pub) => (
                <div
                  key={pub.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                        {pub.category_name}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize flex items-center gap-1 ${
                          pub.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : pub.status === "pending"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {pub.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                        {pub.status === "pending" && <Clock className="w-3 h-3" />}
                        {pub.status === "rejected" && <XCircle className="w-3 h-3" />}
                        <span>
                          {pub.status === "approved"
                            ? "Validé"
                            : pub.status === "pending"
                            ? "En Attente de Modération"
                            : "Refusé"}
                        </span>
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white">{pub.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{pub.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {pub.views_count}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> {pub.likes_count}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/publications/${pub.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold"
                      >
                        Voir
                      </Link>
                      <button
                        onClick={() => handleDeletePublication(pub.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLISH FORM */}
      {activeTab === "publish" && (
        <form onSubmit={handlePublishSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-white">Formulaire de Publication d'Innovation</h3>

          {publishSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Publication enregistrée avec succès ! Redirection...</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Titre de la Publication *</label>
              <input
                type="text"
                required
                placeholder="Ex: Système de pompage solaire à haut rendement"
                value={pubTitle}
                onChange={(e) => setPubTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Catégorie / Domaine *</label>
              <select
                value={pubCategoryId}
                onChange={(e) => setPubCategoryId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Type de Publication</label>
              <select
                value={pubType}
                onChange={(e) => setPubType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="innovation">Innovation Technologique</option>
                <option value="project">Projet d'Ingénierie</option>
                <option value="technical_report">Rapport Technique</option>
                <option value="article">Article de Recherche</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Image de couverture</label>
              {pubCover && (
                <img
                  src={pubCover}
                  alt="Aperçu couverture"
                  className="w-full h-24 object-cover rounded-xl border border-slate-700 mb-2"
                />
              )}
              <input
                type="text"
                value={pubCover}
                onChange={(e) => setPubCover(e.target.value)}
                placeholder="URL de l'image ou chargez depuis l'appareil"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <label className="block cursor-pointer text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs rounded-xl p-2 transition">
                {coverUploading ? "Chargement en cours..." : "Charger une image depuis mon appareil"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  disabled={coverUploading}
                />
              </label>
            </div>
          </div>

          {/* Media & Documentation Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Document PDF (résultats, rapport technique)
              </label>
              <input
                type="text"
                value={pubPdf}
                onChange={(e) => setPubPdf(e.target.value)}
                placeholder="URL du PDF ou chargez depuis l'appareil"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <label className="block cursor-pointer text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs rounded-xl p-2 transition">
                {pdfUploading ? "Chargement du PDF..." : "Charger un PDF depuis mon appareil (max 25 Mo)"}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  disabled={pdfUploading}
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Vidéo de démonstration (optionnelle, max 10 min)
              </label>
              <input
                type="text"
                value={pubVideo}
                onChange={(e) => setPubVideo(e.target.value)}
                placeholder="Lien YouTube ou fichier .mp4"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Collez un lien YouTube (youtube.com/watch?v=...) ou l'URL d'un fichier .mp4 hébergé pour montrer votre prototype en action.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Résumé Exécutif *</label>
            <textarea
              rows={2}
              required
              placeholder="Décrivez brièvement le problème résolu et la portée de la solution..."
              value={pubSummary}
              onChange={(e) => setPubSummary(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Contenu & Description Technique Détaillée *</label>
            <textarea
              rows={5}
              required
              placeholder="Détails de l'architecture, protocoles, résultats de tests et méthodologie..."
              value={pubContent}
              onChange={(e) => setPubContent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 text-white font-bold text-xs rounded-xl shadow-lg"
          >
            Soumettre la Publication
          </button>
        </form>
      )}

      {/* TAB 3: EDIT PROFILE */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-white">Modifier mes Informations Personnelles</h3>

          {profileSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profil mis à jour avec succès !</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Nom & Prénom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Photo de profil</label>
              {photo && (
                <img
                  src={photo}
                  alt="Aperçu profil"
                  className="w-20 h-20 rounded-2xl object-cover border border-cyan-400 mb-2"
                />
              )}
              <input
                type="text"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="URL de la photo ou chargez depuis l'appareil"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <label className="block cursor-pointer text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs rounded-xl p-2 transition">
                {profilePhotoUploading ? "Chargement en cours..." : "Charger une photo depuis mon appareil"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                  disabled={profilePhotoUploading}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Profession / Titre</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Domaine d'expertise</label>
              <input
                type="text"
                value={expertiseDomain}
                onChange={(e) => setExpertiseDomain(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Pays</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Biographie</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les Modifications</span>
          </button>
        </form>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <h3 className="text-lg font-bold text-white mb-2">Centre de Notifications</h3>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="font-bold text-xs text-cyan-300">{n.title}</span>
                <p className="text-xs text-slate-300">{n.message}</p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(n.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {n.link && (
                <Link
                  href={n.link}
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg shrink-0"
                >
                  Voir
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
