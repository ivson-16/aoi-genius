import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDbInitialized } from "@/lib/db-init";

export async function PUT(request: Request) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const {
      id,
      name,
      photo,
      country,
      city,
      profession,
      expertiseDomain,
      bio,
      whatsapp,
      socialFacebook,
      socialLinkedin,
      socialTwitter,
      socialGithub,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant utilisateur requis" }, { status: 400 });
    }

    const res = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           photo = COALESCE($2, photo),
           country = COALESCE($3, country),
           city = COALESCE($4, city),
           profession = COALESCE($5, profession),
           expertise_domain = COALESCE($6, expertise_domain),
           bio = COALESCE($7, bio),
           whatsapp = COALESCE($8, whatsapp),
           social_facebook = COALESCE($9, social_facebook),
           social_linkedin = COALESCE($10, social_linkedin),
           social_twitter = COALESCE($11, social_twitter),
           social_github = COALESCE($12, social_github),
           updated_at = NOW()
       WHERE id = $13
       RETURNING id, email, name, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_facebook, social_linkedin, social_twitter, social_github`,
      [
        name,
        photo,
        country,
        city,
        profession,
        expertiseDomain,
        bio,
        whatsapp,
        socialFacebook,
        socialLinkedin,
        socialTwitter,
        socialGithub,
        parseInt(id, 10),
      ]
    );

    return NextResponse.json({ success: true, user: res.rows[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
