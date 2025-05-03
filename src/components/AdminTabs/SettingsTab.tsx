
import React, { useState } from "react";
import { Tournament } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface SettingsTabProps {
  tournament: Tournament;
  onUpdateTournament: (tournament: Tournament) => void;
  loading?: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ tournament, onUpdateTournament, loading = false }) => {
  const { toast } = useToast();
  const [currentTournament, setCurrentTournament] = useState<Tournament>({
    ...tournament,
    rules: tournament.rules || {
      reentryAllowedUntilRound: 5,
      pointsToWin: 3000
    }
  });

  const handleSaveSettings = () => {
    onUpdateTournament(currentTournament);
    
    toast({
      title: "Configurações salvas",
      description: "As alterações foram aplicadas ao torneio."
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Torneio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label>Nome do Torneio</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Label>Local</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Label>Data</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="border-t pt-4 mt-2">
              <h3 className="font-semibold mb-4">Regras do Torneio</h3>
              <div className="grid gap-4">
                <div>
                  <Label>Limite de Rodada para Reinscrição</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Label>Pontos para Vencer</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Torneio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="tournament-name">Nome do Torneio</Label>
            <Input
              id="tournament-name"
              value={currentTournament.name}
              onChange={(e) => setCurrentTournament({...currentTournament, name: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="tournament-location">Local</Label>
            <Input
              id="tournament-location"
              value={currentTournament.location}
              onChange={(e) => setCurrentTournament({...currentTournament, location: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="tournament-date">Data</Label>
            <Input
              id="tournament-date"
              type="date"
              value={currentTournament.date.toISOString().split('T')[0]}
              onChange={(e) => setCurrentTournament({
                ...currentTournament, 
                date: new Date(e.target.value)
              })}
            />
          </div>
          
          <div className="border-t pt-4 mt-2">
            <h3 className="font-semibold mb-4">Regras do Torneio</h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="reentry-limit">Limite de Rodada para Reinscrição</Label>
                <Input
                  id="reentry-limit"
                  type="number"
                  min={1}
                  value={currentTournament.rules?.reentryAllowedUntilRound || 5}
                  onChange={(e) => setCurrentTournament({
                    ...currentTournament, 
                    rules: {
                      ...currentTournament.rules!,
                      reentryAllowedUntilRound: parseInt(e.target.value) || 5
                    }
                  })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Equipes podem se reinscrever após eliminação até esta rodada.
                </p>
              </div>
              
              <div>
                <Label htmlFor="points-to-win">Pontos para Vencer</Label>
                <Input
                  id="points-to-win"
                  type="number"
                  min={100}
                  step={100}
                  value={currentTournament.rules?.pointsToWin || 3000}
                  onChange={(e) => setCurrentTournament({
                    ...currentTournament, 
                    rules: {
                      ...currentTournament.rules!,
                      pointsToWin: parseInt(e.target.value) || 3000
                    }
                  })}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex justify-end">
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
