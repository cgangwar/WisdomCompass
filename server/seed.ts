import { db } from "./db";
import { characters, philosophies, quotes } from "@shared/schema";

const defaultCharacters = [
  {
    name: "Marcus Aurelius",
    description: "Stoic Emperor",
    category: "philosophy",
    biography: "Roman emperor and philosopher known for his Meditations on Stoic philosophy."
  },
  {
    name: "Buddha",
    description: "Enlightenment",
    category: "spirituality",
    biography: "Founder of Buddhism, known for teachings on mindfulness and the path to enlightenment."
  },
  {
    name: "Socrates",
    description: "Philosopher",
    category: "philosophy",
    biography: "Ancient Greek philosopher known for his method of questioning and pursuit of wisdom."
  },
  {
    name: "Rumi",
    description: "Mystic Poet",
    category: "spirituality",
    biography: "13th-century Persian poet and mystic known for his spiritual poetry and teachings on love."
  },
  {
    name: "Viktor Frankl",
    description: "Logotherapist",
    category: "psychology",
    biography: "Holocaust survivor and psychologist who developed logotherapy and wrote 'Man's Search for Meaning'."
  },
  {
    name: "Maya Angelou",
    description: "Poet & Activist",
    category: "literature",
    biography: "American poet, memoirist, and civil rights activist known for her autobiographical works."
  }
];

const defaultPhilosophies = [
  {
    name: "Stoicism",
    description: "Philosophy emphasizing virtue, wisdom, and emotional resilience through acceptance of what we cannot control."
  },
  {
    name: "Buddhism",
    description: "Ancient teaching focused on mindfulness, compassion, and liberation from suffering through the Eightfold Path."
  },
  {
    name: "Existentialism",
    description: "Philosophy emphasizing individual existence, freedom, and choice in creating meaning and purpose."
  },
  {
    name: "Vedanta",
    description: "Hindu philosophical tradition exploring the nature of reality, consciousness, and the self."
  },
  {
    name: "Taoism",
    description: "Chinese philosophy emphasizing harmony with the natural order and the principle of wu wei (non-action)."
  },
  {
    name: "Humanism",
    description: "Philosophy emphasizing human dignity, worth, and the potential for human flourishing and ethical living."
  }
];

const defaultQuotes = [
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    characterId: 1,
    philosophyId: 1,
    category: "mindset"
  },
  {
    text: "What we think, we become.",
    author: "Buddha",
    characterId: 2,
    philosophyId: 2,
    category: "consciousness"
  },
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    characterId: 3,
    philosophyId: null,
    category: "wisdom"
  },
  {
    text: "Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.",
    author: "Rumi",
    characterId: 4,
    philosophyId: null,
    category: "passion"
  },
  {
    text: "Everything can be taken from a man but one thing: the last of human freedoms - to choose one's attitude in any given set of circumstances.",
    author: "Viktor Frankl",
    characterId: 5,
    philosophyId: 3,
    category: "freedom"
  },
  {
    text: "If you don't like something, change it. If you can't change it, change your attitude.",
    author: "Maya Angelou",
    characterId: 6,
    philosophyId: null,
    category: "empowerment"
  },
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    characterId: 1,
    philosophyId: 1,
    category: "control"
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    characterId: 2,
    philosophyId: 2,
    category: "peace"
  },
  {
    text: "The way is not in the sky. The way is in the heart.",
    author: "Buddha",
    characterId: 2,
    philosophyId: 2,
    category: "wisdom"
  },
  {
    text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi",
    characterId: 4,
    philosophyId: null,
    category: "growth"
  }
];

export async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Check if data already exists
    const existingCharacters = await db.select().from(characters).limit(1);
    if (existingCharacters.length > 0) {
      console.log('Database already seeded');
      return;
    }

    // Insert characters
    console.log('Inserting characters...');
    await db.insert(characters).values(defaultCharacters);

    // Insert philosophies
    console.log('Inserting philosophies...');
    await db.insert(philosophies).values(defaultPhilosophies);

    // Insert quotes
    console.log('Inserting quotes...');
    await db.insert(quotes).values(defaultQuotes);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}