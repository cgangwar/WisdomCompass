import { db } from "./db";
import { characters, philosophies, quotes } from "@shared/schema";

const defaultCharacters = [
  // Ancient Western Philosophers
  {
    name: "Marcus Aurelius",
    description: "Stoic Emperor",
    category: "philosophy",
    biography: "Roman emperor and philosopher (121-180 CE) known for his 'Meditations', embodying the Stoic ideal of the philosopher-king."
  },
  {
    name: "Socrates",
    description: "Father of Western Philosophy",
    category: "philosophy",
    biography: "Ancient Greek philosopher (470-399 BCE) who established critical thinking as the foundation for truth-seeking through dialectical method."
  },
  
  // Eastern Spiritual Masters
  {
    name: "Buddha (Siddhartha Gautama)",
    description: "The Awakened One",
    category: "spirituality",
    biography: "Founder of Buddhism (563-483 BCE), taught the Middle Way and the Four Noble Truths for liberation from suffering."
  },
  {
    name: "Lao Tzu",
    description: "Father of Taoism",
    category: "spirituality",
    biography: "Ancient Chinese philosopher (6th century BCE) who founded Taoism, emphasizing natural harmony and wu wei (effortless action)."
  },
  {
    name: "Confucius",
    description: "Great Teacher",
    category: "philosophy",
    biography: "Chinese philosopher (551-479 BCE) whose teachings on ethics, morality, and social harmony shaped East Asian culture for millennia."
  },
  
  // Persian Mystic Poets
  {
    name: "Rumi",
    description: "Mystic Poet of Divine Love",
    category: "spirituality",
    biography: "13th-century Persian mystic poet whose verses on divine love and spiritual union remain globally influential across cultures."
  },
  {
    name: "Hafez",
    description: "The Tongue of the Invisible",
    category: "spirituality",
    biography: "14th-century Persian Sufi poet whose ghazals beautifully interweave earthly love with mystical spiritual truths."
  },
  {
    name: "Ibn Arabi",
    description: "The Greatest Master",
    category: "spirituality",
    biography: "13th-century Andalusian mystic philosopher who developed the doctrine of Unity of Being, influencing both Islamic and Western mysticism."
  },
  
  // American Transcendentalists
  {
    name: "Ralph Waldo Emerson",
    description: "Sage of Concord",
    category: "philosophy",
    biography: "American transcendentalist philosopher (1803-1882) who emphasized self-reliance, individualism, and the inherent divinity of nature."
  },
  {
    name: "Henry David Thoreau",
    description: "Nature's Prophet",
    category: "philosophy",
    biography: "American philosopher and naturalist (1817-1862) whose 'Walden' inspired environmentalism and civil disobedience movements."
  },
  
  // Indian Spiritual Teachers
  {
    name: "Sadhguru",
    description: "Modern Mystic",
    category: "contemporary",
    biography: "Contemporary Indian guru and founder of Isha Foundation, bringing ancient yogic wisdom to global audiences through practical spirituality."
  },
  {
    name: "Jiddu Krishnamurti",
    description: "World Teacher",
    category: "contemporary",
    biography: "20th-century philosopher (1895-1986) who emphasized individual inquiry, freedom from conditioning, and direct perception of truth."
  },
  
  // Contemporary Spiritual Teachers
  {
    name: "Eckhart Tolle",
    description: "Teacher of Presence",
    category: "contemporary",
    biography: "German-born spiritual teacher known for 'The Power of Now', bridging ancient wisdom with modern consciousness awakening."
  },
  {
    name: "Joe Dispenza",
    description: "Science of Transformation",
    category: "contemporary",
    biography: "American neuroscientist and author who combines quantum physics, neuroscience, and ancient wisdom to explain human potential."
  },
  {
    name: "Alan Watts",
    description: "Bridge Between East and West",
    category: "contemporary",
    biography: "British philosopher (1915-1973) who popularized Eastern philosophy for Western audiences, making Zen and Taoism accessible."
  },
  
  // Buddhist Masters
  {
    name: "Thich Nhat Hanh",
    description: "Father of Mindfulness",
    category: "contemporary",
    biography: "Vietnamese Zen master (1926-2022) who brought mindfulness to the West and pioneered engaged Buddhism for social change."
  },
  {
    name: "Dalai Lama",
    description: "Ocean of Wisdom",
    category: "contemporary",
    biography: "14th Dalai Lama, Nobel Peace Prize laureate advocating compassion, non-violence, and the integration of science with spirituality."
  },
  
  // Transformational Figures
  {
    name: "Viktor Frankl",
    description: "Logotherapist",
    category: "psychology",
    biography: "Holocaust survivor and psychologist (1905-1997) who developed logotherapy, demonstrating that meaning-making is humanity's primary drive."
  },
  {
    name: "Ram Dass",
    description: "Consciousness Explorer",
    category: "contemporary",
    biography: "American spiritual teacher (1931-2019) whose 'Be Here Now' became a cornerstone of Western spiritual awakening and psychedelic spirituality."
  },
  {
    name: "Maya Angelou",
    description: "Phenomenal Woman",
    category: "literature",
    biography: "American poet and civil rights activist (1928-2014) whose autobiographical works inspire resilience, dignity, and the power of storytelling."
  }
];

const defaultPhilosophies = [
  // Classical Western Philosophy
  {
    name: "Stoicism",
    description: "Ancient Greek philosophy emphasizing virtue, wisdom, and emotional resilience through rational thought and acceptance of what we cannot control."
  },
  {
    name: "Existentialism",
    description: "Modern philosophy emphasizing individual existence, freedom, and choice in creating authentic meaning in an apparently meaningless universe."
  },
  {
    name: "Neo-Platonism",
    description: "Late ancient philosophy viewing reality as emanation from 'The One' through multiple levels, emphasizing contemplative return to unity."
  },
  {
    name: "Transcendentalism",
    description: "19th-century American movement emphasizing inherent goodness of people and nature, individual intuition, and social reform."
  },
  
  // Eastern Spiritual Traditions
  {
    name: "Buddhism",
    description: "Ancient teaching focused on mindfulness, compassion, and liberation from suffering through the Eightfold Path and meditation."
  },
  {
    name: "Zen Buddhism",
    description: "Direct insight tradition emphasizing meditation practice, present-moment awareness, and awakening to Buddha-nature beyond concepts."
  },
  {
    name: "Vipassana-Dhamma",
    description: "Buddhist meditation practice for developing clear insight into reality through systematic observation of impermanence and non-self."
  },
  {
    name: "Taoism",
    description: "Chinese philosophy emphasizing harmony with the natural order, wu wei (effortless action), and the balance of yin-yang."
  },
  
  // Hindu and Yogic Traditions
  {
    name: "Advaita Vedanta",
    description: "Non-dualist Hindu philosophy teaching that individual consciousness (Atman) and universal consciousness (Brahman) are one."
  },
  {
    name: "Kashmir Shaivism",
    description: "Tantric tradition viewing the world as real divine play of Shiva-Shakti consciousness, emphasizing dynamic spiritual practice."
  },
  {
    name: "Yogic Wisdom",
    description: "Ancient Indian system integrating physical, mental, and spiritual practices for self-realization and unity consciousness."
  },
  {
    name: "Vedanta",
    description: "Hindu philosophical tradition exploring the nature of reality, consciousness, and the path to liberation through knowledge."
  },
  
  // Mystical Traditions
  {
    name: "Sufism",
    description: "Islamic mystical tradition emphasizing direct personal experience of divine love through purification of the heart and remembrance."
  },
  {
    name: "Christian Mysticism",
    description: "Contemplative tradition seeking direct, experiential union with God through prayer, meditation, and surrender of the ego."
  },
  {
    name: "Kabbalah",
    description: "Jewish mystical tradition exploring hidden dimensions of reality through the Tree of Life and direct experience of divine emanation."
  },
  
  // Humanistic Approaches
  {
    name: "Humanism",
    description: "Philosophy emphasizing human dignity, potential for flourishing, and ethical living through reason, compassion, and personal growth."
  },
  {
    name: "Positive Psychology",
    description: "Scientific study of human flourishing, focusing on strengths, virtues, and factors that contribute to meaningful, fulfilling life."
  },
  {
    name: "Integral Philosophy",
    description: "Comprehensive framework integrating multiple perspectives and developmental stages to understand consciousness and reality holistically."
  },
  
  // Contemporary Movements
  {
    name: "Mindfulness Movement",
    description: "Modern adaptation of ancient meditation practices emphasizing present-moment awareness for healing, growth, and awakening."
  },
  {
    name: "New Thought Movement",
    description: "Spiritual philosophy emphasizing the power of positive thinking, mental science, and the creative potential of consciousness."
  }
];

// Note: Character IDs will be assigned dynamically after insertion
const defaultQuotes = [
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    category: "mindset"
  },
  {
    text: "What we think, we become.",
    author: "Buddha (Siddhartha Gautama)",
    category: "consciousness"
  },
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    category: "wisdom"
  },
  {
    text: "Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.",
    author: "Rumi",
    category: "passion"
  },
  {
    text: "Everything can be taken from a man but one thing: the last of human freedoms - to choose one's attitude in any given set of circumstances.",
    author: "Viktor Frankl",
    category: "freedom"
  },
  {
    text: "If you don't like something, change it. If you can't change it, change your attitude.",
    author: "Maya Angelou",
    category: "empowerment"
  },
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "control"
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha (Siddhartha Gautama)",
    category: "peace"
  },
  {
    text: "The way is not in the sky. The way is in the heart.",
    author: "Buddha (Siddhartha Gautama)",
    category: "wisdom"
  },
  {
    text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi",
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
    const insertedCharacters = await db.insert(characters).values(defaultCharacters).returning();

    // Insert philosophies
    console.log('Inserting philosophies...');
    const insertedPhilosophies = await db.insert(philosophies).values(defaultPhilosophies).returning();

    // Insert quotes with proper character and philosophy references
    console.log('Inserting quotes...');
    const quotesWithRefs = defaultQuotes.map((quote) => {
      // Find character by name
      const character = insertedCharacters.find(c => 
        c.name === quote.author || 
        c.name.includes(quote.author.split(' ')[0])
      );

      // Find philosophy based on character's likely tradition
      let philosophy = null;
      if (quote.author.includes('Marcus Aurelius')) {
        philosophy = insertedPhilosophies.find(p => p.name === 'Stoicism');
      } else if (quote.author.includes('Buddha')) {
        philosophy = insertedPhilosophies.find(p => p.name === 'Buddhism');
      }

      return {
        ...quote,
        characterId: character?.id || null,
        philosophyId: philosophy?.id || null
      };
    });

    await db.insert(quotes).values(quotesWithRefs);

    console.log(`Database seeded successfully with ${insertedCharacters.length} characters, ${insertedPhilosophies.length} philosophies, and ${quotesWithRefs.length} quotes!`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}