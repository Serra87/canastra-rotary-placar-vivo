
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface TeamLivesEditorProps {
  lives: number;
  maxLives: number;
  onLivesChange: (lives: number) => void;
}

const TeamLivesEditor = ({ lives, maxLives, onLivesChange }: TeamLivesEditorProps) => {
  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onLivesChange(lives - 1)}
        disabled={lives === 0}
      >
        -
      </Button>
      
      <div className="flex mx-2">
        {Array.from({ length: lives }).map((_, i) => (
          <Heart key={i} size={20} className="text-red-500 fill-red-500 mr-1" />
        ))}
        {Array.from({ length: maxLives - lives }).map((_, i) => (
          <Heart key={`empty-${i}`} size={20} className="text-gray-300 mr-1" />
        ))}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onLivesChange(lives + 1)}
        disabled={lives === maxLives}
      >
        +
      </Button>
      
      <span className="ml-2 text-sm">
        {lives}/{maxLives}
      </span>
    </div>
  );
};

export default TeamLivesEditor;
