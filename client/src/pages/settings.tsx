import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Moon, Sun, Monitor, RefreshCw, Users, LogOut, Settings2, BookHeart } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Character, Philosophy } from "@shared/schema";

type Theme = "auto" | "light" | "dark";
type RefreshDuration = "1" | "5" | "10" | "30" | "60";

interface UserPreferences {
  characters: Character[];
  philosophies: Philosophy[];
  selectedCharacterIds: number[];
  selectedPhilosophyIds: number[];
}

export default function Settings() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Auto refresh state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [refreshDuration, setRefreshDuration] = useState<RefreshDuration>("10");
  
  // View states
  const [showSources, setShowSources] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Preference selection state
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([]);
  const [selectedPhilosophies, setSelectedPhilosophies] = useState<number[]>([]);

  // Fetch user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<UserPreferences>({
    queryKey: ['/api/settings/preferences'],
    enabled: isAuthenticated && !isLoading
  });

  // Update character preferences mutation
  const updateCharactersMutation = useMutation({
    mutationFn: async (characterIds: number[]) => {
      const response = await fetch('/api/settings/characters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ characterIds })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Characters Updated",
        description: "Your character preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/preferences'] });
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
        description: "Failed to update character preferences.",
        variant: "destructive",
      });
    }
  });

  // Update philosophy preferences mutation
  const updatePhilosophiesMutation = useMutation({
    mutationFn: async (philosophyIds: number[]) => {
      const response = await fetch('/api/settings/philosophies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ philosophyIds })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Philosophies Updated",
        description: "Your philosophy preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/preferences'] });
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
        description: "Failed to update philosophy preferences.",
        variant: "destructive",
      });
    }
  });

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

  // Load saved settings from localStorage and preferences from API
  useEffect(() => {
    const savedAutoRefresh = localStorage.getItem("inspire-auto-refresh") === "true";
    const savedDuration = localStorage.getItem("inspire-refresh-duration") as RefreshDuration;
    
    if (savedAutoRefresh !== null) setAutoRefreshEnabled(savedAutoRefresh);
    if (savedDuration) setRefreshDuration(savedDuration);
  }, []);

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setSelectedCharacters(preferences.selectedCharacterIds);
      setSelectedPhilosophies(preferences.selectedPhilosophyIds);
    }
  }, [preferences]);

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

  const handleCharacterToggle = (characterId: number) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId) 
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const handlePhilosophyToggle = (philosophyId: number) => {
    setSelectedPhilosophies(prev => 
      prev.includes(philosophyId) 
        ? prev.filter(id => id !== philosophyId)
        : [...prev, philosophyId]
    );
  };

  const handleSavePreferences = () => {
    updateCharactersMutation.mutate(selectedCharacters);
    updatePhilosophiesMutation.mutate(selectedPhilosophies);
  };

  if (showSources) {
    return <SourcesSettings onBack={() => setShowSources(false)} />;
  }

  if (showPreferences) {
    return (
      <PreferencesSettings 
        preferences={preferences}
        selectedCharacters={selectedCharacters}
        selectedPhilosophies={selectedPhilosophies}
        onCharacterToggle={handleCharacterToggle}
        onPhilosophyToggle={handlePhilosophyToggle}
        onSave={handleSavePreferences}
        onBack={() => setShowPreferences(false)}
        isSaving={updateCharactersMutation.isPending || updatePhilosophiesMutation.isPending}
        preferencesLoading={preferencesLoading}
      />
    );
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

        {/* Content Preferences Card */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <BookHeart className="w-5 h-5 text-sage" />
              <span>Content Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sage mb-1">
                  Update your character and philosophy choices
                </p>
                <p className="text-xs text-sage/70">
                  {preferences && `${preferences.selectedCharacterIds.length} characters, ${preferences.selectedPhilosophyIds.length} philosophies selected`}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreferences(true)}
                className="border-sage text-sage hover:bg-sage hover:text-white"
                disabled={preferencesLoading}
              >
                {preferencesLoading ? "Loading..." : "Update Choices"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sources Settings Card */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="w-5 h-5 text-sage" />
              <span>Sources & Attribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-sage">
                View wisdom sources and their attributions
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSources(true)}
                className="border-sage text-sage hover:bg-sage hover:text-white"
              >
                View Sources
              </Button>
            </div>
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

// Preferences Settings Component
interface PreferencesSettingsProps {
  preferences: UserPreferences | undefined;
  selectedCharacters: number[];
  selectedPhilosophies: number[];
  onCharacterToggle: (id: number) => void;
  onPhilosophyToggle: (id: number) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
  preferencesLoading: boolean;
}

function PreferencesSettings({ 
  preferences, 
  selectedCharacters, 
  selectedPhilosophies, 
  onCharacterToggle, 
  onPhilosophyToggle, 
  onSave, 
  onBack, 
  isSaving,
  preferencesLoading 
}: PreferencesSettingsProps) {
  if (preferencesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sage">Loading preferences...</div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sage">Failed to load preferences</div>
      </div>
    );
  }

  const hasChanges = 
    JSON.stringify([...selectedCharacters].sort()) !== JSON.stringify([...preferences.selectedCharacterIds].sort()) ||
    JSON.stringify([...selectedPhilosophies].sort()) !== JSON.stringify([...preferences.selectedPhilosophyIds].sort());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5 text-sage" />
              </Button>
              <h1 className="text-xl font-semibold text-card-foreground">Content Preferences</h1>
            </div>
            {hasChanges && (
              <Button
                onClick={onSave}
                disabled={isSaving}
                size="sm"
                className="bg-sage hover:bg-sage-dark text-white"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Characters Section */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-sage" />
                <span>Inspirational Characters</span>
              </span>
              <span className="text-sm font-normal text-sage">{selectedCharacters.length} selected</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-sage mb-4">
              Choose the historical figures and teachers whose wisdom resonates with you.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {preferences.characters.map((character) => (
                <div key={character.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={`character-${character.id}`}
                    checked={selectedCharacters.includes(character.id!)}
                    onCheckedChange={() => onCharacterToggle(character.id!)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`character-${character.id}`} className="text-sm font-medium cursor-pointer">
                      {character.name}
                    </Label>
                    <p className="text-xs text-sage">{character.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Philosophies Section */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <BookHeart className="w-5 h-5 text-gold" />
                <span>Wisdom Traditions</span>
              </span>
              <span className="text-sm font-normal text-sage">{selectedPhilosophies.length} selected</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-sage mb-4">
              Select the philosophical traditions and schools of thought that interest you.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {preferences.philosophies.map((philosophy) => (
                <div key={philosophy.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={`philosophy-${philosophy.id}`}
                    checked={selectedPhilosophies.includes(philosophy.id!)}
                    onCheckedChange={() => onPhilosophyToggle(philosophy.id!)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`philosophy-${philosophy.id}`} className="text-sm font-medium cursor-pointer">
                      {philosophy.name}
                    </Label>
                    <p className="text-xs text-sage">{philosophy.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button (bottom) */}
        {hasChanges && (
          <div className="pt-4">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full bg-sage hover:bg-sage-dark text-white py-3"
            >
              {isSaving ? "Saving Changes..." : "Save Preferences"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sources Settings Component
function SourcesSettings({ onBack }: { onBack: () => void }) {
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
            <h1 className="text-xl font-semibold text-card-foreground">Sources & Attribution</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          <Card className="shadow-sm border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Research Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-card-foreground">Academic Sources:</h4>
                  <ul className="text-sage space-y-1 ml-4">
                    <li>• Stanford Encyclopedia of Philosophy</li>
                    <li>• Encyclopedia Britannica</li>
                    <li>• Academic journals and peer-reviewed sources</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground">Historical Figures:</h4>
                  <p className="text-sage">
                    Biographies and teachings sourced from established historical records, 
                    scholarly works, and authenticated writings.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground">Philosophical Traditions:</h4>
                  <p className="text-sage">
                    Descriptions drawn from authoritative sources on world philosophy, 
                    religious studies, and comparative philosophy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}