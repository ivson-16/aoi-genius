import { NextResponse } from "next/server";
import { pool } from "@/db";
import { getPublications } from "@/lib/data";
import { ensureDbInitialized } from "@/lib/db-init";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await ensureDbInitialized();
    const sessionUser = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId")!, 10) : undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;
    let status = searchParams.get("status") || undefined;
    let authorId = searchParams.get("authorId") ? parseInt(searchParams.get("authorId")!, 10) : undefined;

    // Sécurité : seuls les admins voient toutes les publications (y compris en attente).
    // Un membre ne peut voir ses publications non-approuvées que pour lui-même.
    if (status && status !== "approved") {
      const isAdmin = sessionUser?.role === "admin";
      const isOwnContent = sessionUser && authorId === sessionUser.id;
      if (!isAdmin && !isOwnContent) {
        status = "approved";
      }
    }
    const featuredOnly = searchParams.get("featured") === "true";
    const sort = (searchParams.get("sort") as "recent" | "popular" | "views") || "recent";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const pubs = await getPublications({
      categoryId,
      type,
      search,
      status,
      authorId,
      featuredOnly,
      sort,
      limit,
    });

    return NextResponse.json({ publications: pubs });
  } catch (err: any) {
    console.error("Publications GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();

    // Sécurité : seul un MEMBRE APPROUVÉ (ou admin) peut publier.
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour publier. Créez un compte ou connectez-vous." },
        { status: 401 }
      );
    }
    if (sessionUser.role !== "admin" && sessionUser.membership_status !== "approved") {
      return NextResponse.json(
        { error: "Votre adhésion est en attente de validation par l'administrateur. Vous pourrez publier dès qu'elle sera approuvée." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      type,
      summary,
      content,
      categoryId,
      coverImage,
      galleryImages,
      pdfUrl,
      videoUrl,
    } = body;

    // L'auteur est TOUJOURS l'utilisateur de la session (impossible d'usurper).
    const authorId = sessionUser.id;

    if (!title || !summary || !content) {
      return NextResponse.json({ error: "Veuillez remplir tous les champs obligatoires (Titre, Résumé, Contenu)." }, { status: 400 });
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

    const defaultCover =
      coverImage ||
      "https://images.pexels.com/photos/29320998/pexels-photo-29320998.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

    const defaultPdf =
      pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

    // Auto-approve or set pending depending on author role
    const authorRes = await pool.query("SELECT role FROM users WHERE id = $1", [authorId]);
    const isAuthorAdmin = authorRes.rows[0]?.role === "admin";
    // Admin : publié directement. Membre : en attente de validation par l'admin.
    const initialStatus = isAuthorAdmin ? "approved" : "pending";

    const insertRes = await pool.query(
      `INSERT INTO publications 
        (title, slug, type, summary, content, category_id, author_id, cover_image, gallery_images, pdf_url, video_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        title,
        slug,
        type || "project",
        summary,
        content,
        categoryId ? parseInt(categoryId, 10) : 1,
        authorId,
        defaultCover,
        typeof galleryImages === "string" ? galleryImages : JSON.stringify(galleryImages || [defaultCover]),
        defaultPdf,
        videoUrl || null,
        initialStatus,
      ]
    );

    const newPub = insertRes.rows[0];

    // Notification pour l'auteur
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, link, type)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        authorId,
        initialStatus === "approved" ? "Publication en ligne !" : "Publication soumise à validation",
        initialStatus === "approved"
          ? `Votre publication "${title}" est maintenant disponible sur la plateforme.`
          : `Votre publication "${title}" a été soumise. Elle sera visible publiquement après validation par l'administrateur.`,
        `/publications/${newPub.id}`,
        initialStatus === "approved" ? "success" : "info",
      ]
    );

    // Alerte pour les administrateurs si modération requise
    if (initialStatus === "pending") {
      const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      for (const adminRow of admins.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, link, type)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            adminRow.id,
            "Nouvelle publication à modérer",
            `"${title}" par ${sessionUser.name} attend votre validation.`,
            "/admin",
            "action",
          ]
        );
      }
    }

    return NextResponse.json({ success: true, publication: newPub, status: initialStatus });
  } catch (err: any) {
    console.error("Publications POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
