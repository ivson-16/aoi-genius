import { pool } from "@/db";
import { ensureDbInitialized } from "./db-init";

let initialized = false;
async function checkInit() {
  if (!initialized) {
    try {
      await ensureDbInitialized();
      initialized = true;
    } catch (e) {
      console.error("DB init check error:", e);
    }
  }
}

export async function getUsers() {
  await checkInit();
  const res = await pool.query(
    "SELECT id, email, name, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_facebook, social_linkedin, social_twitter, social_github, is_email_verified, created_at FROM users ORDER BY id ASC"
  );
  return res.rows;
}

export async function getUserById(id: number) {
  await checkInit();
  const res = await pool.query(
    "SELECT id, email, name, role, photo, country, city, profession, expertise_domain, bio, whatsapp, social_facebook, social_linkedin, social_twitter, social_github, is_email_verified, created_at FROM users WHERE id = $1",
    [id]
  );
  return res.rows[0] || null;
}

export async function getUserByEmail(email: string) {
  await checkInit();
  const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
  return res.rows[0] || null;
}

export async function getCategories() {
  await checkInit();
  const res = await pool.query(`
    SELECT c.*, COUNT(p.id)::int AS publications_count
    FROM categories c
    LEFT JOIN publications p ON p.category_id = c.id AND p.status = 'approved'
    WHERE c.is_active = true
    GROUP BY c.id
    ORDER BY c.id ASC
  `);
  return res.rows;
}

export async function getPublications(params?: {
  categoryId?: number;
  type?: string;
  search?: string;
  status?: string;
  authorId?: number;
  featuredOnly?: boolean;
  limit?: number;
  sort?: "recent" | "popular" | "views";
}) {
  await checkInit();
  let query = `
    SELECT 
      p.*, 
      c.name AS category_name, 
      c.slug AS category_slug, 
      c.color AS category_color,
      u.name AS author_name,
      u.profession AS author_profession,
      u.photo AS author_photo,
      u.country AS author_country,
      u.city AS author_city,
      (SELECT COUNT(*)::int FROM comments WHERE publication_id = p.id) AS comments_count
    FROM publications p
    LEFT JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.author_id = u.id
    WHERE 1=1
  `;
  const values: any[] = [];
  let idx = 1;

  if (params?.status && params.status !== "all") {
    query += ` AND p.status = $${idx++}`;
    values.push(params.status);
  } else if (!params?.authorId && params?.status !== "all") {
    // By default public queries show only approved publications
    query += ` AND p.status = 'approved'`;
  }

  if (params?.categoryId) {
    query += ` AND p.category_id = $${idx++}`;
    values.push(params.categoryId);
  }

  if (params?.type && params.type !== "all") {
    query += ` AND p.type = $${idx++}`;
    values.push(params.type);
  }

  if (params?.authorId) {
    query += ` AND p.author_id = $${idx++}`;
    values.push(params.authorId);
  }

  if (params?.featuredOnly) {
    query += ` AND p.is_featured = true`;
  }

  if (params?.search) {
    query += ` AND (p.title ILIKE $${idx} OR p.summary ILIKE $${idx} OR p.content ILIKE $${idx} OR u.name ILIKE $${idx} OR c.name ILIKE $${idx})`;
    values.push(`%${params.search}%`);
    idx++;
  }

  if (params?.sort === "popular") {
    query += ` ORDER BY p.likes_count DESC, p.views_count DESC`;
  } else if (params?.sort === "views") {
    query += ` ORDER BY p.views_count DESC`;
  } else {
    query += ` ORDER BY p.created_at DESC`;
  }

  if (params?.limit) {
    query += ` LIMIT $${idx++}`;
    values.push(params.limit);
  }

  const res = await pool.query(query, values);
  return res.rows;
}

export async function getPublicationById(id: number) {
  await checkInit();
  const res = await pool.query(
    `
    SELECT 
      p.*, 
      c.name AS category_name, 
      c.slug AS category_slug, 
      c.color AS category_color,
      u.id AS author_id,
      u.name AS author_name,
      u.profession AS author_profession,
      u.photo AS author_photo,
      u.country AS author_country,
      u.city AS author_city,
      u.bio AS author_bio,
      u.whatsapp AS author_whatsapp,
      u.email AS author_email,
      u.social_linkedin AS author_linkedin,
      u.social_facebook AS author_facebook
    FROM publications p
    LEFT JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.author_id = u.id
    WHERE p.id = $1
  `,
    [id]
  );
  if (res.rows.length === 0) return null;
  const pub = res.rows[0];

  // Fetch comments
  const commentsRes = await pool.query(
    `
    SELECT cm.*, u.name AS user_name, u.photo AS user_photo, u.profession AS user_profession
    FROM comments cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.publication_id = $1
    ORDER BY cm.created_at ASC
  `,
    [id]
  );

  pub.comments = commentsRes.rows;
  return pub;
}

export async function getNews(limit = 10) {
  await checkInit();
  const res = await pool.query("SELECT * FROM news WHERE is_published = true ORDER BY published_at DESC LIMIT $1", [limit]);
  return res.rows;
}

export async function getNotifications(userId: number) {
  await checkInit();
  const res = await pool.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
  return res.rows;
}

export async function getAdminStats() {
  await checkInit();
  const usersCount = (await pool.query("SELECT COUNT(*) FROM users")).rows[0].count;
  const pubsCount = (await pool.query("SELECT COUNT(*) FROM publications")).rows[0].count;
  const approvedCount = (await pool.query("SELECT COUNT(*) FROM publications WHERE status = 'approved'")).rows[0].count;
  const pendingCount = (await pool.query("SELECT COUNT(*) FROM publications WHERE status = 'pending'")).rows[0].count;
  const viewsTotal = (await pool.query("SELECT COALESCE(SUM(views_count), 0) AS total FROM publications")).rows[0].total;
  const likesTotal = (await pool.query("SELECT COALESCE(SUM(likes_count), 0) AS total FROM publications")).rows[0].total;
  const downloadsTotal = (await pool.query("SELECT COALESCE(SUM(downloads_count), 0) AS total FROM publications")).rows[0].total;

  return {
    totalUsers: parseInt(usersCount, 10),
    totalPublications: parseInt(pubsCount, 10),
    approvedPublications: parseInt(approvedCount, 10),
    pendingPublications: parseInt(pendingCount, 10),
    totalViews: parseInt(viewsTotal, 10),
    totalLikes: parseInt(likesTotal, 10),
    totalDownloads: parseInt(downloadsTotal, 10),
  };
}
