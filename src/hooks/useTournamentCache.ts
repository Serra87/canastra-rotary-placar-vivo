
import { useState, useEffect } from "react";
import { Tournament } from "@/lib/types";

// Key for localStorage
const CACHE_KEY = "tournament_data_cache";
// Default expiration time (30 minutes in milliseconds)
const DEFAULT_EXPIRATION = 30 * 60 * 1000;

interface CachedData {
  data: Tournament;
  timestamp: number;
  expiration: number;
}

interface UseTournamentCacheOptions {
  expiration?: number;
  onError?: (err: Error) => void;
}

export function useTournamentCache(
  tournament: Tournament | null, 
  options: UseTournamentCacheOptions = {}
) {
  const { expiration = DEFAULT_EXPIRATION, onError } = options;
  const [cachedTournament, setCachedTournament] = useState<Tournament | null>(null);

  // On mount, attempt to retrieve cached tournament
  useEffect(() => {
    // Only try to load from cache if we don't yet have data from the server
    if (!tournament) {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        if (cachedData) {
          const parsed = JSON.parse(cachedData) as CachedData;
          const now = Date.now();
          
          // Check if the cache is still valid
          if (now - parsed.timestamp < parsed.expiration) {
            // Ensure date is properly handled
            const cachedTournament = {
              ...parsed.data,
              date: new Date(parsed.data.date)
            };
            
            setCachedTournament(cachedTournament);
            console.log("Tournament data loaded from cache");
          } else {
            // Clear expired cache
            localStorage.removeItem(CACHE_KEY);
            console.log("Tournament cache expired, cleared");
          }
        }
      } catch (err) {
        console.error("Error loading tournament from cache:", err);
        if (onError && err instanceof Error) {
          onError(err);
        }
      }
    }
  }, []);

  // When tournament data is available, update the cache
  useEffect(() => {
    if (tournament) {
      try {
        const cacheData: CachedData = {
          data: tournament,
          timestamp: Date.now(),
          expiration
        };
        
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log("Tournament data saved to cache");
      } catch (err) {
        console.error("Error saving tournament to cache:", err);
        if (onError && err instanceof Error) {
          onError(err);
        }
      }
    }
  }, [tournament, expiration]);

  return {
    cachedTournament,
    clearCache: () => {
      localStorage.removeItem(CACHE_KEY);
      setCachedTournament(null);
    }
  };
}
