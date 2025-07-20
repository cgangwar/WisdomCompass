import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Character } from "@shared/schema";

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onClick: () => void;
}

export default function CharacterCard({ character, isSelected, onClick }: CharacterCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:shadow-md relative ${
        isSelected
          ? 'border-2 border-sage shadow-md'
          : 'border border-sage/10 hover:border-sage/30'
      }`}
    >
      <CardContent className="p-4 text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-sage/10 flex items-center justify-center">
          <span className="text-2xl font-serif text-sage">
            {character.name.charAt(0)}
          </span>
        </div>
        <h4 className="text-sm font-medium text-warm-gray">
          {character.name}
        </h4>
        <p className="text-xs text-sage text-center mt-1">
          {character.description}
        </p>
        {isSelected && (
          <div className="absolute top-2 right-2">
            <Check className="w-4 h-4 text-sage" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
