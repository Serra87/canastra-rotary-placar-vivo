
import { Team } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TeamCardProps {
  team: Team;
  showSponsor?: boolean;
}

export const TeamCard = ({ team, showSponsor = true }: TeamCardProps) => {
  if (!team.id) {
    return (
      <Card className="w-full bg-slate-50 border border-dashed">
        <CardContent className="p-4 flex items-center justify-center min-h-[100px]">
          <p className="text-slate-400 text-center">Time a definir</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="p-3 bg-rotary-blue text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{team.name}</h3>
          {showSponsor && <p className="text-sm">{team.sponsor.name}</p>}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mt-1">
            <div>
              <p className="text-sm">Jogadores:</p>
              <p className="font-semibold">{team.players.join(' / ')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Total de pontos:</p>
              <p className="font-bold text-rotary-blue">{team.totalPoints}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
