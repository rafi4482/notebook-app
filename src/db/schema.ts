import { pgTable, serial, text, timestamp, varchar, integer, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  authId: varchar("auth_id", { length: 255 }).notNull().unique(), // better-auth user ID
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appUsersRelations = relations(appUsers, ({ many }) => ({
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(appUsers, {
    fields: [notes.userId],
    references: [appUsers.id],
  }),
}));
