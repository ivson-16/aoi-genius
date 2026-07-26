"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Heart,
  Lock,
  LogOut,
  Mail,
  PlusCircle,
  Save,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

const CREDS_KEY = "aoi_member_creds_v1";

type Tab = "publications" | "publish" | "profile" | "notifications";

export default function MemberDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [approved, setApproved] = useState(false);
  const [publications, setPublications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("publications");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CREDS_KEY);
      if (saved) {
        const { e, p } = JSON.parse(saved);
        if (e && p) {
          setEmail(e);
          setPassword(p);
          verifyAndLoad(e, p);
        }
      }
    } catch {}
  }, []);

  async function directCall(op: string, payload?: any, e = email, p = password) {
    const response = await fetch("/api/member/direct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: e, password: p, op, payload }),
    });
    const data = await response.json();
    return { response, data };
  }

  async function verifyAndLoad(e: string, p: string) {
    setLoading(true);
    setError("");
    try {
      const { response, data } = await directCall("load", undefined, e, p);
      if (!response.ok || data.error) {
        setError(data.error || "Connexion impossible.");
        setAuthenticated(false);
        try { sessionStorage.removeItem(CREDS_KEY); } catch {}
        return;
      }
      setUser(data.user);
      setApproved(Boolean(data.approved));
      setPublications(data.publications || []);
      setNotifications(data.notifications || []);
      setCategories(data.categories || []);
      setAuthenticated(true);
      try { sessionStorage.setItem(CREDS_KEY, JSON.stringify({ e, p })); } catch {}
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function reload() {
    const { data } = await directCall("load");
    if (data.user) {
      setUser(data.user);
      setApproved(Boolean(data.approved));
      setPublications(data.publications || []);
      setNotifications(data.notifications || []);
      setCategories(data.categories || []);
    }
  }

  function logout() {
    try { sessionStorage.removeItem(CREDS_KEY); } catch {}
    setAuthenticated(false);
    setEmail("");
    setPassword("");
    setUser(null);
  }

  if (!authenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white mx-auto shadow-lg">
              <User className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white">Espace Membre</h1>
            <p className="text-xs text-slate-300">Connectez-vous avec votre compte pour accéder à vos privilèges.</p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              verifyAndLoad(email.trim(), password);
            }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl"
          >
            {error && <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">{error}</div>}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Adresse e-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500" />
              </div>
            </div>
            <button disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm disabled:opacity-60">
              {loading ? "Vérification..." : "Ouvrir mon espace membre"}
            </button>
            <p className="text-center text-[10px] text-slate-500 font-mono">build V1.0.9 · console membre autonome</p>
          </form>
        </div>
      </div>
    );
  }

  if (!approved) {
    const rejected = user?.membership_status === "rejected";
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className={`bg-slate-900 border-2 ${rejected ? "border-rose-500/40" : "border-amber-500/40"} rounded-3xl p-8 text-center space-y-5`}>
          {rejected ? <XCircle className="w-14 h-14 text-rose-400 mx-auto" /> : <Clock className="w-14 h-14 text-amber-400 mx-auto" />}
          <h1 className="text-2xl font-black text-white">{rejected ? "Demande d’adhésion non retenue" : "Adhésion en cours d’examen"}</h1>
          <p className="text-sm text-slate-300">
            {rejected
              ? "Votre demande n’a pas été retenue pour le moment. Contactez l’administration si vous souhaitez davantage d’informations."
              : `Bonjour ${user?.name}, l’administrateur doit encore approuver votre adhésion avant que vous puissiez publier, commenter ou aimer.`}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/publications" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold">Consulter les publications</Link>
            <Link href="/contact" className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold">Contacter l’administration</Link>
            <button onClick={logout} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Déconnexion</button>
          </div>
        </div>
      </div>
    );
  }

  const totalViews = publications.reduce((sum, publication) => sum + (publication.views_count || 0), 0);
  const totalLikes = publications.reduce((sum, publication) => sum + (publication.likes_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-4 items-center">
          {user?.photo ? <img src={user.photo} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400" /> : <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">{user?.name?.charAt(0)}</div>}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{user?.name}</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">MEMBRE APPROUVÉ</span>
            </div>
            <p className="text-xs text-cyan-300">{user?.profession}</p>
            <p className="text-[11px] text-slate-400">{user?.city}, {user?.country} · {user?.expertise_domain}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTab("publish")} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs flex gap-2"><PlusCircle className="w-4 h-4" /> Publier</button>
          <button onClick={logout} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold flex gap-2"><LogOut className="w-4 h-4" /> Déconnexion</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Mes publications", publications.length, "text-white"],
          ["Total vues", totalViews, "text-cyan-400"],
          ["Mentions J’aime", totalLikes, "text-rose-400"],
          ["Notifications", notifications.length, "text-amber-400"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-xs text-slate-400">{label}</span>
            <span className={`block text-2xl font-black mt-1 ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          ["publications", "Mes publications", FileText],
          ["publish", "Nouvelle publication", PlusCircle],
          ["profile", "Mon profil", User],
          ["notifications", "Notifications", Bell],
        ].map(([key, label, Icon]: any) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-xl text-xs font-bold flex gap-2 ${tab === key ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-300"}`}><Icon className="w-4 h-4" /> {label}</button>
        ))}
      </div>

      {tab === "publications" && <PublicationsList publications={publications} call={directCall} onChange={reload} />}
      {tab === "publish" && <PublishForm categories={categories} email={email} password={password} call={directCall} onDone={async () => { await reload(); setTab("publications"); }} />}
      {tab === "profile" && <ProfileForm user={user} email={email} password={password} call={directCall} onDone={reload} />}
      {tab === "notifications" && <NotificationsList notifications={notifications} call={directCall} />}
    </div>
  );
}

function PublicationsList({ publications, call, onChange }: any) {
  async function remove(id: number) {
    if (!confirm("Supprimer définitivement cette publication ?")) return;
    const { data } = await call("deletePublication", { id });
    if (data.error) return alert(data.error);
    onChange();
  }
  if (!publications.length) return <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-sm text-slate-300">Vous n’avez pas encore publié de projet.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {publications.map((publication: any) => (
        <div key={publication.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between gap-3">
            <span className="text-[10px] uppercase text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded">{publication.category_name}</span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded ${publication.status === "approved" ? "bg-emerald-500/20 text-emerald-300" : publication.status === "pending" ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"}`}>
              {publication.status === "approved" ? "Validée" : publication.status === "pending" ? "En attente" : "Refusée"}
            </span>
          </div>
          <div><h3 className="font-bold text-white">{publication.title}</h3><p className="text-xs text-slate-300 line-clamp-2 mt-1">{publication.summary}</p></div>
          <div className="pt-3 border-t border-slate-800 flex justify-between">
            <div className="flex gap-3 text-xs text-slate-400"><span className="flex gap-1"><Eye className="w-3.5 h-3.5" />{publication.views_count}</span><span className="flex gap-1"><Heart className="w-3.5 h-3.5" />{publication.likes_count}</span></div>
            <div className="flex gap-2"><Link href={`/publications/${publication.id}`} className="px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 text-xs">Voir</Link><button onClick={() => remove(publication.id)} className="p-1.5 rounded-lg bg-slate-800 text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PublishForm({ categories, email, password, call, onDone }: any) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("innovation");
  const [categoryId, setCategoryId] = useState(String(categories[0]?.id || 1));
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState("");

  async function upload(file: File, target: "cover" | "pdf") {
    setUploading(target);
    const form = new FormData();
    form.append("email", email); form.append("password", password); form.append("file", file);
    const response = await fetch("/api/member/upload", { method: "POST", body: form });
    const data = await response.json();
    setUploading("");
    if (data.error) return alert(data.error);
    target === "cover" ? setCoverImage(data.url) : setPdfUrl(data.url);
  }

  return (
    <form onSubmit={async (event) => { event.preventDefault(); const { data } = await call("createPublication", { title, type, categoryId, summary, content, coverImage, pdfUrl, videoUrl }); if (data.error) return alert(data.error); alert("Publication soumise à la validation de l’administrateur."); onDone(); }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
      <h3 className="text-lg font-bold text-white">Nouvelle publication</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du projet" className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white" />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white">{categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"><option value="innovation">Innovation</option><option value="project">Projet</option><option value="article">Article</option><option value="technical_report">Rapport technique</option></select>
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Lien vidéo (optionnel)" className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white" />
      </div>
      <textarea required rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Résumé exécutif" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white" />
      <textarea required rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Description technique détaillée" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-cyan-300 text-center cursor-pointer">{uploading === "cover" ? "Envoi..." : coverImage ? "Image chargée ✓" : "Charger l’image de couverture"}<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "cover")} /></label>
        <label className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-cyan-300 text-center cursor-pointer">{uploading === "pdf" ? "Envoi..." : pdfUrl ? "PDF chargé ✓" : "Charger le document PDF"}<input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "pdf")} /></label>
      </div>
      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm">Soumettre à validation</button>
    </form>
  );
}

function ProfileForm({ user, email, password, call, onDone }: any) {
  const [form, setForm] = useState({ name: user.name || "", photo: user.photo || "", country: user.country || "", city: user.city || "", profession: user.profession || "", expertiseDomain: user.expertise_domain || "", bio: user.bio || "", whatsapp: user.whatsapp || "" });
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function upload(file: File) { const dataForm = new FormData(); dataForm.append("email", email); dataForm.append("password", password); dataForm.append("file", file); const response = await fetch("/api/member/upload", { method: "POST", body: dataForm }); const data = await response.json(); if (data.error) return alert(data.error); set("photo", data.url); }
  return (
    <form onSubmit={async (e) => { e.preventDefault(); const { data } = await call("updateProfile", form); if (data.error) return alert(data.error); alert("Profil mis à jour."); onDone(); }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
      <h3 className="text-lg font-bold text-white">Modifier mon profil</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[["name","Nom complet"],["profession","Profession"],["country","Pays"],["city","Ville"],["expertiseDomain","Expertise"],["whatsapp","WhatsApp"]].map(([key,label]) => <input key={key} value={(form as any)[key]} onChange={(e) => set(key,e.target.value)} placeholder={label} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white" />)}</div>
      <textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Biographie" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white" />
      <label className="block p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-cyan-300 text-center cursor-pointer">Charger une nouvelle photo<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
      <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
    </form>
  );
}

function NotificationsList({ notifications, call }: any) {
  return <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">{notifications.length ? notifications.map((notification: any) => <div key={notification.id} className="p-4 rounded-2xl bg-slate-800 border border-slate-700"><p className="text-xs font-bold text-cyan-300">{notification.title}</p><p className="text-xs text-slate-300 mt-1">{notification.message}</p></div>) : <p className="text-sm text-slate-400 text-center py-8">Aucune notification.</p>}</div>;
}
