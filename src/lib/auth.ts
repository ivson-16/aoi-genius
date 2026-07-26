import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { pool } from "@/db";
import { ensureDbInitialized } from "./db-init";

const SECRET = process.env.AUTH_SECRET || "aoi-genius-session-secret-v1-2026";
export const SESSION_COOKIE = "aoi_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

/** Génère un jeton de session signé HMAC : "<userId>.<timestamp>.<signature>" */
export function signToken(userId: number): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/** Vérifie le jeton et retourne l'ID utilisateur, ou null si invalide/falsifié. */
export function verifyToken(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [id, ts, sig] = parts;
    const expected = crypto.createHmac("sha256", SECRET).update(`${id}.${ts}`).digest("hex");
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    // Expiration de session
    const age = Date.now() - parseInt(ts, 10);
    if (isNaN(age) || age > SESSION_MAX_AGE * 1000) return null;

    const userId = parseInt(id, 10);
    return isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
  membership_status: string;
  photo: string | null;
  country: string | null;
  city: string | null;
  profession: string | null;
  expertise_domain: string | null;
  bio: string | null;
  whatsapp: string | null;
  social_facebook: string | null;
  social_linkedin: string | null;
  social_twitter: string | null;
  social_github: string | null;
}

/**
 * Retourne l'utilisateur authentifié (ou null).
 * Le jeton signé est lu depuis le cookie HTTP-only OU, en secours,
 * depuis l'en-tête "Authorization: Bearer ..." (indispensable quand les
 * navigateurs bloquent les cookies tiers dans les iframes d'aperçu).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    await ensureDbInitialized();

    // 1) Cookie HTTP-only (canal principal)
    const cookieStore = await cookies();
    let token = cookieStore.get(SESSION_COOKIE)?.value || null;

    // 2) En-tête Authorization (canal de secours, même jeton signé HMAC)
    if (!token) {
      const hdrs = await headers();
      const authHeader = hdrs.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    // 3) Cookie client-side (dernier recours : mis par le JS quand le HTTP-only
    // est bloqué par l'iframe)
    if (!token) {
      const clientCookie = cookieStore.get("aoi_client_token")?.value;
      if (clientCookie) token = clientCookie;
    }

    if (!token) return null;

    const userId = verifyToken(token);
    if (!userId) return null;

    const res = await pool.query(
      `SELECT id, email, name, role, membership_status, photo, country, city, profession, expertise_domain,
              bio, whatsapp, social_facebook, social_linkedin, social_twitter, social_github
       FROM users WHERE id = $1 AND is_active = true`,
      [userId]
    );
    return res.rows[0] || null;
  } catch {
    return null;
  }
}

/** Exige un utilisateur connecté. */
export async function requireUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

/** Exige un administrateur connecté. */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

/**
 * Exige un MEMBRE APPROUVÉ par l'administrateur (ou un admin).
 * Les comptes en attente d'adhésion n'ont que les droits d'un visiteur.
 */
export async function requireApprovedMember(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.role === "admin") return user;
  if (user.membership_status !== "approved") return null;
  return user;
}
