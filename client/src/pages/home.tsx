import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pen, Bell, Target, Brain, Share, BookMarked, Bookmark } from "lucide-react";
import QuoteCard from "@/components/quote-card";
import BottomNavigation from "@/components/bottom-navigation";
import type { Quote, JournalEntry } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dailyQuote, isLoading: quoteLoading } = useQuery<Quote>({
    queryKey: ["/api/quotes/daily"],
    retry: false,
  });

  const { data: recentEntries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    retry: false,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-sage">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-sage/10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-sage">Inspire</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = "/api/logout"}
            className="rounded-full hover:bg-sage/10 text-sage"
          >
            <div className="w-8 h-8 bg-sage/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || "U"}
              </span>
            </div>
          </Button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl pb-20">
        {/* Daily Quote Section */}
        <div className="relative overflow-hidden">
          <div
            className="h-64 bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center text-white p-6"
            style={{
              backgroundImage: `linear-gradient(rgba(139, 154, 122, 0.8), rgba(107, 122, 90, 0.8)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {quoteLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-sm mt-4">Loading your daily inspiration...</p>
              </div>
            ) : dailyQuote ? (
              <QuoteCard quote={dailyQuote} variant="hero" />
            ) : (
              <div className="text-center">
                <p className="text-lg font-serif">Welcome to your daily inspiration</p>
                <p className="text-sm mt-2 opacity-90">Your personalized quote will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left border border-sage/10 h-auto"
              onClick={() => window.location.href = "/journal"}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sage/10 rounded-full flex items-center justify-center">
                  <Pen className="w-5 h-5 text-sage" />
                </div>
                <div>
                  <h3 className="font-medium text-warm-gray text-sm">Journal</h3>
                  <p className="text-xs text-sage">Write & reflect</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left border border-sage/10 h-auto"
              onClick={() => window.location.href = "/reminders"}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-medium text-warm-gray text-sm">Reminders</h3>
                  <p className="text-xs text-sage">Daily inspiration</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left border border-sage/10 h-auto"
              disabled
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-medium text-warm-gray text-sm">Goals</h3>
                  <p className="text-xs text-sage">Vision board</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left border border-sage/10 h-auto"
              disabled
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sage/10 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-sage" />
                </div>
                <div>
                  <h3 className="font-medium text-warm-gray text-sm">Mental Models</h3>
                  <p className="text-xs text-sage">Learn & grow</p>
                </div>
              </div>
            </Button>
          </div>

          {/* Recent Activity */}
          {recentEntries && recentEntries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-warm-gray">Recent Activity</h3>
              <div className="space-y-3">
                {recentEntries.slice(0, 2).map((entry) => (
                  <Card key={entry.id} className="shadow-sm border border-sage/10">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-sage/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Pen className="w-4 h-4 text-sage" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-warm-gray line-clamp-2">
                            "{entry.text}"
                          </p>
                          <p className="text-xs text-sage mt-1">
                            Journal entry • {new Date(entry.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation currentPage="home" />
    </div>
  );
}
