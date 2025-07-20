import { 
  users, 
  characters, 
  philosophies, 
  quotes, 
  userCharacters, 
  userPhilosophies, 
  journalEntries, 
  pinnedQuotes, 
  reminders,
  type User, 
  type UpsertUser,
  type Character,
  type Philosophy,
  type Quote,
  type JournalEntry,
  type Reminder,
  type InsertUserCharacter,
  type InsertUserPhilosophy,
  type InsertJournalEntry,
  type InsertReminder,
  type InsertPinnedQuote
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Character operations
  getCharacters(): Promise<Character[]>;
  addUserCharacter(data: InsertUserCharacter): Promise<void>;
  clearUserCharacters(userId: string): Promise<void>;
  
  // Philosophy operations
  getPhilosophies(): Promise<Philosophy[]>;
  addUserPhilosophy(data: InsertUserPhilosophy): Promise<void>;
  clearUserPhilosophies(userId: string): Promise<void>;
  
  // Setup operations
  completeUserSetup(userId: string): Promise<void>;
  
  // Quote operations
  getDailyQuote(userId: string): Promise<Quote | undefined>;
  pinQuote(data: InsertPinnedQuote & { userId: string }): Promise<void>;
  getQuoteSuggestions(userId: string, text: string): Promise<Quote[]>;
  
  // Journal operations
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(data: InsertJournalEntry & { userId: string }): Promise<JournalEntry>;
  
  // Reminder operations
  getReminders(userId: string): Promise<Reminder[]>;
  createReminder(data: InsertReminder & { userId: string }): Promise<Reminder>;
  toggleReminder(userId: string, reminderId: number): Promise<Reminder>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Character operations
  async getCharacters(): Promise<Character[]> {
    return await db.select().from(characters);
  }

  async addUserCharacter(data: InsertUserCharacter): Promise<void> {
    await db.insert(userCharacters).values(data);
  }

  async clearUserCharacters(userId: string): Promise<void> {
    await db.delete(userCharacters).where(eq(userCharacters.userId, userId));
  }

  // Philosophy operations
  async getPhilosophies(): Promise<Philosophy[]> {
    return await db.select().from(philosophies);
  }

  async addUserPhilosophy(data: InsertUserPhilosophy): Promise<void> {
    await db.insert(userPhilosophies).values(data);
  }

  async clearUserPhilosophies(userId: string): Promise<void> {
    await db.delete(userPhilosophies).where(eq(userPhilosophies.userId, userId));
  }

  // Setup operations
  async completeUserSetup(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ setupCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Quote operations
  async getDailyQuote(userId: string): Promise<Quote | undefined> {
    // Get user's selected characters and philosophies
    const userPrefs = await db
      .select({ characterId: userCharacters.characterId, philosophyId: userPhilosophies.philosophyId })
      .from(userCharacters)
      .leftJoin(userPhilosophies, eq(userCharacters.userId, userPhilosophies.userId))
      .where(eq(userCharacters.userId, userId));

    if (userPrefs.length === 0) {
      // Fallback to any quote if no preferences
      const [quote] = await db.select().from(quotes).limit(1);
      return quote;
    }

    const characterIds = userPrefs.map(p => p.characterId).filter((id): id is number => id !== null);
    const philosophyIds = userPrefs.map(p => p.philosophyId).filter((id): id is number => id !== null);

    // Get quote based on user preferences
    const [quote] = await db
      .select()
      .from(quotes)
      .where(
        characterIds.length > 0 
          ? inArray(quotes.characterId, characterIds)
          : philosophyIds.length > 0 
            ? inArray(quotes.philosophyId, philosophyIds)
            : sql`true`
      )
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return quote;
  }

  async getAllQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(quotes.author, quotes.text);
  }

  async pinQuote(data: InsertPinnedQuote & { userId: string }): Promise<void> {
    // Check if quote is already pinned
    const [existingPin] = await db
      .select()
      .from(pinnedQuotes)
      .where(and(
        eq(pinnedQuotes.userId, data.userId),
        eq(pinnedQuotes.quoteId, data.quoteId)
      ));
    
    if (existingPin) {
      throw new Error('Quote is already pinned');
    }
    
    // Insert the pinned quote
    await db.insert(pinnedQuotes).values(data);
    
    // Get the quote details to create a reminder
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, data.quoteId));
    
    if (quote) {
      // Create a reminder for the pinned quote
      await db.insert(reminders).values({
        userId: data.userId,
        title: "Daily Inspiration",
        content: `"${quote.text}" — ${quote.author}`,
        frequency: "daily",
        time: "09:00",
        type: "quote",
        referenceId: quote.id,
        isActive: true,
      });
    }
  }

  async getQuoteSuggestions(userId: string, text: string): Promise<Quote[]> {
    // Simple suggestion based on text keywords
    const keywords = text.toLowerCase().split(' ').filter(word => word.length > 3);
    
    if (keywords.length === 0) {
      return await db.select().from(quotes).limit(3);
    }

    // Get quotes that match keywords in category or text
    const suggestions = await db
      .select()
      .from(quotes)
      .where(
        sql`lower(${quotes.text}) LIKE '%' || ${keywords[0]} || '%' OR 
            lower(${quotes.category}) LIKE '%' || ${keywords[0]} || '%'`
      )
      .limit(3);

    return suggestions;
  }

  // Journal operations
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(sql`${journalEntries.createdAt} DESC`);
  }

  async createJournalEntry(data: InsertJournalEntry & { userId: string }): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values(data)
      .returning();
    return entry;
  }

  // Reminder operations
  async getReminders(userId: string): Promise<Reminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(sql`${reminders.createdAt} DESC`);
  }

  async createReminder(data: InsertReminder & { userId: string }): Promise<Reminder> {
    const [reminder] = await db
      .insert(reminders)
      .values(data)
      .returning();
    return reminder;
  }

  async toggleReminder(userId: string, reminderId: number): Promise<Reminder> {
    const [reminder] = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)));

    if (!reminder) {
      throw new Error('Reminder not found');
    }

    const [updated] = await db
      .update(reminders)
      .set({ isActive: !reminder.isActive })
      .where(eq(reminders.id, reminderId))
      .returning();

    return updated;
  }
}

export const storage = new DatabaseStorage();