import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, User, Clock, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { QuickProfile } from "./QuickProfile";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface UserResult {
  id: string;
  username: string;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Reduced debounce time for more responsive search
  const debouncedQuery = useDebounce(query, 150);
  
  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentUserSearches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
      } catch (e) {
        console.error("Failed to parse recent searches:", e);
      }
    }
  }, []);
  
  // Save a recent search
  const saveRecentSearch = (user: UserResult) => {
    const existingSearches = [...recentSearches];
    // Remove if already exists
    const filteredSearches = existingSearches.filter(
      (search) => search.id !== user.id
    );
    // Add to the beginning of the array
    const newSearches = [user, ...filteredSearches].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem("recentUserSearches", JSON.stringify(newSearches));
  };
  
  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentUserSearches");
  };
  
  // Handle profile click
  const handleProfileClick = (user: UserResult) => {
    saveRecentSearch(user);
    setQuery("");
    setIsFocused(false);
    setLocation(`/user/${user.id}`);
  };
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    async function searchUsers() {
      // Start searching after the first character
      if (!debouncedQuery) {
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
          ref={inputRef}
          placeholder="Search players by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-9 pr-8 bg-[#14151A] border-[#2A2B31] focus:border-[#D7FF00] focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-[#8A8B91]/70 shadow-none h-11"
          style={{ transform: 'translateZ(0)' }} // Prevents layout shifts on mobile
        />
        {query && (
          <button 
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8A8B91] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isFocused && (
          <motion.div 
            ref={resultsRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="max-h-64 overflow-y-auto bg-[#14151A] border border-[#2A2B31] rounded-md py-1 absolute w-full z-20 shadow-lg"
          >
            {isLoading && (
              <div className="flex items-center justify-center text-[#8A8B91] text-sm py-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-[#D7FF00] border-t-transparent rounded-full"></div>
                  Searching...
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-red-400 text-sm py-2 px-3">
                {error}
              </div>
            )}
            
            {/* Show results if we have any */}
            {!isLoading && !error && query && results.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs text-[#8A8B91] font-medium uppercase flex justify-between items-center">
                  <span>Search Results</span>
                  <span className="text-xs">{results.length} found</span>
                </div>
                {results.map((user) => (
                  <div 
                    key={user.id} 
                    onClick={() => handleProfileClick(user)}
                    className="flex items-center gap-3 p-3 hover:bg-[#1A1B21] cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2A2B31] flex items-center justify-center">
                      <User className="h-4 w-4 text-[#D7FF00]" />
                    </div>
                    <span className="text-white font-medium">{user.username}</span>
                  </div>
                ))}
              </>
            )}
            
            {/* Show "no results" message */}
            {!isLoading && !error && query && results.length === 0 && (
              <div className="text-[#8A8B91] text-sm py-4 px-3 text-center">
                No users found matching '{query}'
              </div>
            )}
            
            {/* Show recent searches when input is empty */}
            {!query && recentSearches.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs text-[#8A8B91] font-medium uppercase flex justify-between items-center">
                  <span>Recent Searches</span>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-[#D7FF00] hover:text-[#D7FF00]/80 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((user) => (
                  <div 
                    key={user.id} 
                    onClick={() => handleProfileClick(user)}
                    className="flex items-center gap-3 p-3 hover:bg-[#1A1B21] cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2A2B31] flex items-center justify-center">
                      <Clock className="h-4 w-4 text-[#8A8B91]" />
                    </div>
                    <span className="text-white">{user.username}</span>
                  </div>
                ))}
              </>
            )}
            
            {/* Show empty state when no query and no recent searches */}
            {!query && recentSearches.length === 0 && !isLoading && (
              <div className="text-[#8A8B91] text-sm py-4 px-3 text-center">
                Start typing to search for users
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}