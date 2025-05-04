
import { useState, useEffect } from 'react';
import { Tournament } from '@/lib/types';
import { useSupabaseTournament } from '@/hooks/useSupabaseTournament';
import { useTournamentCache } from '@/hooks/useTournamentCache';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { useTournamentStats } from '@/hooks/useTournamentStats';
import { toast } from '@/hooks/use-toast';
import { generateUUID } from '@/integrations/supabase/client';
import { TOURNAMENT_STORAGE_KEY, getRankedTeams } from '@/context/tournament/utils';

export const useTournamentState = () => {
  // Hook for Supabase tournament management
  const { 
    tournament: supabaseTournament, 
    loading, 
    error: supabaseError, 
    createTournament, 
    updateTournament: updateSupabaseTournament,
    resetTournament: resetSupabaseTournament
  } = useSupabaseTournament();

  // Default empty tournament
  const defaultEmptyTournament: Tournament = {
    id: generateUUID(),
    name: "Carregando torneio...",
    date: new Date(),
    location: "...",
    teams: [],
    matches: [],
    currentRound: "RODADA 1",
    maxRound: 1,
    rules: {
      reentryAllowedUntilRound: 3,
      pointsToWin: 3000
    }
  };
  
  const [tournament, setTournament] = useState<Tournament>(defaultEmptyTournament);
  const [rankedTeams, setRankedTeams] = useState<Tournament['teams']>([]);
  const [error, setError] = useState<Error | null>(null);
  
  // Use tournament stats hook
  const stats = useTournamentStats(tournament);
  
  // Use cache for tournament
  const { cachedTournament, clearCache } = useTournamentCache(supabaseTournament, {
    onError: (err) => console.error("Cache error:", err)
  });
  
  // Use optimistic updates hook
  const { isUpdating, update: optimisticUpdate } = useOptimisticUpdate<Tournament>({
    onUpdate: async (updatedTournament) => {
      if (updatedTournament.id) {
        console.log("Atualizando torneio existente:", updatedTournament.id);
        return await updateSupabaseTournament(updatedTournament);
      } else {
        console.log("Criando novo torneio");
        return await createTournament(updatedTournament);
      }
    },
    onError: (err, originalData) => {
      setError(err instanceof Error ? err : new Error(String(err)));
      // Revert to original data on error
      setTournament(originalData);
      toast({
        title: "Erro ao salvar alterações",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // When Supabase tournament is loaded, update local state
  useEffect(() => {
    if (supabaseTournament) {
      console.log("Torneio carregado do Supabase:", supabaseTournament.id);
      
      // Apply tournament
      setTournament(supabaseTournament);
      setRankedTeams(getRankedTeams(supabaseTournament));
      
      // Clear localStorage to avoid conflicts
      try {
        localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
      } catch (error) {
        console.error("Erro ao limpar localStorage:", error);
      }
      clearCache(); // Clear cache after loading data from server
    } else if (!loading && cachedTournament) {
      // If no Supabase data and not loading, use cache
      console.log("Usando torneio do cache");
      setTournament(cachedTournament);
      setRankedTeams(getRankedTeams(cachedTournament));
    }
  }, [supabaseTournament, loading, cachedTournament]);

  // Effect to show loading errors
  useEffect(() => {
    if (supabaseError) {
      setError(supabaseError);
      toast({
        title: "Erro no banco de dados",
        description: supabaseError.message,
        variant: "destructive"
      });
    }
  }, [supabaseError]);

  return {
    tournament,
    setTournament,
    rankedTeams,
    setRankedTeams,
    loading,
    error,
    isUpdating,
    stats,
    optimisticUpdate,
    resetSupabaseTournament,  // Now this has no arguments
    clearCache
  };
};
