import { NextResponse } from "next/server";
import { pool } from "@/db";
import { ensureDbInitialized } from "@/lib/db-init";

export async function GET(request: Request) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const domain = searchParams.get("domain");

    let query = `
      SELECT 
        u.id, u.name, u.email, u.role, u.photo, u.country, u.city, 
        u.profession, u.expertise_domain, u.bio, u.whatsapp,
        u.social_facebook, u.social_linkedin, u.social_twitter, u.social_github,
        u.created_at,
        COUNT(p.id)::int AS publications_count
      FROM users u
      LEFT JOIN publications p ON p.author_id = u.id AND p.status = 'approved'
      WHERE u.is_active = true
        AND (u.membership_status = 'approved' OR u.role = 'admin')
    `;
    const params: any[] = [];
    let idx = 1;

    if (search) {
      query += ` AND (u.name ILIKE $${idx} OR u.profession ILIKE $${idx} OR u.city ILIKE $${idx} OR u.country ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    if (domain && domain !== "all") {
      query += ` AND u.expertise_domain ILIKE $${idx}`;
      params.push(`%${domain}%`);
      idx++;
    }

    query += ` GROUP BY u.id ORDER BY publications_count DESC, u.name ASC`;

    const res = await pool.query(query, params);
    return NextResponse.json({ members: res.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
