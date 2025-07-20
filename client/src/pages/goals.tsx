import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Plus, Target, Edit, Check, X } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import type { Reminder } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema } from "@shared/schema";
import { z } from "zod";

const goalFormSchema = insertReminderSchema.extend({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time in HH:MM format"),
}).pick({
  title: true,
  content: true,
});

type GoalFormData = z.infer<typeof goalFormSchema>;

export default function Goals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<number | null>(null);

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

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

  const { data: goals } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    retry: false,
    select: (data) => data?.filter(reminder => reminder.type === 'goal') || [],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      await apiRequest("POST", "/api/reminders", {
        ...data,
        frequency: "daily",
        time: "09:00",
        type: "goal",
        referenceId: null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Goal Created",
        description: "Your new goal has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setShowAddDialog(false);
      form.reset();
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
        description: "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  const toggleGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      const response = await apiRequest("PATCH", `/api/reminders/${goalId}/toggle`, {});
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
        description: "Failed to toggle goal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GoalFormData) => {
    createGoalMutation.mutate(data);
  };

  const handleToggleGoal = (goalId: number) => {
    toggleGoalMutation.mutate(goalId);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-sage">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = "/"}
            className="rounded-full hover:bg-sage/10 text-sage"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-medium text-card-foreground">Goals</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-sage/10 text-sage"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-md mx-auto bg-card min-h-screen shadow-xl pb-20">
        <div className="p-6 space-y-6">
          {/* Goals Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground">Personal Goals</h3>
            <p className="text-sm text-sage">Track your aspirations and achievements</p>
          </div>

          {/* Goals List */}
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <Card key={goal.id} className="shadow-sm border border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground mb-1">
                          {goal.title}
                        </p>
                        <p className="text-xs text-sage leading-relaxed mb-3">
                          {goal.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-sage">
                            {goal.isActive ? 'Active' : 'Paused'}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleGoal(goal.id)}
                              className="text-sage/50 hover:text-sage p-0"
                            >
                              {goal.isActive ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-2">No goals yet</h3>
              <p className="text-sage text-sm mb-4">
                Create your first goal to start tracking your progress.
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          )}

          {/* Add Goal Button */}
          {goals && goals.length > 0 && (
            <Button
              variant="outline"
              className="w-full bg-blue-50 text-blue-600 py-4 rounded-xl font-medium hover:bg-blue-100 border-2 border-dashed border-blue-200"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Goal
            </Button>
          )}
        </div>
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Learn Spanish, Exercise Daily" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your goal and what you want to achieve..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createGoalMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <BottomNavigation currentPage="goals" />
    </div>
  );
}