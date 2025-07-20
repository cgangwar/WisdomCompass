import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Quote, Pen, ToggleLeft, ToggleRight } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import type { Reminder } from "@shared/schema";

export default function Reminders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

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

  const { data: reminders } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    retry: false,
  });

  const toggleReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      const response = await apiRequest("PATCH", `/api/reminders/${reminderId}/toggle`, {});
      return response.json();
    },
    onSuccess: () => {
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
      toast({
        title: "Error",
        description: "Failed to toggle reminder",
        variant: "destructive",
      });
    },
  });

  const filteredReminders = reminders?.filter(reminder => 
    reminder.frequency === selectedFrequency
  ) || [];

  const handleToggleReminder = (reminderId: number) => {
    toggleReminderMutation.mutate(reminderId);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'quote':
        return <Quote className="w-5 h-5 text-gold" />;
      case 'journal':
        return <Pen className="w-5 h-5 text-sage" />;
      default:
        return <Quote className="w-5 h-5 text-sage" />;
    }
  };

  const getBgColorForType = (type: string) => {
    switch (type) {
      case 'quote':
        return 'bg-gold/10';
      case 'journal':
        return 'bg-sage/10';
      default:
        return 'bg-sage/10';
    }
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
          <h2 className="text-lg font-medium text-warm-gray">Reminders</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-sage/10 text-sage"
            disabled
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl pb-20">
        <div className="p-6 space-y-6">
          {/* Frequency Tabs */}
          <div className="flex space-x-1 bg-sage/10 p-1 rounded-lg">
            <Button
              variant={selectedFrequency === 'daily' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFrequency('daily')}
              className={`flex-1 text-sm ${
                selectedFrequency === 'daily'
                  ? 'bg-white text-sage shadow-sm'
                  : 'text-sage/70 hover:text-sage hover:bg-transparent'
              }`}
            >
              Daily
            </Button>
            <Button
              variant={selectedFrequency === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFrequency('weekly')}
              className={`flex-1 text-sm ${
                selectedFrequency === 'weekly'
                  ? 'bg-white text-sage shadow-sm'
                  : 'text-sage/70 hover:text-sage hover:bg-transparent'
              }`}
            >
              Weekly
            </Button>
            <Button
              variant={selectedFrequency === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFrequency('monthly')}
              className={`flex-1 text-sm ${
                selectedFrequency === 'monthly'
                  ? 'bg-white text-sage shadow-sm'
                  : 'text-sage/70 hover:text-sage hover:bg-transparent'
              }`}
            >
              Monthly
            </Button>
          </div>

          {/* Active Reminders */}
          {filteredReminders.length > 0 ? (
            <div className="space-y-4">
              {filteredReminders.map((reminder) => (
                <Card key={reminder.id} className="shadow-sm border border-sage/10">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 ${getBgColorForType(reminder.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {getIconForType(reminder.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-warm-gray mb-1">
                          {reminder.title}
                        </p>
                        <p className="text-xs text-sage leading-relaxed mb-3">
                          {reminder.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-sage">
                            {reminder.time} {reminder.frequency}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleReminder(reminder.id)}
                            className="text-sage/50 hover:text-sage p-0"
                          >
                            {reminder.isActive ? (
                              <ToggleRight className="w-6 h-6" />
                            ) : (
                              <ToggleLeft className="w-6 h-6" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Quote className="w-8 h-8 text-sage" />
              </div>
              <h3 className="text-lg font-medium text-warm-gray mb-2">No {selectedFrequency} reminders</h3>
              <p className="text-sage text-sm">
                Your {selectedFrequency} reminders will appear here once you create them.
              </p>
            </div>
          )}

          {/* Add Reminder Button */}
          <Button
            variant="outline"
            className="w-full bg-sage/10 text-sage py-4 rounded-xl font-medium hover:bg-sage/20 border-2 border-dashed border-sage/30"
            disabled
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Reminder
          </Button>
        </div>
      </div>

      <BottomNavigation currentPage="reminders" />
    </div>
  );
}
