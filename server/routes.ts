import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { seedDatabase } from "./seed";
import { 
  insertUserCharacterSchema,
  insertUserPhilosophySchema,
  insertJournalEntrySchema,
  insertReminderSchema,
  insertPinnedQuoteSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed database with initial content
  await seedDatabase();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Setup routes
  app.get('/api/characters', async (req, res) => {
    try {
      const characters = await storage.getCharacters();
      res.json(characters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.get('/api/philosophies', async (req, res) => {
    try {
      const philosophies = await storage.getPhilosophies();
      res.json(philosophies);
    } catch (error) {
      console.error("Error fetching philosophies:", error);
      res.status(500).json({ message: "Failed to fetch philosophies" });
    }
  });

  app.post('/api/setup/characters', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { characterIds } = req.body;
      
      if (!Array.isArray(characterIds)) {
        return res.status(400).json({ message: "Character IDs must be an array" });
      }

      await storage.clearUserCharacters(userId);
      for (const characterId of characterIds) {
        await storage.addUserCharacter({ userId, characterId });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving user characters:", error);
      res.status(500).json({ message: "Failed to save character selection" });
    }
  });

  app.post('/api/setup/philosophies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { philosophyIds } = req.body;
      
      if (!Array.isArray(philosophyIds)) {
        return res.status(400).json({ message: "Philosophy IDs must be an array" });
      }

      await storage.clearUserPhilosophies(userId);
      for (const philosophyId of philosophyIds) {
        await storage.addUserPhilosophy({ userId, philosophyId });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving user philosophies:", error);
      res.status(500).json({ message: "Failed to save philosophy selection" });
    }
  });

  app.post('/api/setup/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.completeUserSetup(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing setup:", error);
      res.status(500).json({ message: "Failed to complete setup" });
    }
  });

  // Quote routes
  app.get('/api/quotes/daily', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quote = await storage.getDailyQuote(userId);
      res.json(quote);
    } catch (error) {
      console.error("Error fetching daily quote:", error);
      res.status(500).json({ message: "Failed to fetch daily quote" });
    }
  });

  app.post('/api/quotes/:id/pin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quoteId = parseInt(req.params.id);
      
      const validation = insertPinnedQuoteSchema.safeParse({ quoteId });
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }

      await storage.pinQuote({ userId, quoteId });
      res.json({ success: true });
    } catch (error) {
      console.error("Error pinning quote:", error);
      res.status(500).json({ message: "Failed to pin quote" });
    }
  });

  // Journal routes
  app.get('/api/journal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post('/api/journal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertJournalEntrySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid journal entry data" });
      }

      const entry = await storage.createJournalEntry({
        ...validation.data,
        userId,
      });
      
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.get('/api/quotes/suggestions/:text', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const text = req.params.text;
      const suggestions = await storage.getQuoteSuggestions(userId, text);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching quote suggestions:", error);
      res.status(500).json({ message: "Failed to fetch quote suggestions" });
    }
  });

  // Reminder routes
  app.get('/api/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminders = await storage.getReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post('/api/reminders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertReminderSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid reminder data" });
      }

      const reminder = await storage.createReminder({
        ...validation.data,
        userId,
      });
      
      res.json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.patch('/api/reminders/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminderId = parseInt(req.params.id);
      
      const reminder = await storage.toggleReminder(userId, reminderId);
      res.json(reminder);
    } catch (error) {
      console.error("Error toggling reminder:", error);
      res.status(500).json({ message: "Failed to toggle reminder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
