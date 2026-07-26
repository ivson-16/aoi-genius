"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Trash2,
  Users,
  FileText,
  PlusCircle,
  Newspaper,
  Layers,
  Send,
  UserCheck,
  LogOut,
  Save,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Console admin AUTONOME. Elle ne dépend d'AUCUN cookie / session partagée.
// L'admin entre email + mot de passe une seule fois : ils sont gardés en
// mémoire de page et renvoyés au serveur à chaque action. Aucune redirection,
// aucune boucle, ça marche du premier coup sur tous les navigateurs.
// ---------------------------------------------------------------------------

const CREDENTIALS_KEY = "aoi_admin_creds_v1";

export default function AdminConsole() {
  // Identifiants admin (persistés dans sessionStorage tant que l'onglet est ouvert)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Données de la console
  const [admin, setAdmin] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "requests" | "members" | "moderation" | "categories" | "news">("requests");

  // Restauration des identifiants au chargement de la page
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CREDENTIALS_KEY);
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

  // Appel serveur générique
  async function call(op: string, payload?: any) {
    const res = await fetch("/api/admin/direct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, op, payload }),
    });
    return res.json();
  }

  async function verifyAndLoad(e: string, p: string) {
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, password: p, op: "load" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setLoginError(data.error || "Erreur de connexion.");
        setAuthed(false);
        try {
          sessionStorage.removeItem(CREDENTIALS_KEY);
        } catch {}
        return;
      }
      setAdmin(data.admin);
      setUsers(data.users || []);
      setPublications(data.publications || []);
      setCategories(data.categories || []);
      setAuthed(true);
      try {
        sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ e, p }));
      } catch {}
    } catch {
      setLoginError("Erreur réseau. Réessayez.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function reload() {
    setDataLoading(true);
    const data = await call("load");
    if (data.users) {
      setUsers(data.users);
      setPublications(data.publications || []);
      setCategories(data.categories || []);
    }
    setDataLoading(false);
  }

  function logout() {
    try {
      sessionStorage.removeItem(CREDENTIALS_KEY);
    } catch {}
    setAuthed(false);
    setEmail("");
    setPassword("");
    setAdmin(null);
  }

  // -----------------------------------------------------------------
  // ÉCRAN 1 : formulaire de connexion admin (autonome)
  // -----------------------------------------------------------------
  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white">Console d'Administration</h1>
            <p className="text-xs text-slate-300">
              Connectez-vous avec vos identifiants administrateur pour accéder à toutes les fonctions de gestion.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyAndLoad(email.trim(), password);
            }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl"
          >
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Adresse E-mail administrateur</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>{loginLoading ? "Vérification..." : "Ouvrir la console"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[10px] text-slate-500 font-mono pt-1">
              build V1.0.8 · console autonome (aucune session partagée)
            </p>
          </form>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // ÉCRAN 2 : console admin complète
  // -----------------------------------------------------------------
  const pendingRequests = users.filter((u) => u.membership_status === "pending");
  const pendingPubs = publications.filter((p) => p.status === "pending");

  async function decideMembership(id: number, decision: "approved" | "rejected") {
    if (!confirm(`Vraiment ${decision === "approved" ? "approuver" : "refuser"} cette demande ?`)) return;
    const d = await call("membership", { id, decision });
    if (d.error) return alert(d.error);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, membership_status: decision } : u)));
  }

  async function moderatePub(id: number, status: "approved" | "rejected") {
    const d = await call("moderate", { id, status });
    if (d.error) return alert(d.error);
    setPublications((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  async function deletePub(id: number) {
    if (!confirm("Supprimer définitivement cette publication ?")) return;
    const d = await call("deletePub", { id });
    if (d.error) return alert(d.error);
    setPublications((prev) => prev.filter((p) => p.id !== id));
  }

  async function deleteUser(id: number) {
    if (!confirm("Supprimer ce membre définitivement ?")) return;
    const d = await call("deleteUser", { id });
    if (d.error) return alert(d.error);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Console autonome — build V1.0.8</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Bonjour {admin?.name}</h1>
          <p className="text-xs text-slate-300">Vous êtes connecté en tant qu'administrateur.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            disabled={dataLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs disabled:opacity-60"
          >
            {dataLoading ? "Actualisation..." : "Actualiser"}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-rose-300 font-bold text-xs flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">Comptes utilisateurs</span>
          <span className="block text-2xl font-black text-white mt-1">{users.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 text-center">
          <span className="text-xs text-amber-300 font-medium">Adhésions en attente</span>
          <span className="block text-2xl font-black text-amber-400 mt-1">{pendingRequests.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">Publications</span>
          <span className="block text-2xl font-black text-emerald-400 mt-1">{publications.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 font-medium">À modérer</span>
          <span className="block text-2xl font-black text-rose-400 mt-1">{pendingPubs.length}</span>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { key: "requests", label: `Adhésions (${pendingRequests.length})`, icon: ShieldAlert },
          { key: "members", label: `Membres (${users.length})`, icon: Users },
          { key: "moderation", label: `Publications (${publications.length})`, icon: FileText },
          { key: "categories", label: `Catégories (${categories.length})`, icon: Layers },
          { key: "news", label: "Actualité", icon: Newspaper },
          { key: "profile", label: "Mon profil", icon: UserCheck },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === t.key
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========== Demandes d'adhésion ========== */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300">
            <strong className="text-amber-300">Contrôle des adhésions :</strong> les candidats ne peuvent ni publier ni
            commenter tant que vous n'avez pas approuvé leur demande. Ils sont notifiés automatiquement.
          </div>
          {pendingRequests.length === 0 ? (
            <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">Aucune demande en attente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((u) => (
                <div key={u.id} className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    {u.photo ? (
                      <img src={u.photo} alt={u.name} className="w-12 h-12 rounded-xl object-cover border border-amber-400" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white">{u.name}</h4>
                      <p className="text-xs text-cyan-300">{u.profession}</p>
                      <p className="text-[10px] text-slate-400">
                        {u.city}, {u.country} · {u.email}
                      </p>
                    </div>
                  </div>
                  {u.bio && <p className="text-xs text-slate-300 line-clamp-2">{u.bio}</p>}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => decideMembership(u.id, "approved")}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approuver
                    </button>
                    <button
                      onClick={() => decideMembership(u.id, "rejected")}
                      className="flex-1 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== Membres ========== */}
      {activeTab === "members" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {u.photo ? (
                    <img src={u.photo} alt={u.name} className="w-12 h-12 rounded-xl object-cover border border-cyan-400" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      {u.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white">{u.name}</h4>
                    <p className="text-xs text-cyan-300">{u.profession}</p>
                    <p className="text-[10px] text-slate-400">
                      {u.city}, {u.country} · {u.email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      u.role === "admin"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {u.role}
                  </span>
                  {u.role !== "admin" && u.membership_status !== "approved" && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        u.membership_status === "pending"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {u.membership_status === "pending" ? "En attente" : "Refusé"}
                    </span>
                  )}
                </div>
              </div>
              {u.role !== "admin" && (
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========== Publications ========== */}
      {activeTab === "moderation" && (
        <div className="grid grid-cols-1 gap-3">
          {publications.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                    {p.category_name || "—"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      p.status === "approved"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : p.status === "pending"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {p.status === "approved" ? "Approuvé" : p.status === "pending" ? "En attente" : "Refusé"}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{p.title}</h3>
                <p className="text-[10px] text-slate-400">Par {p.author_name}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.status !== "approved" && (
                  <button
                    onClick={() => moderatePub(p.id, "approved")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valider
                  </button>
                )}
                {p.status !== "rejected" && (
                  <button
                    onClick={() => moderatePub(p.id, "rejected")}
                    className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Refuser
                  </button>
                )}
                <Link
                  href={`/publications/${p.id}`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg"
                >
                  Voir
                </Link>
                <button
                  onClick={() => deletePub(p.id)}
                  className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== Catégories ========== */}
      {activeTab === "categories" && (
        <AddCategoryForm call={call} onDone={reload} categories={categories} />
      )}

      {/* ========== Actualité ========== */}
      {activeTab === "news" && <AddNewsForm call={call} onDone={reload} />}

      {/* ========== Profil ========== */}
      {activeTab === "profile" && <EditProfileForm admin={admin} call={call} onDone={reload} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sous-formulaires (isolés pour rester lisibles)
// ---------------------------------------------------------------------------

function AddCategoryForm({ call, onDone, categories }: any) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const d = await call("addCategory", { name, description });
          if (d.error) return alert(d.error);
          setName("");
          setDescription("");
          onDone();
        }}
        className="space-y-3 pb-6 border-b border-slate-800"
      >
        <h3 className="text-base font-bold text-white">Ajouter un domaine scientifique</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nom du domaine"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
          />
          <input
            type="text"
            placeholder="Description courte"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1">
          <PlusCircle className="w-3.5 h-3.5" /> Ajouter
        </button>
      </form>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((c: any) => (
          <div key={c.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
            <span className="font-bold text-xs text-cyan-300 block">{c.name}</span>
            <span className="text-[10px] text-slate-400">{c.description || "Domaine actif"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddNewsForm({ call, onDone }: any) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("Annonce");
  const [ok, setOk] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const d = await call("addNews", { title, summary, content, tag });
        if (d.error) return alert(d.error);
        setTitle("");
        setSummary("");
        setContent("");
        setOk(true);
        setTimeout(() => setOk(false), 3000);
        onDone();
      }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4"
    >
      <h3 className="text-lg font-bold text-white">Diffuser une actualité</h3>
      {ok && (
        <div className="p-3 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl">
          Actualité publiée avec succès.
        </div>
      )}
      <input
        type="text"
        required
        placeholder="Titre de l'actualité"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
      />
      <select
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
      >
        <option value="Annonce">Annonce</option>
        <option value="Concours">Concours & Prix</option>
        <option value="Partenariat">Partenariat</option>
        <option value="Événement">Événement</option>
      </select>
      <textarea
        rows={2}
        required
        placeholder="Résumé court"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white resize-none"
      />
      <textarea
        rows={5}
        required
        placeholder="Contenu intégral"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
      />
      <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2">
        <Send className="w-4 h-4" /> Publier
      </button>
    </form>
  );
}

function EditProfileForm({ admin, call, onDone }: any) {
  const [name, setName] = useState(admin?.name || "");
  const [photo, setPhoto] = useState(admin?.photo || "");
  const [country, setCountry] = useState(admin?.country || "");
  const [city, setCity] = useState(admin?.city || "");
  const [profession, setProfession] = useState(admin?.profession || "");
  const [expertiseDomain, setExpertiseDomain] = useState(admin?.expertise_domain || "");
  const [bio, setBio] = useState(admin?.bio || "");
  const [whatsapp, setWhatsapp] = useState(admin?.whatsapp || "");
  const [ok, setOk] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const d = await call("updateProfile", { name, photo, country, city, profession, expertiseDomain, bio, whatsapp });
        if (d.error) return alert(d.error);
        setOk(true);
        setTimeout(() => setOk(false), 3000);
        onDone();
      }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4"
    >
      <h3 className="text-lg font-bold text-white">Mon profil administrateur</h3>
      {ok && (
        <div className="p-3 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl">
          Profil mis à jour.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom complet" className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
        <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Profession" className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Pays" className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
        <input type="text" value={expertiseDomain} onChange={(e) => setExpertiseDomain(e.target.value)} placeholder="Expertise" className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
        <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp" className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
      </div>
      <input type="text" value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="URL de la photo" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
      <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Biographie" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white" />
      <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2">
        <Save className="w-4 h-4" /> Enregistrer
      </button>
    </form>
  );
}
