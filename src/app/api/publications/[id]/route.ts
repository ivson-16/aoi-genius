import { NextResponse } from "next/server";
import { pool } from "@/db";
import { getPublicationById } from "@/lib/data";
import { ensureDbInitialized } from "@/lib/db-init";
import { getSessionUser } from "@/lib/auth";

const UNAUTHORIZED = () =>
  NextResponse.json({ error: "Vous devez être connecté pour effectuer cette action." }, { status: 401 });

const FORBIDDEN = () =>
  NextResponse.json({ error: "Accès refusé. Vous n'avez pas les privilèges nécessaires." }, { status: 403 });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;
    const pubId = parseInt(id, 10);
    if (isNaN(pubId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Increment views count
    await pool.query("UPDATE publications SET views_count = views_count + 1 WHERE id = $1", [pubId]);

    const publication = await getPublicationById(pubId);
    if (!publication) {
      return NextResponse.json({ error: "Publication non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ publication });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const sessionUser = await getSessionUser();
    if (!sessionUser) return UNAUTHORIZED();

    const { id } = await params;
    const pubId = parseInt(id, 10);
    const body = await request.json();

    const { action, status, rejectionReason, title, summary, content, categoryId, coverImage, pdfUrl, videoUrl } = body;

    // Vérification de propriété : auteur ou admin uniquement
    const pubCheck = await pool.query("SELECT author_id FROM publications WHERE id = $1", [pubId]);
    if (pubCheck.rows.length === 0) {
      return NextResponse.json({ error: "Publication non trouvée" }, { status: 404 });
    }
    const isOwner = pubCheck.rows[0].author_id === sessionUser.id;
    const isAdmin = sessionUser.role === "admin";

    // Admin moderation action
    if (action === "moderate") {
      if (!isAdmin) return FORBIDDEN();
      const res = await pool.query(
        "UPDATE publications SET status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
        [status, rejectionReason || null, pubId]
      );
      if (res.rows.length === 0) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
      
      const pub = res.rows[0];
      // Notify author
      await pool.query(
        "INSERT INTO notifications (user_id, title, message, link, type) VALUES ($1, $2, $3, $4, $5)",
        [
          pub.author_id,
          status === "approved" ? "Publication approuvée !" : "Mise à jour de publication",
          status === "approved"
            ? `Votre publication "${pub.title}" a été approuvée par la modération.`
            : `Votre publication "${pub.title}" a été refusée: ${rejectionReason || "Critères non respectés"}`,
          `/publications/${pubId}`,
          status === "approved" ? "success" : "warning",
        ]
      );

      return NextResponse.json({ success: true, publication: pub });
    }

    // General update : auteur ou admin uniquement
    if (!isOwner && !isAdmin) return FORBIDDEN();

    const updateRes = await pool.query(
      `UPDATE publications 
       SET title = COALESCE($1, title), 
           summary = COALESCE($2, summary),
           content = COALESCE($3, content),
           category_id = COALESCE($4, category_id),
           cover_image = COALESCE($5, cover_image),
           pdf_url = COALESCE($6, pdf_url),
           video_url = COALESCE($7, video_url),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, summary, content, categoryId ? parseInt(categoryId, 10) : null, coverImage, pdfUrl, videoUrl, pubId]
    );

    return NextResponse.json({ success: true, publication: updateRes.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const { id } = await params;
    const pubId = parseInt(id, 10);
    const body = await request.json();
    const { action, content } = body;

    // Le téléchargement (compteur) reste public
    if (action === "download") {
      await pool.query("UPDATE publications SET downloads_count = downloads_count + 1 WHERE id = $1", [pubId]);
      return NextResponse.json({ success: true });
    }

    // Like et commentaire : réservés aux MEMBRES APPROUVÉS (ou admin).
    // L'identité vient de la session serveur — impossible d'usurper un autre membre.
    const sessionUser = await getSessionUser();
    if (!sessionUser) return UNAUTHORIZED();
    if (sessionUser.role !== "admin" && sessionUser.membership_status !== "approved") {
      return NextResponse.json(
        { error: "Votre adhésion est en attente de validation. Vous pourrez interagir dès qu'elle sera approuvée par l'administrateur." },
        { status: 403 }
      );
    }
    const userId = sessionUser.id;

    if (action === "like") {
      const existing = await pool.query("SELECT id FROM likes WHERE publication_id = $1 AND user_id = $2", [pubId, userId]);
      let liked = false;
      if (existing.rows.length > 0) {
        await pool.query("DELETE FROM likes WHERE publication_id = $1 AND user_id = $2", [pubId, userId]);
        await pool.query("UPDATE publications SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1", [pubId]);
        liked = false;
      } else {
        await pool.query("INSERT INTO likes (publication_id, user_id) VALUES ($1, $2)", [pubId, userId]);
        await pool.query("UPDATE publications SET likes_count = likes_count + 1 WHERE id = $1", [pubId]);
        liked = true;
      }
      const updated = await pool.query("SELECT likes_count FROM publications WHERE id = $1", [pubId]);
      return NextResponse.json({ success: true, liked, likesCount: updated.rows[0]?.likes_count || 0 });
    }

    if (action === "comment") {
      if (!content) {
        return NextResponse.json({ error: "Le commentaire ne peut pas être vide." }, { status: 400 });
      }
      const commentRes = await pool.query(
        `INSERT INTO comments (publication_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [pubId, userId, content]
      );

      const pubAuthor = await pool.query("SELECT author_id, title FROM publications WHERE id = $1", [pubId]);
      if (pubAuthor.rows.length > 0 && pubAuthor.rows[0].author_id !== userId) {
        await pool.query(
          "INSERT INTO notifications (user_id, title, message, link, type) VALUES ($1, $2, $3, $4, $5)",
          [
            pubAuthor.rows[0].author_id,
            "Nouveau commentaire reçu",
            `${sessionUser.name} a commenté votre publication "${pubAuthor.rows[0].title}".`,
            `/publications/${pubId}`,
            "info"
          ]
        );
      }

      return NextResponse.json({ success: true, comment: commentRes.rows[0] });
    }

    return NextResponse.json({ error: "Action non valide" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();

    // Sécurité : seul l'auteur ou un admin peut supprimer.
    const sessionUser = await getSessionUser();
    if (!sessionUser) return UNAUTHORIZED();

    const { id } = await params;
    const pubId = parseInt(id, 10);

    const pubCheck = await pool.query("SELECT author_id FROM publications WHERE id = $1", [pubId]);
    if (pubCheck.rows.length === 0) {
      return NextResponse.json({ error: "Publication non trouvée" }, { status: 404 });
    }

    const isOwner = pubCheck.rows[0].author_id === sessionUser.id;
    const isAdmin = sessionUser.role === "admin";
    if (!isOwner && !isAdmin) return FORBIDDEN();

    await pool.query("DELETE FROM publications WHERE id = $1", [pubId]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
