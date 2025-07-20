import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote, Users, BookOpen, Target } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-sage">Inspire</h1>
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
              <Quote className="w-10 h-10 text-sage" />
            </div>
            <h1 className="text-3xl font-bold text-card-foreground">Welcome to Inspire</h1>
            <p className="text-sage text-lg leading-relaxed">
              Your personal companion for daily inspiration, mindful journaling, and meaningful growth.
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
              <CardContent className="pt-0">
                <p className="text-sage text-sm">
                  Choose from inspirational characters and philosophical teachings that resonate with your journey.
                </p>
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
              <CardContent className="pt-0">
                <p className="text-sage text-sm">
                  Receive thoughtfully curated quotes and insights to inspire your day and spark reflection.
                </p>
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
              Start building your daily inspiration practice today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
