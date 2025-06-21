import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  description: text("description").notNull(),
  roles: text("roles").array().notNull(),
  socialLinks: text("social_links").notNull(), // JSON string
  musicUrl: text("music_url"),
  isActive: boolean("is_active").default(true).notNull(),
  musicalStyles: text("musical_styles").array().notNull(),
  artistTypes: text("artist_types").array().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cover: text("cover").notNull(),
  description: text("description").notNull(),
  genres: text("genres").array().notNull(),
  collaborators: text("collaborators").array().notNull(), // Artist IDs
  previewUrl: text("preview_url"),
  previewVideoUrl: text("preview_video_url"), // Video preview URL
  status: text("status").notNull().default("em_desenvolvimento"), // em_desenvolvimento, finalizado, lancado
  releaseDate: text("release_date"),
  createdAt: text("created_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
