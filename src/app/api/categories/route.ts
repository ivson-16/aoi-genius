import { NextResponse } from "next/server";
import { pool } from "@/db";
import { getCategories } from "@/lib/data";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET() {
  try {
    await ensureDbInitialized();
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { name, description, icon, color } = body;
    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const res = await pool.query(
      `INSERT INTO categories (name, slug, description, icon, color)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
       RETURNING *`,
      [name, slug, description || "", icon || "Layers", color || "blue"]
    );
    return NextResponse.json({ success: true, category: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
