import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDbInitialized } from "@/lib/db-init";

/**
 * API admin AUTONOME : chaque requête envoie email + mot de passe.
 * Aucune dépendance à un cookie, à un jeton, à une session partagée.
 * L'authentification est ré-évaluée à chaque appel, ce qui garantit
 * qu'aucun blocage de navigateur (iframe, cache, etc.) ne peut casser l'accès.
 */
async function checkAdmin(email: string, password: string) {
  const r = await pool.query(
    "SELECT id, name, role FROM users WHERE LOWER(email) = LOWER($1) AND password_hash = $2 AND is_active = true",
    [email, password]
  );
  if (r.rows.length === 0 || r.rows[0].role !== "admin") return null;
  return r.rows[0];
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { email, password, op, payload } = body as {
      email: string;
      password: string;
      op: string;
      payload?: any;
    };

    const admin = await checkAdmin(email, password);
    if (!admin) {
      return NextResponse.json({ error: "Identifiants administrateur invalides." }, { status: 401 });
    }

    // ----- Lecture des données ----------------------------------------------
    if (op === "load") {
      const [usersRes, pubsRes, catsRes, newsRes] = await Promise.all([
        pool.query(
          "SELECT id, email, name, role, membership_status, photo, country, city, profession, expertise_domain, bio, whatsapp, created_at FROM users ORDER BY (membership_status = 'pending') DESC, id ASC"
        ),
        pool.query(
          `SELECT p.*, c.name AS category_name, u.name AS author_name
           FROM publications p
           LEFT JOIN categories c ON p.category_id = c.id
           JOIN users u ON u.id = p.author_id
           ORDER BY p.created_at DESC`
        ),
        pool.query("SELECT * FROM categories ORDER BY id ASC"),
        pool.query("SELECT * FROM news ORDER BY published_at DESC LIMIT 20"),
      ]);

      return NextResponse.json({
        admin,
        users: usersRes.rows,
        publications: pubsRes.rows,
        categories: catsRes.rows,
        news: newsRes.rows,
      });
    }

    // ----- Approbation / refus d'adhésion -----------------------------------
    if (op === "membership") {
      const { id, decision } = payload || {};
      if (!id || !["approved", "rejected"].includes(decision)) {
        return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
      }
      await pool.query(
        "UPDATE users SET membership_status = $1, updated_at = NOW() WHERE id = $2 AND role != 'admin'",
        [decision, parseInt(id, 10)]
      );
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, link, type) VALUES ($1, $2, $3, $4, $5)`,
        [
          parseInt(id, 10),
          decision === "approved" ? "Adhésion approuvée ! 🎉" : "Décision sur votre adhésion",
          decision === "approved"
            ? "Félicitations ! Votre adhésion à AOI Genius a été approuvée par l'administration."
            : "Après examen, votre demande d'adhésion n'a pas été retenue pour le moment.",
          decision === "approved" ? "/dashboard" : "/contact",
          decision === "approved" ? "success" : "warning",
        ]
      );
      return NextResponse.json({ success: true });
    }

    // ----- Modération d'une publication -------------------------------------
    if (op === "moderate") {
      const { id, status } = payload || {};
      if (!id || !["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
      }
      const r = await pool.query(
        "UPDATE publications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING author_id, title",
        [status, parseInt(id, 10)]
      );
      if (r.rows[0]) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, link, type) VALUES ($1, $2, $3, $4, $5)`,
          [
            r.rows[0].author_id,
            status === "approved" ? "Publication approuvée !" : "Publication refusée",
            `Votre publication "${r.rows[0].title}" a été ${status === "approved" ? "approuvée" : "refusée"} par la modération.`,
            `/publications/${id}`,
            status === "approved" ? "success" : "warning",
          ]
        );
      }
      return NextResponse.json({ success: true });
    }

    // ----- Suppression d'une publication ------------------------------------
    if (op === "deletePub") {
      const { id } = payload || {};
      await pool.query("DELETE FROM publications WHERE id = $1", [parseInt(id, 10)]);
      return NextResponse.json({ success: true });
    }

    // ----- Suppression d'un membre (jamais un admin) ------------------------
    if (op === "deleteUser") {
      const { id } = payload || {};
      const target = await pool.query("SELECT role FROM users WHERE id = $1", [parseInt(id, 10)]);
      if (target.rows[0]?.role === "admin") {
        return NextResponse.json({ error: "Impossible de supprimer un administrateur." }, { status: 403 });
      }
      await pool.query("DELETE FROM users WHERE id = $1", [parseInt(id, 10)]);
      return NextResponse.json({ success: true });
    }

    // ----- Ajout d'une catégorie --------------------------------------------
    if (op === "addCategory") {
      const { name, description } = payload || {};
      if (!name?.trim()) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await pool.query(
        `INSERT INTO categories (name, slug, description, icon, color) VALUES ($1, $2, $3, 'Layers', 'blue')
         ON CONFLICT (slug) DO NOTHING`,
        [name.trim(), slug, description || ""]
      );
      return NextResponse.json({ success: true });
    }

    // ----- Publication d'une actualité --------------------------------------
    if (op === "addNews") {
      const { title, summary, content, tag, coverImage } = payload || {};
      if (!title || !summary || !content) {
        return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
      }
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
      await pool.query(
        `INSERT INTO news (title, slug, summary, content, cover_image, tag, author_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          title,
          slug,
          summary,
          content,
          coverImage || "https://images.pexels.com/photos/16544931/pexels-photo-16544931.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          tag || "Annonce",
          admin.name,
        ]
      );
      return NextResponse.json({ success: true });
    }

    // ----- Mise à jour du profil admin --------------------------------------
    if (op === "updateProfile") {
      const { name, photo, country, city, profession, expertiseDomain, bio, whatsapp } = payload || {};
      await pool.query(
        `UPDATE users
         SET name = COALESCE($1, name), photo = COALESCE($2, photo),
             country = COALESCE($3, country), city = COALESCE($4, city),
             profession = COALESCE($5, profession),
             expertise_domain = COALESCE($6, expertise_domain),
             bio = COALESCE($7, bio), whatsapp = COALESCE($8, whatsapp),
             updated_at = NOW()
         WHERE id = $9`,
        [name, photo, country, city, profession, expertiseDomain, bio, whatsapp, admin.id]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Opération inconnue." }, { status: 400 });
  } catch (err: any) {
    console.error("Admin direct API error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur." }, { status: 500 });
  }
}
