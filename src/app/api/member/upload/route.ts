import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { pool } from "@/db";
import { ensureDbInitialized } from "@/lib/db-init";

export async function POST(request: Request) {
  try {
    await ensureDbInitialized();
    const form = await request.formData();
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const file = form.get("file");

    const auth = await pool.query(
      `SELECT id,role,membership_status FROM users
       WHERE LOWER(email)=LOWER($1) AND password_hash=$2 AND is_active=true`,
      [email, password]
    );
    const user = auth.rows[0];
    if (!user) return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    if (user.role !== "admin" && user.membership_status !== "approved") {
      return NextResponse.json({ error: "Upload réservé aux membres approuvés." }, { status: 403 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Seules les images et les PDF sont acceptés." }, { status: 400 });
    }
    const max = isPdf ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > max) {
      return NextResponse.json({ error: `Fichier trop lourd. Maximum : ${isPdf ? "25" : "5"} Mo.` }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const ext = path.extname(file.name) || (isPdf ? ".pdf" : ".jpg");
    const base = path.basename(file.name, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) || "fichier";
    const filename = `${Date.now()}-${base}${ext}`;
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur d’upload." }, { status: 500 });
  }
}
