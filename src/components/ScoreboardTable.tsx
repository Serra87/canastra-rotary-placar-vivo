
import { Team } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ScoreboardTableProps {
  teams: Team[];
}

export const ScoreboardTable = ({ teams }: ScoreboardTableProps) => {
  // Sort teams by points in descending order
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);
  
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
              <TableHead>Empresa</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Jogadores</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
              <TableHead className="text-center w-24">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeams.map((team, index) => (
              <TableRow key={team.id} className={team.eliminated ? "bg-slate-50 text-slate-400" : ""}>
                <TableCell className="font-medium text-center">
                  {index + 1}
                </TableCell>
                <TableCell>{team.sponsor.name}</TableCell>
                <TableCell>{team.name}</TableCell>
                <TableCell>
                  {team.players.join(' / ')}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {team.totalPoints.toLocaleString('pt-BR')}
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
