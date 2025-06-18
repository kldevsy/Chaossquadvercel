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
  isActive: boolean("is_active").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;
