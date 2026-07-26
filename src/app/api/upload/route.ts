import { NextResponse } from "next/server";
import { requireApprovedMember } from "@/lib/auth";

/** Upload sans disque, compatible avec Vercel. */
export async function POST(request: Request) {
  try {
    const user = await requireApprovedMember();
    if (!user) {
      return NextResponse.json({ error: "Envoi réservé aux membres approuvés." }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Seules les images et les PDF sont acceptés." }, { status: 400 });
    }

    const max = isPdf ? 3 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > max) {
      return NextResponse.json(
        { error: `Fichier trop lourd. Maximum : ${isPdf ? "3 Mo pour un PDF" : "2 Mo pour une image"}.` },
        { status: 400 }
      );
    }

    const mime = isPdf ? "application/pdf" : file.type;
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    return NextResponse.json({ success: true, url: `data:${mime};base64,${base64}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur pendant l’envoi." }, { status: 500 });
  }
}
