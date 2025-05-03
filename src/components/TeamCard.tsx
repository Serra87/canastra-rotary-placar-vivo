
import { Team } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeamCardProps {
  team: Team;
  compact?: boolean;
}

export const TeamCard = ({ team, compact = false }: TeamCardProps) => {
  if (!team.id) {
    return (
      <Card className="w-full bg-slate-50 border border-dashed">
        <CardContent className="p-4 flex items-center justify-center min-h-[100px]">
          <p className="text-slate-400 text-center">Time a definir</p>
        </CardContent>
      </Card>
    );
  }
  
  const renderLives = () => {
    if (team.eliminated) return null;
    
    const maxLives = team.reEntered ? 1 : 2; // Re-entered teams have only 1 life
    
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: team.lives }).map((_, index) => (
          <Heart 
            key={index} 
            size={compact ? 14 : 16} 
            className="fill-red-500 text-red-500"
          />
        ))}
        {Array.from({ length: maxLives - team.lives }).map((_, index) => (
          <Heart 
            key={`empty-${index}`} 
            size={compact ? 14 : 16} 
            className="text-gray-300"
          />
        ))}
      </div>
    );
  };
  
  return (
    <Card className={`w-full overflow-hidden ${team.eliminated ? 'opacity-75' : ''}`}>
      <CardHeader className={`p-3 bg-rotary-blue text-white ${compact ? 'py-2' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{team.name}</h3>
        </div>
      </CardHeader>
      <CardContent className={`p-3 ${compact ? 'py-2' : ''}`}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mt-1">
            <div>
              <p className="text-sm">Jogadores:</p>
              <p className="font-semibold">{team.players.join(' / ')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Pontos:</p>
              <p className="font-bold text-rotary-blue">{team.totalPoints}</p>
            </div>
          </div>
          
          <div className={`flex justify-between items-center ${compact ? 'mt-1' : 'mt-2'}`}>
            <div className="flex items-center">
              {renderLives()}
              
              {team.reEntered && (
                <Badge variant="warning" className="ml-2 flex items-center gap-1 bg-yellow-500">
                  <AlertTriangle size={12} />
                  <span className="text-xs">Reinscrito</span>
                </Badge>
              )}
            </div>
            
            {team.eliminated && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-600">
                Eliminado
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
