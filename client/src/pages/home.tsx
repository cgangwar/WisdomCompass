import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pen, Bell, Target, Brain, Share, BookMarked, Bookmark, RefreshCcw, Settings } from "lucide-react";
import QuoteCard from "@/components/quote-card";
import BottomNavigation from "@/components/bottom-navigation";
import type { Quote, JournalEntry, Reminder } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);

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

  const { data: backgroundImage } = useQuery<{ url: string }>({
    queryKey: ["/api/background-image"],
    retry: false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: recentEntries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    retry: false,
  });

  const { data: goals } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    retry: false,
    select: (data) => data?.filter(reminder => reminder.type === 'goal') || [],
  });

  // Refresh functionality
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/daily"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/background-image"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/journal"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/reminders"] }),
      ]);
      
      toast({
        title: "Refreshed",
        description: "Content has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh content",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [isRefreshing, queryClient, toast]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY === 0 || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0) {
      e.preventDefault();
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  }, [startY]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  }, [pullDistance, handleRefresh]);

  // Auto-refresh functionality based on settings
  useEffect(() => {
    if (!isAuthenticated) return;

    const autoRefreshEnabled = localStorage.getItem("inspire-auto-refresh") === "true";
    const refreshDuration = localStorage.getItem("inspire-refresh-duration") || "10";
    
    if (autoRefreshEnabled) {
      const intervalMs = parseInt(refreshDuration) * 60 * 1000; // Convert minutes to milliseconds
      
      const interval = setInterval(() => {
        handleRefresh();
      }, intervalMs);
      
      setAutoRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        setAutoRefreshInterval(null);
      }
    }
  }, [isAuthenticated, handleRefresh, autoRefreshInterval]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

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
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-full hover:bg-sage/10 text-sage"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = "/settings"}
              className="rounded-full hover:bg-sage/10 text-sage"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 transition-opacity duration-200"
          style={{ opacity: Math.min(pullDistance / 60, 1) }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-sage/20">
            <RefreshCcw className={`w-5 h-5 text-sage ${pullDistance > 60 ? 'animate-spin' : ''}`} />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div 
        className="max-w-md mx-auto bg-white min-h-screen shadow-xl pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.3, 24)}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {/* Daily Quote Section */}
        <div className="relative overflow-hidden">
          <div
            className="h-64 bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center text-white p-6 transition-all duration-500"
            style={{
              backgroundImage: backgroundImage?.url 
                ? `linear-gradient(rgba(139, 154, 122, 0.8), rgba(107, 122, 90, 0.8)), url('${backgroundImage.url}')`
                : `linear-gradient(rgba(139, 154, 122, 0.8), rgba(107, 122, 90, 0.8)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')`,
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
              onClick={() => window.location.href = "/goals"}
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
          {(() => {
            // Combine journal entries and goals into a single activity feed
            const allActivities: Array<{
              id: number;
              type: 'journal' | 'goal';
              title?: string;
              text: string;
              createdAt: string;
            }> = [];

            // Add journal entries
            if (recentEntries) {
              recentEntries.forEach(entry => {
                allActivities.push({
                  id: entry.id,
                  type: 'journal',
                  text: entry.text,
                  createdAt: entry.createdAt!.toString()
                });
              });
            }

            // Add goals
            if (goals) {
              goals.forEach(goal => {
                allActivities.push({
                  id: goal.id,
                  type: 'goal',
                  title: goal.title,
                  text: goal.content || goal.title,
                  createdAt: goal.createdAt!.toString()
                });
              });
            }

            // Sort by creation date (newest first) and take top 3
            const sortedActivities = allActivities
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3);

            return sortedActivities.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-warm-gray">Recent Activity</h3>
                <div className="space-y-3">
                  {sortedActivities.map((activity) => (
                    <Card key={`${activity.type}-${activity.id}`} className="shadow-sm border border-sage/10">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'journal' ? 'bg-sage/10' : 'bg-blue-50'
                          }`}>
                            {activity.type === 'journal' ? (
                              <Pen className="w-4 h-4 text-sage" />
                            ) : (
                              <Target className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {activity.type === 'goal' && activity.title && (
                              <p className="text-sm font-medium text-warm-gray mb-1">
                                {activity.title}
                              </p>
                            )}
                            <p className={`text-sm text-warm-gray line-clamp-2 ${
                              activity.type === 'goal' && activity.title ? 'text-xs' : ''
                            }`}>
                              {activity.text}
                            </p>
                            <p className="text-xs text-sage mt-1">
                              {activity.type === 'journal' ? 'Journal entry' : 'Goal created'} • {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </div>

      <BottomNavigation currentPage="home" />
    </div>
  );
}
