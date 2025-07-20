import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check } from "lucide-react";
import CharacterCard from "@/components/character-card";
import type { Character, Philosophy } from "@shared/schema";

export default function Setup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([]);
  const [selectedPhilosophies, setSelectedPhilosophies] = useState<number[]>([]);

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
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-sage">Inspire</h1>
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
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="p-6 space-y-6">
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-sage' : 'bg-sage/30'}`}></div>
            <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-sage' : 'bg-sage/30'}`}></div>
            <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-sage' : 'bg-sage/30'}`}></div>
          </div>

          {/* Welcome Section */}
          <div className="text-center mb-8">
            {currentStep === 1 ? (
              <>
                <h2 className="text-2xl font-semibold text-warm-gray mb-2">Choose Your Inspirations</h2>
                <p className="text-sage text-sm">Select the characters that resonate with you</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-warm-gray mb-2">Choose Your Philosophy</h2>
                <p className="text-sage text-sm">Select the schools of thought that guide you</p>
              </>
            )}
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-warm-gray">Inspirational Characters</h3>

              {/* Search Bar */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search characters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-cream rounded-xl border-0 focus:ring-2 focus:ring-sage/20"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-sage/60" />
              </div>

              {/* Character Cards */}
              <div className="grid grid-cols-2 gap-3">
                {filteredCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    isSelected={selectedCharacters.includes(character.id)}
                    onClick={() => toggleCharacter(character.id)}
                  />
                ))}
              </div>

              <p className="text-xs text-sage/70 text-center mt-4">
                Selected {selectedCharacters.length} character{selectedCharacters.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-warm-gray">Philosophy Schools</h3>
              <div className="flex flex-wrap gap-2">
                {philosophies?.map((philosophy) => (
                  <button
                    key={philosophy.id}
                    onClick={() => togglePhilosophy(philosophy.id)}
                    className={`px-4 py-2 text-sm rounded-full cursor-pointer transition-colors ${
                      selectedPhilosophies.includes(philosophy.id)
                        ? 'bg-sage text-white'
                        : 'bg-sage/20 text-sage hover:bg-sage/30'
                    }`}
                  >
                    {philosophy.name}
                  </button>
                ))}
              </div>

              <p className="text-xs text-sage/70 text-center mt-4">
                Selected {selectedPhilosophies.length} philosoph{selectedPhilosophies.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>
          )}

          <Button
            onClick={handleNextStep}
            disabled={saveCharactersMutation.isPending || savePhilosophiesMutation.isPending || completeSetupMutation.isPending}
            className="w-full bg-sage text-white py-4 rounded-xl font-medium hover:bg-sage-dark transition-colors"
          >
            {saveCharactersMutation.isPending || savePhilosophiesMutation.isPending || completeSetupMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Setting up...
              </div>
            ) : currentStep === 1 ? (
              'Continue Setup'
            ) : (
              'Complete Setup'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
