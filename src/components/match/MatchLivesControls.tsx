
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

interface MatchLivesControlsProps {
  lives: number;
  onUpdate: (increment: boolean) => void;
  disabled?: boolean;
}

/**
 * Component for team lives increment/decrement controls
 */
export const MatchLivesControls: React.FC<MatchLivesControlsProps> = ({ 
  lives, 
  onUpdate, 
  disabled = false 
}) => {
  return (
    <div className="flex items-center space-x-1">
      <Label className="text-sm">Vidas:</Label>
      <Button 
        variant="outline" 
        size="icon"
        className="h-7 w-7"
        onClick={() => onUpdate(false)}
        disabled={disabled}
      >
        <Minus size={14} />
      </Button>
      <span className="w-8 text-center">{lives}</span>
      <Button 
        variant="outline" 
        size="icon"
        className="h-7 w-7"
        onClick={() => onUpdate(true)}
        disabled={disabled}
      >
        <Plus size={14} />
      </Button>
    </div>
  );
};

export default MatchLivesControls;
