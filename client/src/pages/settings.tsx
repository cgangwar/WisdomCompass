import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Moon, Sun, Monitor, RefreshCw, Users, LogOut } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

type Theme = "auto" | "light" | "dark";
type RefreshDuration = "1" | "5" | "10" | "30" | "60";

export default function Settings() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Theme state
  const [theme, setTheme] = useState<Theme>("auto");
  
  // Auto refresh state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [refreshDuration, setRefreshDuration] = useState<RefreshDuration>("10");
  
  // Sources state
  const [showSources, setShowSources] = useState(false);

  // Redirect if not authenticated
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

  // Load saved settings from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("inspire-theme") as Theme;
    const savedAutoRefresh = localStorage.getItem("inspire-auto-refresh") === "true";
    const savedDuration = localStorage.getItem("inspire-refresh-duration") as RefreshDuration;
    
    if (savedTheme) setTheme(savedTheme);
    if (savedAutoRefresh !== null) setAutoRefreshEnabled(savedAutoRefresh);
    if (savedDuration) setRefreshDuration(savedDuration);
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // Auto theme - use system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    
    localStorage.setItem("inspire-theme", theme);
  }, [theme]);

  // Save auto refresh settings
  useEffect(() => {
    localStorage.setItem("inspire-auto-refresh", autoRefreshEnabled.toString());
    localStorage.setItem("inspire-refresh-duration", refreshDuration);
  }, [autoRefreshEnabled, refreshDuration]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light": return <Sun className="w-4 h-4" />;
      case "dark": return <Moon className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sage">Loading...</div>
      </div>
    );
  }

  if (showSources) {
    return <SourcesSettings onBack={() => setShowSources(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5 text-sage" />
            </Button>
            <h1 className="text-xl font-semibold text-card-foreground">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Theme Settings */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              {getThemeIcon()}
              <span>Theme</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Appearance</Label>
              <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-sage">
                Choose how the app appears. Auto follows your device's theme.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auto Refresh Settings */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <RefreshCw className="w-5 h-5" />
              <span>Auto Refresh</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Enable Auto Refresh</Label>
                <p className="text-xs text-sage">
                  Automatically refresh content at regular intervals
                </p>
              </div>
              <Switch
                checked={autoRefreshEnabled}
                onCheckedChange={setAutoRefreshEnabled}
              />
            </div>
            
            {autoRefreshEnabled && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Refresh Duration</Label>
                  <Select value={refreshDuration} onValueChange={(value: RefreshDuration) => setRefreshDuration(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every 1 minute</SelectItem>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="10">Every 10 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-sage">
                    How often to refresh quotes and background images
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sources Settings */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Inspiration Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowSources(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Characters & Philosophies
            </Button>
            <p className="text-xs text-sage mt-2">
              Update your preferred inspirational characters and philosophical traditions
            </p>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sources Settings Component
function SourcesSettings({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      toast({
        title: "Success",
        description: "Your preferences have been updated",
      });
      onBack();
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5 text-sage" />
            </Button>
            <h1 className="text-xl font-semibold text-card-foreground">Inspiration Sources</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-sage mx-auto mb-4" />
          <h2 className="text-lg font-medium text-card-foreground mb-2">
            Sources Management
          </h2>
          <p className="text-sage mb-6">
            This feature allows you to customize your inspirational characters and philosophical traditions. 
            It will be available in a future update.
          </p>
          <Button onClick={onBack} className="bg-sage hover:bg-sage-dark text-white">
            Back to Settings
          </Button>
        </div>
      </div>
    </div>
  );
}