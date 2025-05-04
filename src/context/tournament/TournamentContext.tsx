
import React, { createContext, useContext, ReactNode } from "react";
import { Tournament } from "@/lib/types";
import { useTournamentState } from "@/hooks/useTournamentState";
import { useTournamentOperations } from "@/hooks/useTournamentOperations";
import { TournamentContextType } from "./types";

// Create context
const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// Context provider
export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use hooks for state and operations
  const {
    tournament,
    setTournament,
    rankedTeams,
    setRankedTeams,
    loading,
    error: stateError,
    isUpdating,
    stats,
    optimisticUpdate,
    resetSupabaseTournament,
    clearCache
  } = useTournamentState();
  
  // Use operations hook
  const {
    updateTournament,
    resetTournament,
    error: operationsError
  } = useTournamentOperations({
    tournament,
    setTournament,
    setRankedTeams,
    optimisticUpdate,
    resetSupabaseTournament: async (id: string) => {
      // Ensure we return a boolean
      try {
        await resetSupabaseTournament();
        return true;
      } catch (error) {
        console.error("Error resetting tournament:", error);
        return false;
      }
    },
    clearCache
  });
  
  // Combine errors from both hooks
  const error = operationsError || stateError;

  return (
    <TournamentContext.Provider value={{ 
      tournament, 
      updateTournament, 
      rankedTeams, 
      resetTournament,
      loading,
      isUpdating,
      error,
      stats
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

// Custom hook for using the context
export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error("useTournament deve ser usado dentro de um TournamentProvider");
  }
  return context;
};
