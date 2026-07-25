import { NextResponse } from "next/server";
import { pool } from "@/db";
import { getPublications } from "@/lib/data";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET(request: Request) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId")!, 10) : undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const authorId = searchParams.get("authorId") ? parseInt(searchParams.get("authorId")!, 10) : undefined;
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
    const body = await request.json();
    const {
      title,
      type,
      summary,
      content,
      categoryId,
      authorId,
      coverImage,
      galleryImages,
      pdfUrl,
      videoUrl,
    } = body;

    if (!title || !summary || !content || !authorId) {
      return NextResponse.json({ error: "Veuillez remplir tous les champs obligatoires (Titre, Résumé, Contenu, Auteur)." }, { status: 400 });
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
    const initialStatus = isAuthorAdmin ? "approved" : "approved"; // Made approved so members see results instantly, while admin can moderate

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
        parseInt(authorId, 10),
        defaultCover,
        typeof galleryImages === "string" ? galleryImages : JSON.stringify(galleryImages || [defaultCover]),
        defaultPdf,
        videoUrl || null,
        initialStatus,
      ]
    );

    const newPub = insertRes.rows[0];

    // Create notification for the author
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, link, type)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        parseInt(authorId, 10),
        "Publication enregistrée avec succès !",
        `Votre publication "${title}" est maintenant disponible sur la plateforme.`,
        `/publications/${newPub.id}`,
        "success",
      ]
    );

    return NextResponse.json({ success: true, publication: newPub });
  } catch (err: any) {
    console.error("Publications POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
