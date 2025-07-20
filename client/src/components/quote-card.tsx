import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { BookMarked, Share, Bell } from "lucide-react";
import type { Quote } from "@shared/schema";

interface QuoteCardProps {
  quote: Quote;
  variant?: 'hero' | 'card';
}

export default function QuoteCard({ quote, variant = 'card' }: QuoteCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pinQuoteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/quotes/${quote.id}/pin`, {});
    },
    onSuccess: () => {
      toast({
        title: "Quote Pinned",
        description: "Quote added to your reminders",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
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
      const errorMessage = error.message.includes('already pinned') 
        ? "Quote is already pinned to your reminders"
        : "Failed to pin quote";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const saveToJournalMutation = useMutation({
    mutationFn: async () => {
      const quoteText = `"${quote.text}" — ${quote.author}`;
      await apiRequest("POST", "/api/journal", { text: quoteText, quoteId: quote.id });
    },
    onSuccess: () => {
      toast({
        title: "Saved to Journal",
        description: "Quote added to your journal entries",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
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
        description: "Failed to save to journal",
        variant: "destructive",
      });
    },
  });

  const handleShare = async () => {
    const text = `"${quote.text}" — ${quote.author}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Inspirational Quote',
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Quote Copied",
          description: "Quote copied to clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share quote",
        variant: "destructive",
      });
    }
  };

  if (variant === 'hero') {
    return (
      <div className="text-center space-y-4">
        <p className="text-xs uppercase tracking-wider opacity-90">Quote of the Day</p>
        <blockquote className="text-lg font-serif leading-relaxed max-w-xs">
          "{quote.text}"
        </blockquote>
        <cite className="text-sm opacity-90">— {quote.author}</cite>
        <div className="flex justify-center space-x-4 mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => saveToJournalMutation.mutate()}
            disabled={saveToJournalMutation.isPending}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30"
          >
            <BookMarked className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => pinQuoteMutation.mutate()}
            disabled={pinQuoteMutation.isPending}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30"
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card rounded-xl shadow-sm border border-border">
      <blockquote className="text-sm font-serif text-card-foreground mb-2">
        "{quote.text}"
      </blockquote>
      <cite className="text-xs text-sage">— {quote.author}</cite>
      <div className="flex justify-end space-x-2 mt-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => saveToJournalMutation.mutate()}
          disabled={saveToJournalMutation.isPending}
          className="p-2 hover:bg-sage/10 text-sage"
        >
          <BookMarked className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => pinQuoteMutation.mutate()}
          disabled={pinQuoteMutation.isPending}
          className="p-2 hover:bg-sage/10 text-sage"
        >
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
