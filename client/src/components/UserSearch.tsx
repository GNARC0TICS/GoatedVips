import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { QuickProfile } from "./QuickProfile";
import { useLocation } from "wouter";

interface UserResult {
  id: string;
  username: string;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    async function searchUsers() {
      if (!debouncedQuery || debouncedQuery.length < 3) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/users/search?username=${encodeURIComponent(debouncedQuery)}`);
        
        if (!response.ok) {
          throw new Error("Failed to search users");
        }
        
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("Error searching users:", err);
        setError("An error occurred while searching");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    searchUsers();
  }, [debouncedQuery]);
  
  return (
    <div className="w-full relative">
      <div className="relative mb-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8A8B91]" />
        <Input
          placeholder="Search by username (min 3 characters)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-[#14151A] border-[#2A2B31] focus:border-[#D7FF00] text-white placeholder:text-[#8A8B91]/70"
        />
      </div>
      
      {isLoading && (
        <div className="text-[#8A8B91] text-sm py-2">Searching...</div>
      )}
      
      {error && (
        <div className="text-red-400 text-sm py-2">{error}</div>
      )}
      
      {!isLoading && !error && results.length > 0 && (
        <div className="max-h-56 overflow-y-auto bg-[#14151A] border border-[#2A2B31] rounded-md py-1 absolute w-full z-10">
          {results.map((user) => (
            <QuickProfile 
              key={user.id} 
              userId={user.id} 
              username={user.username}
            >
              <div
                className="flex items-center gap-2 p-2 hover:bg-[#1A1B21] cursor-pointer"
              >
                <User className="h-4 w-4 text-[#8A8B91]" />
                <span className="text-white">{user.username}</span>
              </div>
            </QuickProfile>
          ))}
        </div>
      )}
      
      {!isLoading && !error && debouncedQuery.length >= 3 && results.length === 0 && (
        <div className="text-[#8A8B91] text-sm py-2">
          No users found matching '{debouncedQuery}'
        </div>
      )}
    </div>
  );
}