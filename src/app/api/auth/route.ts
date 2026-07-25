import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET(request: Request) {
  await ensureDbInitialized();
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const id = searchParams.get("id");

  if (id) {
    const res = await pool.query("SELECT id, email, name, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_facebook, social_linkedin, social_twitter, social_github, is_email_verified FROM users WHERE id = $1", [id]);
    return NextResponse.json({ user: res.rows[0] || null });
  }

  if (email) {
    const res = await pool.query("SELECT id, email, name, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_facebook, social_linkedin, social_twitter, social_github, is_email_verified FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    return NextResponse.json({ user: res.rows[0] || null });
  }

  // Return default list of sample accounts for instant test switcher
  const res = await pool.query("SELECT id, email, name, role, photo, profession, expertise_domain FROM users ORDER BY id ASC LIMIT 5");
  return NextResponse.json({ users: res.rows });
}

export async function POST(request: Request) {
  await ensureDbInitialized();
  try {
    const body = await request.json();
    const { action, email, password, name, role, profession, expertiseDomain, country, city } = body;

    if (action === "login") {
      const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Aucun compte trouvé avec cette adresse e-mail." }, { status: 401 });
      }
      const user = res.rows[0];
      // For demo flexibility, if user exists we authenticate
      const { password_hash, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    if (action === "register") {
      // Check existing
      const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "Un compte avec cette adresse e-mail existe déjà." }, { status: 400 });
      }

      const photoPlaceholder = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`;

      const insertRes = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, photo, country, city, profession, expertise_domain, bio, is_email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
         RETURNING id, email, name, role, photo, country, city, profession, expertise_domain, bio, is_email_verified`,
        [
          email.toLowerCase(),
          password || "secret123",
          name,
          role || "member",
          photoPlaceholder,
          country || "Bénin",
          city || "Cotonou",
          profession || "Innovateur & Développeur",
          expertiseDomain || "Intelligence Artificielle",
          "Nouveau membre passionné par l'innovation collaborative et les technologies émergentes chez AOI Genius."
        ]
      );

      const newUser = insertRes.rows[0];

      // Add welcome notification
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, link, type)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          newUser.id,
          "Bienvenue chez AOI Genius !",
          "Votre compte membre est vérifié. Vous pouvez maintenant publier vos innovations et collaborer avec la communauté.",
          "/dashboard",
          "success"
        ]
      );

      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === "demo_login") {
      const targetRole = body.targetRole || "member";
      const res = await pool.query("SELECT * FROM users WHERE role = $1 ORDER BY id ASC LIMIT 1", [targetRole]);
      if (res.rows.length > 0) {
        const { password_hash, ...safeUser } = res.rows[0];
        return NextResponse.json({ success: true, user: safeUser });
      }
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de l'authentification" }, { status: 500 });
  }
}
