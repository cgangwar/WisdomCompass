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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Plus, Quote, Pen, ToggleLeft, ToggleRight, Target, Edit, Trash2, MoreVertical } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import type { Reminder } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema } from "@shared/schema";
import { z } from "zod";

const reminderFormSchema = insertReminderSchema.extend({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time in HH:MM format"),
});

type ReminderFormData = z.infer<typeof reminderFormSchema>;

export default function Reminders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  
  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: "",
      content: "",
      frequency: "daily",
      time: "09:00",
      type: "goal",
      referenceId: null,
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

  const createReminderMutation = useMutation({
    mutationFn: async (data: ReminderFormData) => {
      await apiRequest("POST", "/api/reminders", data);
    },
    onSuccess: () => {
      toast({
        title: "Reminder Created",
        description: "Your new reminder has been added successfully",
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
        description: "Failed to create reminder",
        variant: "destructive",
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ReminderFormData }) => {
      await apiRequest("PATCH", `/api/reminders/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Reminder Updated",
        description: "Your reminder has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setEditingReminder(null);
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
        description: "Failed to update reminder",
        variant: "destructive",
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reminders/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Reminder Deleted",
        description: "Your reminder has been deleted successfully",
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
      toast({
        title: "Error",
        description: "Failed to delete reminder",
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

  const onSubmit = (data: ReminderFormData) => {
    if (editingReminder) {
      updateReminderMutation.mutate({ id: editingReminder.id, data });
    } else {
      createReminderMutation.mutate(data);
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    form.reset({
      title: reminder.title,
      content: reminder.content || "",
      frequency: reminder.frequency,
      time: reminder.time,
      type: reminder.type,
      referenceId: reminder.referenceId,
    });
    setShowAddDialog(true);
  };

  const handleDeleteReminder = (id: number) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      deleteReminderMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingReminder(null);
    form.reset();
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'quote':
        return <Quote className="w-5 h-5 text-gold" />;
      case 'journal':
        return <Pen className="w-5 h-5 text-sage" />;
      case 'goal':
        return <Target className="w-5 h-5 text-blue-600" />;
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
      case 'goal':
        return 'bg-blue-50';
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
            onClick={() => setShowAddDialog(true)}
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
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium text-warm-gray">
                            {reminder.title}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-sage/50 hover:text-sage"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditReminder(reminder)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteReminder(reminder.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Reminder
          </Button>
        </div>
      </div>

      {/* Add Reminder Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Daily Affirmation" {...field} />
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your reminder content..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="goal">Personal Goal</SelectItem>
                        <SelectItem value="quote">Inspirational Quote</SelectItem>
                        <SelectItem value="journal">Journal Prompt</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createReminderMutation.isPending || updateReminderMutation.isPending}
                  className="flex-1 bg-sage hover:bg-sage/90 text-white"
                >
                  {editingReminder ? (
                    updateReminderMutation.isPending ? "Updating..." : "Update Reminder"
                  ) : (
                    createReminderMutation.isPending ? "Creating..." : "Create Reminder"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <BottomNavigation currentPage="reminders" />
    </div>
  );
}
