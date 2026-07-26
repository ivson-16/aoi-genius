"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "visitor" | "member" | "admin";
  membership_status?: "pending" | "approved" | "rejected";
  photo?: string;
  country?: string;
  city?: string;
  profession?: string;
  expertise_domain?: string;
  bio?: string;
  whatsapp?: string;
  social_facebook?: string;
  social_linkedin?: string;
  social_twitter?: string;
  social_github?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  role: "visitor" | "member" | "admin";
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User; token?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "aoi_token";
const NAME_PREFIX = "aoigenius-session::";
const CLIENT_COOKIE = "aoi_client_token";

function readClientCookie(): string | null {
  try {
    const match = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${CLIENT_COOKIE}=`));
    if (!match) return null;
    return decodeURIComponent(match.split("=")[1] || "") || null;
  } catch {
    return null;
  }
}

function writeClientCookie(token: string) {
  try {
    // Cookie lisible par le JavaScript, avec l'attribut Partitioned pour les
    // iframes modernes (Chrome CHIPS). C'est le canal le plus fiable en iframe.
    const attrs = ["Path=/", `Max-Age=${60 * 60 * 24 * 30}`, "SameSite=None", "Secure", "Partitioned"];
    document.cookie = `${CLIENT_COOKIE}=${encodeURIComponent(token)}; ${attrs.join("; ")}`;
  } catch {}
}

function clearClientCookie() {
  try {
    document.cookie = `${CLIENT_COOKIE}=; Path=/; Max-Age=0; SameSite=None; Secure; Partitioned`;
  } catch {}
}

// ---------------------------------------------------------------------------
// La session est conservée sur 5 canaux simultanés pour résister à tous les
// environnements (accès direct, iframe d'aperçu, navigation privée...) :
//   1. Cookie HTTP-only Partitioned      (serveur)
//   2. Mémoire vive du module            (navigation SPA)
//   3. window.name                       (SURVIT aux rechargements complets,
//                                         ignoré par le partitionnement de stockage)
//   4. localStorage                      (retours ultérieurs)
//   5. sessionStorage                    (onglet)
// Le jeton reste signé HMAC côté serveur : impossible à falsifier.
// ---------------------------------------------------------------------------
let memoryToken: string | null = null;

function getWindowNameToken(): string | null {
  try {
    const n = window.name;
    if (typeof n === "string" && n.startsWith(NAME_PREFIX)) {
      return n.slice(NAME_PREFIX.length) || null;
    }
  } catch {}
  return null;
}

export function getStoredToken(): string | null {
  if (memoryToken) return memoryToken;
  // 1) Cookie client-side (le plus fiable en iframe grâce à Partitioned)
  const fromCookie = readClientCookie();
  if (fromCookie) {
    memoryToken = fromCookie;
    return fromCookie;
  }
  // 2) window.name (survit aux rechargements même sans stockage)
  const fromName = getWindowNameToken();
  if (fromName) {
    memoryToken = fromName;
    return fromName;
  }
  // 3) localStorage / sessionStorage
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      memoryToken = t;
      return t;
    }
  } catch {}
  try {
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) {
      memoryToken = t;
      return t;
    }
  } catch {}
  return null;
}

/** Stocke le jeton de session sur tous les canaux disponibles. */
export function storeSessionToken(token: string) {
  memoryToken = token;
  writeClientCookie(token);
  try {
    window.name = NAME_PREFIX + token;
  } catch {}
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

/** Vérifie la session auprès du serveur et retourne l'utilisateur (ou null). */
export async function refreshNow(): Promise<any> {
  try {
    const token = getStoredToken();
    const res = await fetch("/api/auth", {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

function clearSessionToken() {
  memoryToken = null;
  clearClientCookie();
  try {
    if (typeof window.name === "string" && window.name.startsWith(NAME_PREFIX)) {
      window.name = "";
    }
  } catch {}
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const refreshSession = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch("/api/auth", {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          // Aucun utilisateur côté serveur : si un jeton était présent,
          // il est expiré/invalide → on le purge proprement.
          if (getStoredToken()) clearSessionToken();
          setUser(null);
        }
      }
      // Réponse non-OK (ex: 500 temporaire) : on conserve l'état actuel.
    } catch {
      // Erreur réseau : on conserve l'état actuel, pas de déconnexion forcée.
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    // -------------------------------------------------------------------
    // Canal ULTIME : si le jeton de session est présent dans l'URL
    // (?_aoi=... — ajouté par la page de connexion), on l'adopte puis on
    // nettoie l'URL. Ce canal survit à TOUTES les restrictions (cookies,
    // stockages, iframes recréées), car il voyage avec la navigation.
    // -------------------------------------------------------------------
    try {
      const url = new URL(window.location.href);
      let t = url.searchParams.get("_aoi");
      if (!t && url.hash.includes("_aoi=")) {
        t = url.hash.split("_aoi=")[1]?.split("&")[0] || null;
      }
      if (t) {
        storeSessionToken(t);
        url.searchParams.delete("_aoi");
        const cleanHash = url.hash.replace(/#?_aoi=[^&]*&?/, "");
        window.history.replaceState(
          {},
          "",
          url.pathname + (url.search || "") + (cleanHash && cleanHash !== "#" ? cleanHash : "")
        );
      }
    } catch {}

    // -------------------------------------------------------------------
    // Intercepteur global : joint automatiquement le jeton de session à
    // TOUS les appels /api/* (indispensable quand le navigateur bloque
    // les cookies tiers, par ex. dans l'aperçu en iframe ou sur Chrome).
    // Le jeton reste signé HMAC côté serveur : impossible à falsifier.
    // -------------------------------------------------------------------
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
      try {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
            ? input.pathname
            : input.url;
        if (url && (url.startsWith("/api") || url.includes(`${window.location.origin}/api`))) {
          const token = getStoredToken();
          if (token) {
            const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
            if (!headers.has("Authorization")) {
              headers.set("Authorization", `Bearer ${token}`);
            }
            init = { ...init, headers };
          }
        }
      } catch {}
      return originalFetch(input, init);
    };

    // La session est vérifiée côté serveur (cookie OU jeton Authorization).
    refreshSession();

    // Nettoyage de l'ancien stockage local
    try {
      localStorage.removeItem("aoi_user");
    } catch {}

    // Thème
    try {
      const savedTheme = localStorage.getItem("aoi_theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    } catch {}

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("aoi_theme", nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    } catch {}
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        // Stocke le jeton signé sur TOUS les canaux (mémoire + storages).
        if (data.token) {
          storeSessionToken(data.token);
        }
        setUser(data.user);
        // Retourne l'utilisateur + le jeton : la redirection se fait
        // directement, sans aucun aller-retour réseau supplémentaire.
        return { success: true, user: data.user, token: data.token };
      }
      return { success: false, error: data.error || "Identifiants incorrects." };
    } catch {
      return { success: false, error: "Erreur réseau. Réessayez." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {}
    clearSessionToken();
    setUser(null);
  };

  const currentRole = user ? user.role : "visitor";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        role: currentRole,
        authLoading,
        login,
        logout,
        refreshSession,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
