
import React from "react";
import { Match } from "@/lib/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MatchWinnerSelectProps {
  match: Match;
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Component to select a winner for a match
 */
export const MatchWinnerSelect: React.FC<MatchWinnerSelectProps> = ({
  match,
  value,
  onValueChange,
  disabled = false
}) => {
  console.log("Rendering MatchWinnerSelect with value:", value);
  console.log("Team A:", match.teamA?.id, match.teamA?.name);
  console.log("Team B:", match.teamB?.id, match.teamB?.name);
  
  // Safety check for missing team data
  if (!match.teamA || !match.teamB) {
    console.error("Missing team data in MatchWinnerSelect, TeamA:", !!match.teamA, "TeamB:", !!match.teamB);
    return null;
  }
  
  return (
    <div>
      <Label>Vencedor</Label>
      <Select 
        value={value} 
        onValueChange={onValueChange} 
        disabled={disabled}
      >
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Escolha o vencedor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={match.teamA?.id || ''}>{match.teamA?.name || 'Time A'}</SelectItem>
          <SelectItem value={match.teamB?.id || ''}>{match.teamB?.name || 'Time B'}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MatchWinnerSelect;
