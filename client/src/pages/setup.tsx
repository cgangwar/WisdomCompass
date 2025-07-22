import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Check, Users, BookHeart, ArrowRight, ArrowLeft, Sparkles, Globe, Heart, Brain, Leaf, Crown, Star } from "lucide-react";
import type { Character, Philosophy } from "@shared/schema";

export default function Setup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([]);
  const [selectedPhilosophies, setSelectedPhilosophies] = useState<number[]>([]);

  // Character categories for enhanced organization
  const getCharactersByCategory = (characters: Character[]) => {
    return characters.reduce((acc, character) => {
      const category = character.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(character);
      return acc;
    }, {} as Record<string, Character[]>);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'philosophy': return <Brain className="w-4 h-4" />;
      case 'spirituality': return <Heart className="w-4 h-4" />;
      case 'mysticism': return <Star className="w-4 h-4" />;
      case 'wisdom': return <Crown className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  // Get tradition icon for philosophies
  const getTraditionIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('buddhism')) return '☸️';
    if (lowerName.includes('stoicism')) return '🏛️';
    if (lowerName.includes('sufism') || lowerName.includes('mysticism')) return '🌙';
    if (lowerName.includes('taoism') || lowerName.includes('taoist')) return '☯️';
    if (lowerName.includes('zen')) return '🧘';
    if (lowerName.includes('yoga') || lowerName.includes('vedanta')) return '🕉️';
    if (lowerName.includes('transcendental')) return '🌲';
    if (lowerName.includes('existential')) return '🎭';
    if (lowerName.includes('kabbalah')) return '✡️';
    if (lowerName.includes('christian')) return '✝️';
    return '📚';
  };

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

  const { data: characters } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
    retry: false,
  });

  const { data: philosophies } = useQuery<Philosophy[]>({
    queryKey: ["/api/philosophies"],
    retry: false,
  });

  const saveCharactersMutation = useMutation({
    mutationFn: async (characterIds: number[]) => {
      await apiRequest("POST", "/api/setup/characters", { characterIds });
    },
    onSuccess: () => {
      setCurrentStep(2);
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
        description: "Failed to save character selection",
        variant: "destructive",
      });
    },
  });

  const savePhilosophiesMutation = useMutation({
    mutationFn: async (philosophyIds: number[]) => {
      await apiRequest("POST", "/api/setup/philosophies", { philosophyIds });
    },
    onSuccess: () => {
      completeSetupMutation.mutate();
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
        description: "Failed to save philosophy selection",
        variant: "destructive",
      });
    },
  });

  const completeSetupMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/setup/complete", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
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
        description: "Failed to complete setup",
        variant: "destructive",
      });
    },
  });

  const filteredCharacters = characters?.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleCharacter = (id: number) => {
    setSelectedCharacters(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const togglePhilosophy = (id: number) => {
    setSelectedPhilosophies(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (selectedCharacters.length === 0) {
        toast({
          title: "Selection Required",
          description: "Please select at least one inspirational character",
          variant: "destructive",
        });
        return;
      }
      saveCharactersMutation.mutate(selectedCharacters);
    } else if (currentStep === 2) {
      if (selectedPhilosophies.length === 0) {
        toast({
          title: "Selection Required",
          description: "Please select at least one philosophy",
          variant: "destructive",
        });
        return;
      }
      savePhilosophiesMutation.mutate(selectedPhilosophies);
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
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-sage" />
            <h1 className="text-xl font-semibold text-sage">Wisdom Compass</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => window.location.href = "/api/logout"}
            className="text-sage hover:bg-sage/10"
          >
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-lg mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  className="text-sage hover:bg-sage/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-sage' : 'bg-sage/30'}`}></div>
                <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-sage' : 'bg-sage/30'}`}></div>
              </div>
              <span className="text-xs text-sage/70">Step {currentStep} of 2</span>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-sage to-gold rounded-full flex items-center justify-center mx-auto mb-3">
                {currentStep === 1 ? (
                  <Users className="w-8 h-8 text-white" />
                ) : (
                  <BookHeart className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            {currentStep === 1 ? (
              <>
                <h2 className="text-2xl font-semibold text-warm-gray mb-2">Welcome to Your Journey</h2>
                <p className="text-sage text-sm leading-relaxed">
                  Discover wisdom from history's greatest minds.<br />
                  Choose the guides who speak to your soul.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-warm-gray mb-2">Explore Wisdom Traditions</h2>
                <p className="text-sage text-sm leading-relaxed">
                  From ancient philosophy to modern insights.<br />
                  Select the paths that illuminate your way.
                </p>
              </>
            )}
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Users className="w-8 h-8 text-sage mx-auto mb-2" />
                <h3 className="text-lg font-medium text-warm-gray mb-2">Choose Your Guides</h3>
                <p className="text-sm text-sage/70">Select the wisdom teachers who inspire you</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name or tradition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-cream rounded-xl border-0 focus:ring-2 focus:ring-sage/20"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-sage/60" />
              </div>

              {/* Character Categories */}
              <div className="space-y-4">
                {characters && Object.entries(getCharactersByCategory(searchTerm ? filteredCharacters : characters)).map(([category, categoryCharacters]) => (
                  <Card key={category} className="border-sage/20 bg-cream/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2 text-sage">
                        {getCategoryIcon(category)}
                        <span className="capitalize">{category === 'spirituality' ? 'Spiritual Masters' : category === 'philosophy' ? 'Philosophical Thinkers' : category}</span>
                        <Badge variant="outline" className="text-xs border-sage/30 text-sage">
                          {categoryCharacters.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid gap-3">
                        {categoryCharacters.map((character) => (
                          <div
                            key={character.id}
                            onClick={() => toggleCharacter(character.id!)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedCharacters.includes(character.id!)
                                ? 'border-sage bg-sage/10 shadow-sm'
                                : 'border-sage/20 hover:border-sage/40 hover:bg-cream/50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={selectedCharacters.includes(character.id!)}
                                onChange={() => {}}
                                className="pointer-events-none"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${
                                  selectedCharacters.includes(character.id!) ? 'text-sage' : 'text-warm-gray'
                                }`}>
                                  {character.name}
                                </p>
                                <p className="text-xs text-sage/70 truncate">
                                  {character.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center py-2">
                <p className="text-sm font-medium text-sage">
                  {selectedCharacters.length} guides selected
                </p>
                <p className="text-xs text-sage/60">Choose at least one to continue</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <BookHeart className="w-8 h-8 text-gold mx-auto mb-2" />
                <h3 className="text-lg font-medium text-warm-gray mb-2">Choose Your Paths</h3>
                <p className="text-sm text-sage/70">Select wisdom traditions that resonate with you</p>
              </div>

              {/* Philosophy Cards */}
              <div className="space-y-3">
                {philosophies?.map((philosophy) => (
                  <div
                    key={philosophy.id}
                    onClick={() => togglePhilosophy(philosophy.id!)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPhilosophies.includes(philosophy.id!)
                        ? 'border-gold bg-gold/10 shadow-sm'
                        : 'border-sage/20 hover:border-gold/40 hover:bg-cream/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="text-lg">
                          {getTraditionIcon(philosophy.name)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Checkbox
                            checked={selectedPhilosophies.includes(philosophy.id!)}
                            onChange={() => {}}
                            className="pointer-events-none"
                          />
                          <h4 className={`font-medium text-sm ${
                            selectedPhilosophies.includes(philosophy.id!) ? 'text-gold' : 'text-warm-gray'
                          }`}>
                            {philosophy.name}
                          </h4>
                        </div>
                        <p className="text-xs text-sage/70 leading-relaxed">
                          {philosophy.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center py-2">
                <p className="text-sm font-medium text-gold">
                  {selectedPhilosophies.length} tradition{selectedPhilosophies.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-sage/60">Choose at least one to continue</p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleNextStep}
              disabled={
                saveCharactersMutation.isPending || 
                savePhilosophiesMutation.isPending || 
                completeSetupMutation.isPending ||
                (currentStep === 1 && selectedCharacters.length === 0) ||
                (currentStep === 2 && selectedPhilosophies.length === 0)
              }
              className="w-full bg-gradient-to-r from-sage to-gold text-white py-4 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveCharactersMutation.isPending || savePhilosophiesMutation.isPending || completeSetupMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up your wisdom journey...
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>
                    {currentStep === 1 ? 'Continue to Traditions' : 'Begin Your Journey'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
