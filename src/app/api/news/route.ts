import { NextResponse } from "next/server";
import { pool } from "@/db";
import { getNews } from "@/lib/data";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const newsList = await getNews(20);
    return NextResponse.json({ news: newsList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();

    // Sécurité : seul un administrateur peut publier des actualités.
    const { requireAdmin } = await import("@/lib/auth");
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Accès refusé. Seul un administrateur peut publier des actualités." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, summary, content, tag, authorName, coverImage } = body;

    if (!title || !summary || !content) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
    const cover = coverImage || "https://images.pexels.com/photos/16544931/pexels-photo-16544931.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

    const res = await pool.query(
      `INSERT INTO news (title, slug, summary, content, cover_image, tag, author_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, slug, summary, content, cover, tag || "Annonce", authorName || "AOI Genius HQ"]
    );

    return NextResponse.json({ success: true, newsItem: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
