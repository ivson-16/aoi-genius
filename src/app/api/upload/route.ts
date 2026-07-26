import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo
const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25 Mo

export async function POST(request: Request) {
  try {
    // Sécurité : seul un membre approuvé (ou admin) peut envoyer des fichiers.
    const { requireApprovedMember } = await import("@/lib/auth");
    const sessionUser = await requireApprovedMember();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Envoi réservé aux membres approuvés par l'administration." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Seules les images et les documents PDF sont acceptés." }, { status: 400 });
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image trop lourde. Taille maximale : 5 Mo." }, { status: 400 });
    }

    if (isPdf && file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: "PDF trop lourd. Taille maximale : 25 Mo." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const extension = path.extname(file.name) || (isPdf ? ".pdf" : ".jpg");
    const safeBaseName = path
      .basename(file.name, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 50);

    const filename = `${Date.now()}-${safeBaseName || (isPdf ? "document" : "image")}${extension}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
      kind: isPdf ? "pdf" : "image",
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Erreur pendant l'upload." }, { status: 500 });
  }
}
