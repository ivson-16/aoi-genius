import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDbInitialized } from "@/lib/db-init";
import { signToken, getSessionUser, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

const SAFE_FIELDS =
  "id, email, name, role, membership_status, photo, country, city, profession, expertise_domain, bio, whatsapp, social_facebook, social_linkedin, social_twitter, social_github, is_email_verified";

function attachSession(response: NextResponse, userId: number) {
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE, signToken(userId), {
    httpOnly: true,
    // "none" + secure + partitioned : indispensable pour que la session
    // survive dans les iframes d'aperçu (Chrome exige désormais l'attribut
    // Partitioned/CHIPS pour les cookies en contexte tiers).
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    partitioned: isProd,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

/** GET : retourne uniquement l'utilisateur de la session courante. */
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  await ensureDbInitialized();
  try {
    const body = await request.json();
    const { action } = body;

    // ---------- CONNEXION (email + mot de passe vérifié) ----------
    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: "E-mail et mot de passe requis." }, { status: 400 });
      }

      const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true", [email]);
      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
      }

      const user = res.rows[0];
      if (user.password_hash !== password) {
        return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
      }

      const { password_hash, ...safeUser } = user;
      const response = NextResponse.json({ success: true, user: safeUser, token: signToken(user.id) });
      return attachSession(response, user.id);
    }

    // ---------- VÉRIFICATION DIRECTE (sans session, sans cookie) ----------
    // Vérifie email + mot de passe et retourne l'utilisateur.
    // Utilisée par la console admin autonome qui ne dépend d'aucune session.
    if (action === "verify") {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: "E-mail et mot de passe requis." }, { status: 400 });
      }
      const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true", [email]);
      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
      }
      const user = res.rows[0];
      if (user.password_hash !== password) {
        return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
      }
      const { password_hash, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    // ---------- INSCRIPTION (crée toujours un compte MEMBRE) ----------
    if (action === "register") {
      const { email, password, name, profession, expertiseDomain, country, city } = body;
      if (!email || !password || !name) {
        return NextResponse.json({ error: "Nom, e-mail et mot de passe requis." }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
      }

      const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "Un compte avec cette adresse e-mail existe déjà." }, { status: 400 });
      }

      const photoPlaceholder =
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";

      // Sécurité & gouvernance :
      // - le rôle est TOUJOURS "member" à l'inscription publique
      // - l'adhésion est TOUJOURS "pending" : seul l'administrateur peut l'approuver.
      const insertRes = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, membership_status, photo, country, city, profession, expertise_domain, bio, is_email_verified)
         VALUES ($1, $2, $3, 'member', 'pending', $4, $5, $6, $7, $8, $9, true)
         RETURNING ${SAFE_FIELDS}`,
        [
          email.toLowerCase(),
          password,
          name,
          photoPlaceholder,
          country || "Bénin",
          city || "Cotonou",
          profession || "Innovateur & Développeur",
          expertiseDomain || "Intelligence Artificielle",
          "Candidat membre passionné par l'innovation collaborative et les technologies émergentes chez AOI Genius.",
        ]
      );

      const newUser = insertRes.rows[0];

      // Information transparente au candidat
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, link, type)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          newUser.id,
          "Demande d'adhésion reçue",
          "Merci pour votre inscription ! Votre demande d'adhésion est en cours d'examen par l'administration. Vous serez notifié dès qu'elle sera traitée.",
          "/dashboard",
          "info",
        ]
      );

      // Alerte pour chaque administrateur
      const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      for (const adminRow of admins.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, link, type)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            adminRow.id,
            "Nouvelle demande d'adhésion",
            `${name} (${email}) souhaite rejoindre AOI Genius en tant que membre. Examinez sa demande.`,
            "/admin",
            "action",
          ]
        );
      }

      const response = NextResponse.json({ success: true, user: newUser, pending: true, token: signToken(newUser.id) });
      return attachSession(response, newUser.id);
    }

    // ---------- DÉCONNEXION ----------
    if (action === "logout") {
      const isProd = process.env.NODE_ENV === "production";
      const response = NextResponse.json({ success: true });
      response.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        partitioned: isProd,
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Erreur lors de l'authentification" }, { status: 500 });
  }
}
