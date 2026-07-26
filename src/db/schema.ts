import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").default("member").notNull(), // 'member', 'admin'
  isPrimaryAdmin: boolean("is_primary_admin").default(false).notNull(),
  photo: text("photo"),
  country: text("country").default("Bénin"),
  city: text("city").default("Cotonou"),
  profession: text("profession").default("Ingénieur & Chercheur"),
  expertiseDomain: text("expertise_domain").default("Intelligence Artificielle"),
  bio: text("bio"),
  whatsapp: text("whatsapp"),
  socialFacebook: text("social_facebook"),
  socialLinkedin: text("social_linkedin"),
  socialTwitter: text("social_twitter"),
  socialGithub: text("social_github"),
  isEmailVerified: boolean("is_email_verified").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").default("Layers"),
  color: text("color").default("blue"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").default("project").notNull(), // 'article', 'project', 'innovation', 'technical_report'
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  coverImage: text("cover_image"),
  galleryImages: text("gallery_images"), // JSON string array
  pdfUrl: text("pdf_url"),
  status: text("status").default("approved").notNull(), // 'pending', 'approved', 'rejected'
  rejectionReason: text("rejection_reason"),
  viewsCount: integer("views_count").default(0).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  downloadsCount: integer("downloads_count").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  publicationId: integer("publication_id").references(() => publications.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  publicationId: integer("publication_id").references(() => publications.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  tag: text("tag").default("Annonce").notNull(),
  authorName: text("author_name").default("AOI Genius HQ").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  type: text("type").default("info").notNull(), // 'success', 'info', 'warning', 'action'
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  publications: many(publications),
  comments: many(comments),
  likes: many(likes),
  notifications: many(notifications),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  publications: many(publications),
}));

export const publicationsRelations = relations(publications, ({ one, many }) => ({
  author: one(users, {
    fields: [publications.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [publications.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
  likes: many(likes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  publication: one(publications, {
    fields: [comments.publicationId],
    references: [publications.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));
