import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  setupCompleted: boolean("setup_completed").default(false),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  biography: text("biography"),
});

export const philosophies = pgTable("philosophies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  author: text("author").notNull(),
  characterId: integer("character_id").references(() => characters.id),
  philosophyId: integer("philosophy_id").references(() => philosophies.id),
  category: text("category"),
});

export const userCharacters = pgTable("user_characters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  selectedAt: timestamp("selected_at").defaultNow(),
});

export const userPhilosophies = pgTable("user_philosophies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  philosophyId: integer("philosophy_id").references(() => philosophies.id).notNull(),
  selectedAt: timestamp("selected_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  text: text("text").notNull(),
  quoteId: integer("quote_id").references(() => quotes.id),
  createdAt: timestamp("created_at").defaultNow(),
  isPinned: boolean("is_pinned").default(false),
});

export const pinnedQuotes = pgTable("pinned_quotes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  quoteId: integer("quote_id").references(() => quotes.id).notNull(),
  pinnedAt: timestamp("pinned_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly'
  time: text("time").notNull(), // HH:MM format
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  type: text("type").notNull(), // 'quote', 'journal', 'goal'
  referenceId: integer("reference_id"), // ID of the referenced item
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type Philosophy = typeof philosophies.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type PinnedQuote = typeof pinnedQuotes.$inferSelect;

// Insert schemas
export const insertUserCharacterSchema = createInsertSchema(userCharacters);
export const insertUserPhilosophySchema = createInsertSchema(userPhilosophies);
export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  text: true,
  quoteId: true,
});
export const insertReminderSchema = createInsertSchema(reminders).pick({
  title: true,
  content: true,
  frequency: true,
  time: true,
  type: true,
  referenceId: true,
});
export const insertPinnedQuoteSchema = createInsertSchema(pinnedQuotes).pick({
  quoteId: true,
});

export type InsertUserCharacter = z.infer<typeof insertUserCharacterSchema>;
export type InsertUserPhilosophy = z.infer<typeof insertUserPhilosophySchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type InsertPinnedQuote = z.infer<typeof insertPinnedQuoteSchema>;
