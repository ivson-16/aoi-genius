"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "visitor" | "member" | "admin";
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
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: "visitor" | "member" | "admin") => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const defaultDemoUsers: Record<"member" | "admin", User> = {
  admin: {
    id: 1,
    email: "Kindeivson@gmail.com",
    name: "Codjo Ivson Oméra KINDE",
    role: "admin",
    photo: "https://media.licdn.com/dms/image/v2/D4E03AQGVLesdyscftg/profile-displayphoto-crop_800_800/B4EZyHj56yIQAI-/0/1771800865941?e=1786579200&v=beta&t=CKeVzltqozaHGOsSUWTZ-CQeDiS057vEi9wxpX5rTG8",
    country: "Bénin",
    city: "Cotonou",
    profession: "Fondateur & Directeur Général AOI Genius",
    expertise_domain: "Energie et Environnement",
    bio: "Électrotechnicien, Énergéticien et fondateur d'AOI Genius avec plus de 2 ans d'expérience.",
    whatsapp: "+229 01 57 363 198",
    social_linkedin: "https://www.linkedin.com/in/ivson-kinde-b271a8377",
  },
  member: {
    id: 2,
    email: "koffi.mensah@aoigenius.org",
    name: "Koffi Mensah",
    role: "member",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    country: "Bénin",
    city: "Cotonou",
    profession: "Ingénieur Systèmes Embarqués & Robotique",
    expertise_domain: "Robotique",
    bio: "Innovateur passionné par les systèmes mécatroniques autonomes et l’agriculture de précision.",
    whatsapp: "+229 97 00 22 33",
    social_linkedin: "https://linkedin.com/in/koffi-mensah",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultDemoUsers.admin);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Load persisted user & theme
    try {
      const savedUser = localStorage.getItem("aoi_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role === "admin" || parsed?.id === 1 || parsed?.email === "admin@aoigenius.org") {
          setUser(defaultDemoUsers.admin);
          localStorage.setItem("aoi_user", JSON.stringify(defaultDemoUsers.admin));
        } else {
          setUser(parsed);
        }
      } else {
        localStorage.setItem("aoi_user", JSON.stringify(defaultDemoUsers.admin));
      }
      const savedTheme = localStorage.getItem("aoi_theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        document.documentElement.classList.add("dark");
      }
    } catch {
      // fallback
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("aoi_theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  };

  const login = async (email: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("aoi_user", JSON.stringify(data.user));
        return true;
      }
    } catch {}
    return false;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("aoi_user");
    } catch {}
  };

  const switchDemoRole = (targetRole: "visitor" | "member" | "admin") => {
    if (targetRole === "visitor") {
      logout();
    } else {
      const selected = defaultDemoUsers[targetRole];
      setUser(selected);
      try {
        localStorage.setItem("aoi_user", JSON.stringify(selected));
      } catch {}
    }
  };

  const currentRole = user ? user.role : "visitor";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: (u) => {
          setUser(u);
          if (u) localStorage.setItem("aoi_user", JSON.stringify(u));
          else localStorage.removeItem("aoi_user");
        },
        role: currentRole,
        login,
        logout,
        switchDemoRole,
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
