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
    // Ensure teams have correct lives limits
    if (updatedTournament.teams) {
      updatedTournament.teams = updatedTournament.teams.map(team => ({
        ...team,
        lives: Math.max(0, Math.min(2, team.lives)), // Ensure lives between 0 and 2
      }));
    }
    
    setTournament(updatedTournament);
    
    // Here we could add logic to persist changes or sync with backend
    console.log("Tournament updated and synced with scoreboard", updatedTournament);
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
