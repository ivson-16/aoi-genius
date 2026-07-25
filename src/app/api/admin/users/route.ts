import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const res = await pool.query(
      "SELECT id, email, name, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_facebook, social_linkedin, social_twitter, social_github, is_email_verified FROM users ORDER BY id ASC"
    );
    return NextResponse.json({ users: res.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const {
      name,
      email,
      role,
      photo,
      country,
      city,
      profession,
      expertiseDomain,
      bio,
      whatsapp,
      socialLinkedin,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nom et e-mail requis." }, { status: 400 });
    }

    const defaultPhoto =
      photo ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_linkedin, is_email_verified)
       VALUES ($1, $2, 'secret123', $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
       RETURNING *`,
      [
        name,
        email.toLowerCase(),
        role || "member",
        defaultPhoto,
        country || "Bénin",
        city || "Cotonou",
        profession || "Innovateur & Chercheur",
        expertiseDomain || "Intelligence Artificielle",
        bio || "",
        whatsapp || "",
        socialLinkedin || "",
      ]
    );

    return NextResponse.json({ success: true, user: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const {
      id,
      name,
      email,
      role,
      photo,
      country,
      city,
      profession,
      expertiseDomain,
      bio,
      whatsapp,
      socialLinkedin,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 });
    }

    const res = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           photo = COALESCE($4, photo),
           country = COALESCE($5, country),
           city = COALESCE($6, city),
           profession = COALESCE($7, profession),
           expertise_domain = COALESCE($8, expertise_domain),
           bio = COALESCE($9, bio),
           whatsapp = COALESCE($10, whatsapp),
           social_linkedin = COALESCE($11, social_linkedin),
           updated_at = NOW()
       WHERE id = $12
       RETURNING id, email, name, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_linkedin`,
      [
        name,
        email ? email.toLowerCase() : null,
        role,
        photo,
        country,
        city,
        profession,
        expertiseDomain,
        bio,
        whatsapp,
        socialLinkedin,
        parseInt(id, 10),
      ]
    );

    return NextResponse.json({ success: true, user: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    const userId = parseInt(id, 10);
    const target = await pool.query("SELECT id, role, email FROM users WHERE id = $1", [userId]);
    if (target.rows.length === 0) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    if (target.rows[0].role === "admin") {
      const adminsCount = await pool.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'");
      if ((adminsCount.rows[0]?.count || 0) <= 1) {
        return NextResponse.json(
          { error: "Impossible de supprimer le dernier compte administrateur." },
          { status: 403 }
        );
      }
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
