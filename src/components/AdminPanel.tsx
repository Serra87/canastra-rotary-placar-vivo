
import { useEffect, useState } from "react";
import { Tournament } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchesTab from "@/components/AdminTabs/MatchesTab";
import TeamsTab from "@/components/AdminTabs/TeamsTab";
import SettingsTab from "@/components/AdminTabs/SettingsTab";

interface AdminPanelProps {
  tournament: Tournament;
  onUpdateTournament?: (tournament: Tournament) => void;
  loading?: boolean;
}

export const AdminPanel = ({ tournament, onUpdateTournament, loading = false }: AdminPanelProps) => {
  const [currentTournament, setCurrentTournament] = useState<Tournament>({
    ...tournament,
    currentRound: tournament.currentRound || "RODADA 1",
    maxRound: tournament.maxRound || 1,
    rules: tournament.rules || {
      reentryAllowedUntilRound: 5,
      pointsToWin: 3000
    }
  });
  
  // Add state for active tab
  const [activeTab, setActiveTab] = useState("matches");
  
  // Update local state when parent tournament changes (including reset)
  useEffect(() => {
    setCurrentTournament({
      ...tournament,
      currentRound: tournament.currentRound || "RODADA 1",
      maxRound: tournament.maxRound || 1,
      rules: tournament.rules || {
        reentryAllowedUntilRound: 5,
        pointsToWin: 3000
      }
    });
  }, [tournament]);
  
  // Function to update tournament data (used by child components)
  const handleUpdateTournament = (updatedTournament: Tournament) => {
    setCurrentTournament(updatedTournament);
    
    // Propagate changes to parent if callback provided
    if (onUpdateTournament) {
      onUpdateTournament(updatedTournament);
    }
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="teams">Times</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="matches">
          <MatchesTab 
            tournament={currentTournament}
            onUpdateTournament={handleUpdateTournament}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="teams">
          <TeamsTab 
            tournament={currentTournament}
            onUpdateTournament={handleUpdateTournament}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab
            tournament={currentTournament}
            onUpdateTournament={handleUpdateTournament}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AdminPanel;
