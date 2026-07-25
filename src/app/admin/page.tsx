"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Trash2,
  Users,
  FileText,
  Eye,
  Heart,
  Download,
  PlusCircle,
  Newspaper,
  Layers,
  Send,
  Edit,
  Save,
  UserCheck,
  Phone,
  Globe,
  Mail,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"adminProfile" | "members" | "moderation" | "categories" | "news">("adminProfile");
  const [publications, setPublications] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // 1. ADMIN PROFILE FORM STATE
  const [adminName, setAdminName] = useState(user?.name || "Codjo Ivson Oméra KINDE");
  const [adminEmail, setAdminEmail] = useState(user?.email || "Kindeivson@gmail.com");
  const [adminPhoto, setAdminPhoto] = useState(user?.photo || "https://media.licdn.com/dms/image/v2/D4E03AQGVLesdyscftg/profile-displayphoto-crop_800_800/B4EZyHj56yIQAI-/0/1771800865941?e=1786579200&v=beta&t=CKeVzltqozaHGOsSUWTZ-CQeDiS057vEi9wxpX5rTG8");
  const [adminProfession, setAdminProfession] = useState(user?.profession || "Fondateur & Directeur Général AOI Genius");
  const [adminExpertise, setAdminExpertise] = useState(user?.expertise_domain || "Energie et Environnement");
  const [adminCountry, setAdminCountry] = useState(user?.country || "Bénin");
  const [adminCity, setAdminCity] = useState(user?.city || "Cotonou");
  const [adminWhatsapp, setAdminWhatsapp] = useState(user?.whatsapp || "+229 01 57 363 198");
  const [adminBio, setAdminBio] = useState(user?.bio || "Électrotechnicien, Énergéticien et fondateur d'AOI Genius avec plus de 2 ans d'expérience.");
  const [adminSavedSuccess, setAdminSavedSuccess] = useState(false);
  const [adminPhotoUploading, setAdminPhotoUploading] = useState(false);

  // 2. MEMBER EDITING / CREATING FORM STATE
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("member");
  const [memberPhoto, setMemberPhoto] = useState("");
  const [memberProfession, setMemberProfession] = useState("");
  const [memberExpertise, setMemberExpertise] = useState("");
  const [memberCountry, setMemberCountry] = useState("Bénin");
  const [memberCity, setMemberCity] = useState("Cotonou");
  const [memberWhatsapp, setMemberWhatsapp] = useState("");
  const [memberBio, setMemberBio] = useState("");
  const [memberSaveSuccess, setMemberSaveSuccess] = useState(false);
  const [memberPhotoUploading, setMemberPhotoUploading] = useState(false);

  // 3. NEWS PUBLISHER STATE
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsTag, setNewsTag] = useState("Concours");
  const [newsCover, setNewsCover] = useState("https://images.pexels.com/photos/16544931/pexels-photo-16544931.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200");
  const [newsCoverUploading, setNewsCoverUploading] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState(false);

  // 4. CATEGORY STATE
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [pubsRes, usersRes, catsRes] = await Promise.all([
        fetch("/api/publications?status=all"),
        fetch("/api/admin/users"),
        fetch("/api/categories"),
      ]);

      const [pubsData, usersData, catsData] = await Promise.all([
        pubsRes.json(),
        usersRes.json(),
        catsRes.json(),
      ]);

      if (pubsData.publications) setPublications(pubsData.publications);
      if (usersData.users) setUsersList(usersData.users);
      if (catsData.categories) setCategories(catsData.categories);
    } catch (err) {
      console.error(err);
    }
  };

  // Save Admin's own profile
  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = user?.id || 1;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: adminId,
          name: adminName,
          email: adminEmail,
          role: "admin",
          photo: adminPhoto,
          country: adminCountry,
          city: adminCity,
          profession: adminProfession,
          expertiseDomain: adminExpertise,
          bio: adminBio,
          whatsapp: adminWhatsapp,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser({ ...user, ...data.user, role: "admin" });
        setAdminSavedSuccess(true);
        fetchAdminData();
        setTimeout(() => setAdminSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start Editing a Member
  const startEditMember = (m: any) => {
    setEditingUserId(m.id);
    setMemberName(m.name);
    setMemberEmail(m.email);
    setMemberRole(m.role || "member");
    setMemberPhoto(m.photo || "");
    setMemberProfession(m.profession || "");
    setMemberExpertise(m.expertise_domain || "");
    setMemberCountry(m.country || "Bénin");
    setMemberCity(m.city || "Cotonou");
    setMemberWhatsapp(m.whatsapp || "");
    setMemberBio(m.bio || "");
  };

  // Start Adding a New Member
  const startAddMember = () => {
    setEditingUserId(-1); // -1 indicates new member
    setMemberName("");
    setMemberEmail("");
    setMemberRole("member");
    setMemberPhoto("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80");
    setMemberProfession("Ingénieur & Chercheur");
    setMemberExpertise("Intelligence Artificielle");
    setMemberCountry("Bénin");
    setMemberCity("Cotonou");
    setMemberWhatsapp("");
    setMemberBio("");
  };

  // Save Member (Add or Update)
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isNew = editingUserId === -1;
      const url = "/api/admin/users";
      const method = isNew ? "POST" : "PUT";
      const payload: any = {
        name: memberName,
        email: memberEmail,
        role: memberRole,
        photo: memberPhoto,
        profession: memberProfession,
        expertiseDomain: memberExpertise,
        country: memberCountry,
        city: memberCity,
        whatsapp: memberWhatsapp,
        bio: memberBio,
      };
      if (!isNew) {
        payload.id = editingUserId;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMemberSaveSuccess(true);
        setEditingUserId(null);
        fetchAdminData();
        setTimeout(() => setMemberSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce membre de la plateforme ?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Impossible de supprimer ce membre.");
        return;
      }
      setUsersList((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Erreur réseau pendant la suppression du membre.");
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

  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageFromDevice(file, setAdminPhoto, setAdminPhotoUploading);
  };

  const handleMemberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageFromDevice(file, setMemberPhoto, setMemberPhotoUploading);
  };

  const handleNewsCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageFromDevice(file, setNewsCover, setNewsCoverUploading);
  };

  const handleModerate = async (pubId: number, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/publications/${pubId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moderate", status }),
      });
      const data = await res.json();
      if (data.success) {
        setPublications((prev) =>
          prev.map((p) => (p.id === pubId ? { ...p, status } : p))
        );
      }
    } catch (err) {}
  };

  const handleDeletePublication = async (pubId: number) => {
    if (!confirm("Voulez-vous supprimer définitivement cette publication ?")) return;
    try {
      await fetch(`/api/publications/${pubId}`, { method: "DELETE" });
      setPublications((prev) => prev.filter((p) => p.id !== pubId));
    } catch (err) {}
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsTitle,
          summary: newsSummary,
          content: newsContent,
          tag: newsTag,
          coverImage: newsCover,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsSuccess(true);
        setNewsTitle("");
        setNewsSummary("");
        setNewsContent("");
        setTimeout(() => setNewsSuccess(false), 3000);
      }
    } catch (err) {}
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName.trim(), description: catDesc.trim() }),
      });
      const data = await res.json();
      if (data.success && data.category) {
        setCategories((prev) => [...prev, data.category]);
        setCatName("");
        setCatDesc("");
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Console d'Administration & Gestion des Profils</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Espace Administrateur AOI Genius
          </h1>
          <p className="text-xs text-slate-300">
            Personnalisez vos informations d'administrateur, gérez et éditez les profils de vos membres, et modérez les projets.
          </p>
        </div>

        <button
          onClick={startAddMember}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajouter un Membre</span>
        </button>
      </div>

      {/* Global Statistics Counter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">Comptes Utilisateurs</span>
          <span className="block text-2xl font-black text-white mt-1">
            {usersList.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">Publications</span>
          <span className="block text-2xl font-black text-emerald-400 mt-1">
            {publications.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">Domaines Scientifiques</span>
          <span className="block text-2xl font-black text-cyan-400 mt-1">
            {categories.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">À Modérer</span>
          <span className="block text-2xl font-black text-amber-400 mt-1">
            {publications.filter((p) => p.status === "pending").length}
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("adminProfile")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "adminProfile"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Mon Profil Admin</span>
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "members"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestion des Membres ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "moderation"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Modération Projets ({publications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "categories"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catégories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("news")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "news"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-900 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Diffuser Actualité</span>
        </button>
      </div>

      {/* TAB 1: ADMIN'S OWN PROFILE CUSTOMIZATION */}
      {activeTab === "adminProfile" && (
        <form onSubmit={handleSaveAdminProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Personnaliser les Informations de l'Administrateur
            </h3>
            <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Rôle : Administrateur Principal
            </span>
          </div>

          {adminSavedSuccess && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Vos informations d'administrateur ont été enregistrées avec succès dans la base de données !</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Nom & Prénom de l'Admin *</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Adresse E-mail de l'Admin *</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Profession / Titre Officiel</label>
              <input
                type="text"
                value={adminProfession}
                onChange={(e) => setAdminProfession(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Domaine d'Expertise</label>
              <input
                type="text"
                value={adminExpertise}
                onChange={(e) => setAdminExpertise(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Pays</label>
              <input
                type="text"
                value={adminCountry}
                onChange={(e) => setAdminCountry(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Ville</label>
              <input
                type="text"
                value={adminCity}
                onChange={(e) => setAdminCity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Numéro WhatsApp</label>
              <input
                type="text"
                value={adminWhatsapp}
                onChange={(e) => setAdminWhatsapp(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Photo de Profil</label>
            {adminPhoto && (
              <img
                src={adminPhoto}
                alt="Aperçu photo Admin"
                className="w-24 h-24 rounded-2xl object-cover border border-amber-400 mb-2"
              />
            )}
            <input
              type="text"
              value={adminPhoto}
              onChange={(e) => setAdminPhoto(e.target.value)}
              placeholder="URL de la photo ou chargez depuis l'appareil"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <label className="block cursor-pointer text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl p-2 transition">
              {adminPhotoUploading ? "Chargement en cours..." : "Charger une photo depuis mon appareil"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAdminPhotoUpload}
                className="hidden"
                disabled={adminPhotoUploading}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Biographie & Présentation</label>
            <textarea
              rows={3}
              value={adminBio}
              onChange={(e) => setAdminBio(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer mes Informations Administrateur</span>
          </button>
        </form>
      )}

      {/* TAB 2: MEMBERS MANAGEMENT & INLINE EDITING */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {memberSaveSuccess && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Membre mis à jour avec succès dans la base de données !</span>
            </div>
          )}

          {/* Member Add/Edit Modal/Form */}
          {editingUserId !== null && (
            <form onSubmit={handleSaveMember} className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  {editingUserId === -1 ? "Ajouter un Nouveau Membre" : "Modifier les Informations du Membre"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Nom & Prénom *</label>
                  <input
                    type="text"
                    required
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Adresse E-mail *</label>
                  <input
                    type="email"
                    required
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Profession</label>
                  <input
                    type="text"
                    value={memberProfession}
                    onChange={(e) => setMemberProfession(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Domaine d'Expertise</label>
                  <input
                    type="text"
                    value={memberExpertise}
                    onChange={(e) => setMemberExpertise(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Rôle</label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="member">Membre</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Photo du membre</label>
                {memberPhoto && (
                  <img
                    src={memberPhoto}
                    alt="Aperçu membre"
                    className="w-20 h-20 rounded-2xl object-cover border border-emerald-400 mb-2"
                  />
                )}
                <input
                  type="text"
                  value={memberPhoto}
                  onChange={(e) => setMemberPhoto(e.target.value)}
                  placeholder="URL de la photo ou chargez depuis l'appareil"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
                <label className="block cursor-pointer text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 font-bold text-xs rounded-xl p-2 transition">
                  {memberPhotoUploading ? "Chargement en cours..." : "Charger une photo depuis mon appareil"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMemberPhotoUpload}
                    className="hidden"
                    disabled={memberPhotoUploading}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Pays</label>
                  <input
                    type="text"
                    value={memberCountry}
                    onChange={(e) => setMemberCountry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Ville</label>
                  <input
                    type="text"
                    value={memberCity}
                    onChange={(e) => setMemberCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">WhatsApp</label>
                  <input
                    type="text"
                    value={memberWhatsapp}
                    onChange={(e) => setMemberWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Courte Biographie</label>
                <textarea
                  rows={2}
                  value={memberBio}
                  onChange={(e) => setMemberBio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Enregistrer les Informations du Membre
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Fermer
                </button>
              </div>
            </form>
          )}

          {/* Members List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersList.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {m.photo ? (
                        <img
                          src={m.photo}
                          alt={m.name}
                          className="w-12 h-12 rounded-xl object-cover border border-cyan-400"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-white">{m.name}</h4>
                        <p className="text-xs text-cyan-300">{m.profession}</p>
                        <p className="text-[10px] text-slate-400">
                          {m.city}, {m.country} • {m.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        m.role === "admin"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>

                  {m.bio && (
                    <p className="text-xs text-slate-300 line-clamp-2">{m.bio}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Expertise : {m.expertise_domain}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditMember(m)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    {!(m.role === "admin" && m.id === user?.id) && (
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MODERATION OF PUBLICATIONS */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {pub.category_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        pub.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : pub.status === "pending"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {pub.status === "approved" ? "Approuvé" : pub.status === "pending" ? "En attente" : "Rejeté"}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{pub.title}</h3>
                  <p className="text-xs text-slate-400">
                    Auteur : <strong className="text-slate-300">{pub.author_name}</strong> • {pub.author_profession}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {pub.status !== "approved" && (
                    <button
                      onClick={() => handleModerate(pub.id, "approved")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valider</span>
                    </button>
                  )}

                  {pub.status !== "rejected" && (
                    <button
                      onClick={() => handleModerate(pub.id, "rejected")}
                      className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Refuser</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeletePublication(pub.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg transition"
                    title="Supprimer définitivement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeTab === "categories" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <form onSubmit={handleCategorySubmit} className="space-y-3 pb-6 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Ajouter un Domaine Scientifique</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nom du domaine (ex: Nanotechnologies)"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Description courte..."
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
              Ajouter la Catégorie
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="font-bold text-xs text-cyan-300 block">{c.name}</span>
                <span className="text-[10px] text-slate-400">{c.description || "Domaine actif"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: NEWS PUBLISHER */}
      {activeTab === "news" && (
        <form onSubmit={handleNewsSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-white">Diffuser une Actualité ou Annonce Officielle</h3>

          {newsSuccess && (
            <div className="p-3 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl">
              Actualité publiée avec succès et visible sur le site public !
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Titre de l'Actualité</label>
            <input
              type="text"
              required
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Tag / Catégorie de l'Annonce</label>
              <select
                value={newsTag}
                onChange={(e) => setNewsTag(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Concours">Concours & Prix</option>
                <option value="Partenariat">Partenariat</option>
                <option value="Plateforme">Mise à jour Plateforme</option>
                <option value="Événement">Événement & Hackathon</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Image de couverture de l'actualité</label>
            {newsCover && (
              <img
                src={newsCover}
                alt="Aperçu couverture actualité"
                className="w-full h-36 rounded-2xl object-cover border border-slate-700 mb-2"
              />
            )}
            <input
              type="text"
              value={newsCover}
              onChange={(e) => setNewsCover(e.target.value)}
              placeholder="URL de l'image ou chargez depuis l'appareil"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
            <label className="block cursor-pointer text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs rounded-xl p-2 transition">
              {newsCoverUploading ? "Chargement en cours..." : "Charger une image depuis mon appareil"}
              <input
                type="file"
                accept="image/*"
                onChange={handleNewsCoverUpload}
                className="hidden"
                disabled={newsCoverUploading}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Résumé Court</label>
            <textarea
              rows={2}
              required
              value={newsSummary}
              onChange={(e) => setNewsSummary(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Contenu Intégral</label>
            <textarea
              rows={4}
              required
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Publier l'Actualité</span>
          </button>
        </form>
      )}
    </div>
  );
}
