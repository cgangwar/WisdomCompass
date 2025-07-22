import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Users, BookOpen, Target, Compass, Heart, Brain, Lightbulb, Globe, Mountain } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const featuredFigures = [
    { name: "Marcus Aurelius", era: "Ancient Rome", tradition: "Stoicism" },
    { name: "Buddha", era: "Ancient India", tradition: "Buddhism" },
    { name: "Rumi", era: "13th Century", tradition: "Sufism" },
    { name: "Lao Tzu", era: "Ancient China", tradition: "Taoism" },
    { name: "Sadhguru", era: "Contemporary", tradition: "Yogic Wisdom" },
    { name: "Thich Nhat Hanh", era: "Modern", tradition: "Zen Buddhism" },
    { name: "Jiddu Krishnamurti", era: "20th Century", tradition: "Freedom of Inquiry" },
    { name: "Eckhart Tolle", era: "Contemporary", tradition: "Presence" }
  ];

  const wisdomTraditions = [
    { name: "Stoicism", origin: "Ancient Greece", icon: "🏛️" },
    { name: "Buddhism", origin: "Ancient India", icon: "☸️" },
    { name: "Zen Buddhism", origin: "Japan", icon: "🧘" },
    { name: "Taoism", origin: "Ancient China", icon: "☯️" },
    { name: "Sufism", origin: "Persia", icon: "🌹" },
    { name: "Advaita Vedanta", origin: "India", icon: "🕉️" },
    { name: "Vipassana-Dhamma", origin: "Myanmar", icon: "💎" },
    { name: "Kashmir Shaivism", origin: "Kashmir", icon: "🔱" },
    { name: "Christian Mysticism", origin: "Europe", icon: "✝️" },
    { name: "Transcendentalism", origin: "America", icon: "🌲" },
    { name: "Kabbalah", origin: "Jewish Tradition", icon: "✡️" },
    { name: "Yogic Wisdom", origin: "Ancient India", icon: "🧘‍♀️" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-sage">Wisdom Compass</h1>
          <Button onClick={handleLogin} variant="outline" size="sm" className="border-sage text-sage hover:bg-sage hover:text-white">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-md mx-auto bg-card min-h-screen shadow-xl">
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 pt-8">
            <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-sage" />
            </div>
            <h1 className="text-3xl font-bold text-card-foreground">Welcome to Wisdom Compass</h1>
            <p className="text-sage text-lg leading-relaxed">
              Discover timeless wisdom from 20 influential historical figures and 20 philosophical traditions that have shaped human understanding for millennia.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-card-foreground text-lg">
                  <div className="w-8 h-8 bg-sage/10 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-sage" />
                  </div>
                  Personalized Content
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sage text-sm">
                  Choose from 20 inspirational figures spanning ancient wisdom to contemporary teachers, and 20 philosophical traditions from around the world.
                </p>
                <div className="flex flex-wrap gap-1">
                  {featuredFigures.slice(0, 4).map((figure, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-sage/10 text-sage border-sage/20">
                      {figure.name}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="text-xs bg-sage/5 text-sage/70 border-sage/10">
                    +16 more
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-card-foreground text-lg">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-gold" />
                  </div>
                  Daily Wisdom
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sage text-sm">
                  Receive thoughtfully curated wisdom from ancient Stoics, Buddhist masters, Sufi mystics, and modern teachers.
                </p>
                <div className="flex flex-wrap gap-1">
                  {wisdomTraditions.slice(0, 4).map((tradition, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gold/30 text-gold bg-gold/5">
                      {tradition.icon} {tradition.name}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs border-gold/20 text-gold/70 bg-gold/3">
                    +16 more
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-card-foreground text-lg">
                  <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-success" />
                  </div>
                  Mindful Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sage text-sm">
                  Journal your thoughts, set meaningful reminders, and track your personal development journey.
                </p>
              </CardContent>
            </Card>

            {/* Wisdom Traditions Showcase */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-card-foreground text-lg">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Global Wisdom Traditions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sage text-sm">
                  Explore 20 schools of thought including Yogic Wisdom, Vipassana-Dhamma, Kashmir Shaivism, and contemporary teachings.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {wisdomTraditions.slice(0, 8).map((tradition, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <span className="text-base">{tradition.icon}</span>
                      <span className="text-sage font-medium">{tradition.name}</span>
                    </div>
                  ))}
                </div>
                <Badge variant="outline" className="text-xs border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20">
                  + 12 more traditions from around the world
                </Badge>
              </CardContent>
            </Card>

            {/* Master Teachers Section */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-card-foreground text-lg">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Mountain className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  Timeless Teachers
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sage text-sm">
                  Learn from 20 influential figures spanning ancient emperors to contemporary masters like Sadhguru and Joe Dispenza.
                </p>
                <div className="space-y-2">
                  {[
                    { category: "Ancient Wisdom", figures: ["Marcus Aurelius", "Buddha", "Lao Tzu", "Confucius"] },
                    { category: "Mystic Poets", figures: ["Rumi", "Hafez", "Ibn Arabi"] },
                    { category: "Contemporary", figures: ["Sadhguru", "Eckhart Tolle", "Thich Nhat Hanh", "Dalai Lama"] }
                  ].map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-1">
                      <h4 className="text-xs font-semibold text-card-foreground">{group.category}</h4>
                      <div className="flex flex-wrap gap-1">
                        {group.figures.map((figure, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                            {figure}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Badge variant="outline" className="text-xs border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
                    + 9 more influential teachers
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="pt-8 space-y-4">
            <Button 
              onClick={handleLogin} 
              className="w-full bg-sage text-white py-4 rounded-xl font-medium hover:bg-sage-dark transition-colors text-lg"
            >
              Begin Your Journey
            </Button>
            <p className="text-center text-muted-foreground text-sm">
              Join thousands discovering wisdom that has guided humanity for centuries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
