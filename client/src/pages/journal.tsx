import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MoreHorizontal, Pen, Bookmark } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import type { JournalEntry, Quote } from "@shared/schema";

export default function Journal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [journalText, setJournalText] = useState("");

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

  const { data: entries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    retry: false,
  });

  const { data: suggestions } = useQuery<Quote[]>({
    queryKey: ["/api/quotes/suggestions", journalText],
    enabled: journalText.length > 10,
    retry: false,
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: { text: string; quoteId?: number }) => {
      const response = await apiRequest("POST", "/api/journal", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      setJournalText("");
      toast({
        title: "Success",
        description: "Journal entry saved successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
    },
  });

  const handleSaveJournal = () => {
    if (!journalText.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write something before saving",
        variant: "destructive",
      });
      return;
    }
    createEntryMutation.mutate({ text: journalText });
  };

  const addQuoteToJournal = (quote: Quote) => {
    const quoteText = `"${quote.text}" — ${quote.author}`;
    const newText = journalText ? `${journalText}\n\n${quoteText}` : quoteText;
    setJournalText(newText);
  };

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
          <h2 className="text-lg font-medium text-warm-gray">Journal</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-sage/10 text-sage"
            disabled
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl pb-20">
        <div className="p-6 space-y-6">
          {/* One-line Journal Input */}
          <Card className="shadow-sm border border-sage/10">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-gray mb-2">
                  Today's reflection
                </label>
                <Textarea
                  placeholder="What's on your mind today? One meaningful line..."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  className="w-full p-3 bg-cream rounded-lg border-0 resize-none focus:ring-2 focus:ring-sage/20"
                  rows={3}
                />
              </div>

              {/* Suggested Quotes */}
              {suggestions && suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-sage font-medium">Suggested quotes for reflection:</p>
                  <div className="space-y-2">
                    {suggestions.slice(0, 2).map((quote) => (
                      <Button
                        key={quote.id}
                        variant="outline"
                        onClick={() => addQuoteToJournal(quote)}
                        className="text-left w-full p-3 bg-sage/5 rounded-lg hover:bg-sage/10 border-sage/20 h-auto"
                      >
                        <div>
                          <p className="text-sm text-warm-gray font-serif leading-relaxed">
                            "{quote.text}"
                          </p>
                          <p className="text-xs text-sage mt-1">— {quote.author}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSaveJournal}
                disabled={createEntryMutation.isPending}
                className="w-full bg-sage text-white py-3 rounded-lg font-medium hover:bg-sage-dark transition-colors"
              >
                {createEntryMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Entry'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          {entries && entries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-warm-gray">Recent Entries</h3>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <Card key={entry.id} className="shadow-sm border border-sage/10">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-warm-gray mb-2">
                            "{entry.text}"
                          </p>
                          <p className="text-xs text-sage">
                            {new Date(entry.createdAt!).toLocaleDateString("en-US", {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-1 rounded hover:bg-sage/10 text-sage/50 hover:text-sage"
                          disabled
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(!entries || entries.length === 0) && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pen className="w-8 h-8 text-sage" />
              </div>
              <h3 className="text-lg font-medium text-warm-gray mb-2">Start Your Journey</h3>
              <p className="text-sage text-sm">
                Write your first journal entry to begin capturing your thoughts and reflections.
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation currentPage="journal" />
    </div>
  );
}
