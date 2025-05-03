
import { Team } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart } from "lucide-react";

interface ScoreboardTableProps {
  teams: Team[];
}

export const ScoreboardTable = ({ teams }: ScoreboardTableProps) => {
  // Sort teams by points in descending order
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);
  
  const renderLives = (lives: number) => {
    return (
      <div className="flex items-center justify-center space-x-1">
        {Array.from({ length: lives }).map((_, index) => (
          <Heart 
            key={index} 
            size={14} 
            className="fill-red-500 text-red-500"
          />
        ))}
        {Array.from({ length: 3 - lives }).map((_, index) => (
          <Heart 
            key={`empty-${index}`} 
            size={14} 
            className="text-gray-300"
          />
        ))}
      </div>
    );
  };
  
  return (
    <Card className="w-full shadow-lg border-t-4 border-t-rotary-gold">
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-rotary-navy text-center text-xl">Classificação Geral</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead className="w-12 text-center">Pos.</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Jogadores</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
              <TableHead className="text-center">Vidas</TableHead>
              <TableHead className="text-center w-24">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeams.map((team, index) => (
              <TableRow key={team.id} className={team.eliminated ? "bg-slate-50 text-slate-400" : ""}>
                <TableCell className="font-medium text-center">
                  {index + 1}
                </TableCell>
                <TableCell>{team.name}</TableCell>
                <TableCell>
                  {team.players.join(' / ')}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {team.totalPoints.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="text-center">
                  {team.eliminated ? (
                    <span className="text-slate-400">0</span>
                  ) : (
                    renderLives(team.lives)
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {team.eliminated ? (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-600">
                      Eliminado
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Ativo
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ScoreboardTable;
