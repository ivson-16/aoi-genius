"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  Eye,
  Download,
  Share2,
  MessageSquare,
  Sparkles,
  Send,
  Phone,
  Globe,
  Check,
  ArrowLeft,
  Trash2,
  FileText,
} from "lucide-react";

export default function PublicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pubId = params?.id as string;
  const { user } = useAuth();

  const [pub, setPub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (pubId) {
      fetchPublication();
    }
  }, [pubId]);

  const fetchPublication = async () => {
    try {
      const res = await fetch(`/api/publications/${pubId}`);
      const data = await res.json();
      if (data.publication) {
        setPub(data.publication);
        setLikesCount(data.publication.likes_count || 0);
        setComments(data.publication.comments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Connectez-vous pour aimer cette publication.");
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/publications/${pubId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        setLikesCount(data.likesCount);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    try {
      await fetch(`/api/publications/${pubId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "download" }),
      });
      if (pub?.pdf_url) {
        window.open(pub.pdf_url, "_blank");
      }
    } catch (err) {}
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      alert("Connectez-vous pour commenter cette publication.");
      router.push("/login");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/publications/${pubId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", content: commentText.trim() }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        const newC = {
          ...data.comment,
          user_name: user?.name || "Membre AOI",
          user_photo: user?.photo || null,
          user_profession: user?.profession || "Innovateur",
        };
        setComments((prev) => [...prev, newC]);
        setCommentText("");
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Detect YouTube embed from pasted URL
  const getYouTubeEmbed = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
    return null;
  };

  const youtubeEmbed = pub ? getYouTubeEmbed(pub.video_url || "") : null;

  const handleDeletePublication = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette publication ? Cette action est définitive.")) return;
    try {
      const res = await fetch(`/api/publications/${pubId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Impossible de supprimer cette publication.");
        return;
      }
      router.push("/publications");
    } catch (err) {
      console.error(err);
      alert("Erreur réseau pendant la suppression.");
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Chargement des détails de l'innovation...</p>
      </div>
    );
  }

  if (!pub) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Publication non trouvée</h2>
        <Link href="/publications" className="text-cyan-400 text-xs hover:underline">
          Retour aux publications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Link */}
      <Link
        href="/publications"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour aux publications</span>
      </Link>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {pub.category_name}
          </span>
          <span className="bg-blue-600/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {pub.type === "technical_report"
              ? "Rapport Technique"
              : pub.type === "article"
              ? "Article de Recherche"
              : pub.type === "project"
              ? "Projet d'Ingénierie"
              : "Innovation Technologique"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
          {pub.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed border-l-2 border-cyan-500 pl-4 py-1">
          {pub.summary}
        </p>
      </div>

      {/* Cover Image Banner */}
      <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        <img
          src={pub.cover_image}
          alt={pub.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Content Layout with 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Body Content & Comments */}
        <div className="lg:col-span-2 space-y-10">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  liked
                    ? "bg-rose-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-rose-400"
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{likesCount} J'aime</span>
              </button>

              <span className="text-xs text-slate-400 flex items-center gap-1.5 px-3 py-2 bg-slate-800/60 rounded-xl">
                <Eye className="w-4 h-4 text-slate-500" />
                <span>{pub.views_count} Vues</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Document PDF</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                title="Partager"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "Lien copié !" : "Partager"}</span>
              </button>

              {(user?.role === "admin" || user?.id === pub.author_id) && (
                <button
                  onClick={handleDeletePublication}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold transition"
                  title="Supprimer cette publication"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 text-slate-200 space-y-6 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {pub.content}
          </div>

          {/* Video Demonstration Section */}
          {pub.video_url && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white">Vidéo de Démonstration</h3>
              </div>
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                {youtubeEmbed ? (
                  <iframe
                    src={youtubeEmbed}
                    title={pub.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                    src={pub.video_url}
                  >
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Démonstration courte du prototype en conditions réelles. Utilisez les contrôles pour mettre en pause ou passer en plein écran.
              </p>
            </div>
          )}

          {/* Technical Documentation / PDF Preview Section */}
          {pub.pdf_url && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Documentation & Résultats (PDF)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={pub.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    Ouvrir l'aperçu
                  </a>
                  <a
                    href={pub.pdf_url}
                    download
                    onClick={handleDownload}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger ({pub.downloads_count || 0})</span>
                  </a>
                </div>
              </div>
              <div className="w-full h-[420px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                <iframe
                  src={pub.pdf_url}
                  title={`Document ${pub.title}`}
                  className="w-full h-full"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Document public : résultats de tests, schémas techniques et méthodologie. Libre de consultation et de téléchargement pour toute la communauté.
              </p>
            </div>
          )}

          {/* Comment System Section */}
          <div className="space-y-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">
                Commentaires & Échanges ({comments.length})
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <textarea
                placeholder="Ajouter une remarque technique, une suggestion ou une question à l'auteur..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {user ? (
                    <>Connecté en tant que <strong className="text-slate-200">{user.name}</strong></>
                  ) : (
                    <Link href="/login" className="text-cyan-400 hover:underline font-semibold">
                      Connectez-vous pour commenter
                    </Link>
                  )}
                </span>
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingComment ? "Envoi..." : "Commenter"}</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((cm: any) => (
                <div
                  key={cm.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {cm.user_photo ? (
                        <img
                          src={cm.user_photo}
                          alt={cm.user_name}
                          className="w-6 h-6 rounded-full object-cover border border-cyan-400"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {cm.user_name?.charAt(0) || "M"}
                        </div>
                      )}
                      <span className="font-bold text-slate-200">{cm.user_name}</span>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        • {cm.user_profession}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(cm.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 pl-8 leading-relaxed">
                    {cm.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Author Card & Meta */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">
              Auteur de l'Innovation
            </span>

            <div className="flex items-center gap-3">
              {pub.author_photo ? (
                <img
                  src={pub.author_photo}
                  alt={pub.author_name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                  {pub.author_name?.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-bold text-base text-white">{pub.author_name}</h4>
                <p className="text-xs text-cyan-300 font-medium">{pub.author_profession}</p>
                <p className="text-[11px] text-slate-400">
                  {pub.author_city}, {pub.author_country}
                </p>
              </div>
            </div>

            {pub.author_bio && (
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                {pub.author_bio}
              </p>
            )}

            {/* Author Direct Contacts */}
            <div className="pt-2 flex flex-col gap-2">
              {pub.author_whatsapp && (
                <a
                  href={`https://wa.me/${pub.author_whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp de l'Auteur</span>
                </a>
              )}
              {pub.author_linkedin && (
                <a
                  href={pub.author_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Profil Professionnel</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
