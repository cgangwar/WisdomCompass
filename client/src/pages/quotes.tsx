import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, BookMarked, Bookmark, Share, Quote as QuoteIcon } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import QuoteCard from "@/components/quote-card";
import type { Quote } from "@shared/schema";

export default function Quotes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

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

  const { data: allQuotes, isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes/all"],
    retry: false,
  });

  const { data: dailyQuote } = useQuery<Quote>({
    queryKey: ["/api/quotes/daily"],
    retry: false,
  });

  const filteredQuotes = allQuotes?.filter(quote => 
    quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.author.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = "/"}
            className="rounded-full hover:bg-sage/10 text-sage"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-medium text-warm-gray">Quotes</h2>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl pb-20">
        <div className="p-6 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sage/50" />
            <Input
              placeholder="Search quotes by text or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-sage/5 border-sage/20 focus:border-sage/40"
            />
          </div>

          {/* Today's Quote */}
          {dailyQuote && !searchTerm && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-warm-gray flex items-center">
                <QuoteIcon className="w-4 h-4 mr-2 text-sage" />
                Today's Quote
              </h3>
              <QuoteCard quote={dailyQuote} variant="card" />
            </div>
          )}

          {/* All Quotes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-warm-gray flex items-center">
              <BookMarked className="w-4 h-4 mr-2 text-sage" />
              {searchTerm ? `Search Results (${filteredQuotes.length})` : 'All Quotes'}
            </h3>
            
            {quotesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-sage/5 rounded-xl h-24 animate-pulse" />
                ))}
              </div>
            ) : filteredQuotes.length > 0 ? (
              <div className="space-y-3">
                {filteredQuotes.map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} variant="card" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QuoteIcon className="w-8 h-8 text-sage" />
                </div>
                <h3 className="text-lg font-medium text-warm-gray mb-2">
                  {searchTerm ? 'No quotes found' : 'No quotes available'}
                </h3>
                <p className="text-sage text-sm">
                  {searchTerm 
                    ? 'Try adjusting your search terms.'
                    : 'Quotes will appear here once they are loaded.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation currentPage="quotes" />
    </div>
  );
}