import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDbInitialized } from "@/lib/db-init";

async function authenticate(email: string, password: string) {
  const result = await pool.query(
    `SELECT id, email, name, role, membership_status, photo, country, city,
            profession, expertise_domain, bio, whatsapp, social_facebook,
            social_linkedin, social_twitter, social_github
     FROM users
     WHERE LOWER(email) = LOWER($1) AND password_hash = $2 AND is_active = true`,
    [email, password]
  );
  return result.rows[0] || null;
}

function approved(user: any) {
  return user?.role === "admin" || user?.membership_status === "approved";
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { email, password, op, payload } = body;
    const user = await authenticate(email, password);

    if (!user) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    if (op === "load") {
      const [pubs, notifications] = await Promise.all([
        pool.query(
          `SELECT p.*, c.name AS category_name,
                  (SELECT COUNT(*)::int FROM comments WHERE publication_id = p.id) AS comments_count
           FROM publications p
           LEFT JOIN categories c ON c.id = p.category_id
           WHERE p.author_id = $1
           ORDER BY p.created_at DESC`,
          [user.id]
        ),
        pool.query(
          "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
          [user.id]
        ),
      ]);
      const categories = await pool.query("SELECT * FROM categories WHERE is_active = true ORDER BY id");
      return NextResponse.json({
        success: true,
        user,
        approved: approved(user),
        publications: pubs.rows,
        notifications: notifications.rows,
        categories: categories.rows,
      });
    }

    if (!approved(user)) {
      return NextResponse.json(
        {
          error:
            user.membership_status === "rejected"
              ? "Votre demande d’adhésion n’a pas été retenue. Contactez l’administration pour plus d’informations."
              : "Votre adhésion attend encore l’approbation de l’administrateur.",
          membershipStatus: user.membership_status,
        },
        { status: 403 }
      );
    }

    if (op === "createPublication") {
      const { title, type, summary, content, categoryId, coverImage, pdfUrl, videoUrl } = payload || {};
      if (!title || !summary || !content) {
        return NextResponse.json({ error: "Titre, résumé et contenu sont obligatoires." }, { status: 400 });
      }
      const slug =
        title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
        "-" + Date.now().toString().slice(-6);
      const status = user.role === "admin" ? "approved" : "pending";
      const cover =
        coverImage ||
        "https://images.pexels.com/photos/29320998/pexels-photo-29320998.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
      const result = await pool.query(
        `INSERT INTO publications
          (title, slug, type, summary, content, category_id, author_id, cover_image,
           gallery_images, pdf_url, video_url, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          title,
          slug,
          type || "project",
          summary,
          content,
          categoryId ? parseInt(categoryId, 10) : 1,
          user.id,
          cover,
          JSON.stringify([cover]),
          pdfUrl || null,
          videoUrl || null,
          status,
        ]
      );
      if (status === "pending") {
        const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        for (const row of admins.rows) {
          await pool.query(
            `INSERT INTO notifications (user_id,title,message,link,type)
             VALUES ($1,$2,$3,$4,$5)`,
            [row.id, "Nouvelle publication à modérer", `« ${title} » par ${user.name} attend votre validation.`, "/admin", "action"]
          );
        }
      }
      return NextResponse.json({ success: true, publication: result.rows[0], status });
    }

    if (op === "deletePublication") {
      const id = parseInt(payload?.id, 10);
      const result = await pool.query(
        "DELETE FROM publications WHERE id = $1 AND author_id = $2 RETURNING id",
        [id, user.id]
      );
      if (!result.rows.length) {
        return NextResponse.json({ error: "Publication introuvable ou non autorisée." }, { status: 403 });
      }
      return NextResponse.json({ success: true });
    }

    if (op === "updateProfile") {
      const p = payload || {};
      const result = await pool.query(
        `UPDATE users SET
           name=COALESCE($1,name), photo=COALESCE($2,photo), country=COALESCE($3,country),
           city=COALESCE($4,city), profession=COALESCE($5,profession),
           expertise_domain=COALESCE($6,expertise_domain), bio=COALESCE($7,bio),
           whatsapp=COALESCE($8,whatsapp), updated_at=NOW()
         WHERE id=$9
         RETURNING id,email,name,role,membership_status,photo,country,city,profession,
                   expertise_domain,bio,whatsapp`,
        [p.name, p.photo, p.country, p.city, p.profession, p.expertiseDomain, p.bio, p.whatsapp, user.id]
      );
      return NextResponse.json({ success: true, user: result.rows[0] });
    }

    if (op === "markNotifications") {
      await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1", [user.id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Opération inconnue." }, { status: 400 });
  } catch (error: any) {
    console.error("Member direct API:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur." }, { status: 500 });
  }
}
