import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDbInitialized } from "@/lib/db-init";

/**
 * Upload compatible Vercel : aucun accès au système de fichiers en lecture seule.
 * Le fichier est transformé en data URL, puis enregistré dans PostgreSQL avec
 * le profil ou la publication. Cette approche convient aux photos compressées
 * et aux petits rapports PDF.
 */
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

    // Limites raisonnables pour le stockage PostgreSQL et les fonctions Vercel.
    const max = isPdf ? 3 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > max) {
      return NextResponse.json(
        {
          error: isPdf
            ? "PDF trop lourd. Maximum 3 Mo. Compressez-le ou utilisez un lien externe."
            : "Photo trop lourde. Maximum 2 Mo. Réduisez sa taille puis réessayez.",
        },
        { status: 400 }
      );
    }

    const mime = isPdf ? "application/pdf" : file.type;
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({ success: true, url: dataUrl, kind: isPdf ? "pdf" : "image" });
  } catch (error: any) {
    console.error("Member upload:", error);
    return NextResponse.json({ error: error.message || "Erreur pendant l’envoi." }, { status: 500 });
  }
}
