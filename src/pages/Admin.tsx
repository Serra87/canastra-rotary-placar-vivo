
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import { mockTournament } from "@/lib/mockData";
import { useState } from "react";
import { Tournament } from "@/lib/types";

const Admin = () => {
  // Keeping the tournament state at this level helps with state sharing
  // between AdminPanel and other components that might need the data
  const [tournament, setTournament] = useState<Tournament>(mockTournament);
  
  // Function to update tournament data (could be used by child components)
  const updateTournament = (updatedTournament: Tournament) => {
    // Create a deep copy to avoid reference issues
    const tournamentCopy = JSON.parse(JSON.stringify(updatedTournament));
    
    // Ensure teams have correct lives limits
    if (tournamentCopy.teams) {
      tournamentCopy.teams = tournamentCopy.teams.map(team => ({
        ...team,
        lives: Math.max(0, Math.min(team.reEntered ? 1 : 2, team.lives)), // Ensure lives between 0 and max allowed (1 or 2)
      }));
    }
    
    // Ensure match references use the latest team data
    if (tournamentCopy.matches && tournamentCopy.teams) {
      tournamentCopy.matches = tournamentCopy.matches.map(match => {
        // Find latest team references
        const currentTeamA = tournamentCopy.teams.find(t => t.id === match.teamA.id);
        const currentTeamB = tournamentCopy.teams.find(t => t.id === match.teamB.id);
        const currentWinner = match.winner ? 
          tournamentCopy.teams.find(t => t.id === match.winner?.id) : undefined;
          
        // Update embedded team data in match to ensure consistency
        return {
          ...match,
          teamA: currentTeamA ? { 
            ...match.teamA, 
            lives: currentTeamA.lives,
            eliminated: currentTeamA.eliminated,
            reEntered: currentTeamA.reEntered
          } : match.teamA,
          teamB: currentTeamB ? {
            ...match.teamB,
            lives: currentTeamB.lives,
            eliminated: currentTeamB.eliminated,
            reEntered: currentTeamB.reEntered
          } : match.teamB,
          winner: currentWinner
        };
      });
    }
    
    setTournament(tournamentCopy);
    
    // Here we could add logic to persist changes or sync with backend
    console.log("Tournament updated and synced with scoreboard", tournamentCopy);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-rotary-navy">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie times, partidas e configurações do torneio
            </p>
          </div>
          
          <AdminPanel 
            tournament={tournament} 
            onUpdateTournament={updateTournament}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
