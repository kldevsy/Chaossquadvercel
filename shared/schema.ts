import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  banner: text("banner"),
  description: text("description").notNull(),
  roles: text("roles").array().notNull(),
  socialLinks: text("social_links").notNull(), // JSON string
  musicUrl: text("music_url"),
  isActive: boolean("is_active").default(true).notNull(),
  musicalStyles: text("musical_styles").array().notNull(),
  artistTypes: text("artist_types").array().notNull(),
  likesCount: integer("likes_count").default(0),
  userId: text("user_id").references(() => users.id),
});

// Likes table for user likes on artists
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  artistId: integer("artist_id").notNull().references(() => artists.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
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

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error, mention, system
  userId: text("user_id").references(() => users.id), // User who should receive the notification (null = all users)
  targetType: text("target_type").notNull().default("all"), // "all", "specific_user", "artists_only"
  relatedMessageId: integer("related_message_id"), // ID of the chat message that triggered this notification
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: text("created_at").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  likes: many(likes),
  chatMessages: many(chatMessages),
  artistProfile: one(artists, {
    fields: [users.id],
    references: [artists.userId],
  }),
}));

export const artistsRelations = relations(artists, ({ many, one }) => ({
  likes: many(likes),
  user: one(users, {
    fields: [artists.userId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
  artist: one(artists, { fields: [likes.artistId], references: [artists.id] }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const upsertUserSchema = createInsertSchema(users);

export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

// Tracks table for artist productions
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  coverUrl: text("cover_url"),
  duration: integer("duration"), // in seconds
  genre: text("genre"),
  description: text("description"),
  plays: integer("plays").default(0),
  likes: integer("likes").default(0),
  artistId: integer("artist_id").references(() => artists.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  editedAt: true,
  isDeleted: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
