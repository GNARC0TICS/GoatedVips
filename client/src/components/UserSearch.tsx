import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { User, Clock, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { QuickProfile } from "./QuickProfile";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface UserResult {
  id: string;
  username: string;
}

interface UserSearchProps {
  isMobile?: boolean;
}

export function UserSearch({ isMobile = false }: UserSearchProps) {
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
        const response = await fetch(`/api/users/search/${encodeURIComponent(debouncedQuery)}`);
        
        if (!response.ok) {
          throw new Error("Failed to search users");
        }
        
        const data = await response.json();
        // Handle both response formats - array or object with users property
        setResults(Array.isArray(data) ? data : (data.users || []));
      } catch (err) {
        console.error("Error searching users:", err);
        setError("An error occurred while searching");
        setResults([]);
        // Log the query that failed
        console.log("Failed search query:", debouncedQuery);
      } finally {
        setIsLoading(false);
      }
    }
    
    searchUsers();
  }, [debouncedQuery]);
  
  // Create the search icon SVG component
  const SearchIcon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="m9.5 10.95l-1.375 1.075q-.15.125-.3.013t-.1-.288l.525-1.7L6.8 8.9q-.125-.125-.062-.288t.237-.162H8.7l.55-1.725q.05-.175.25-.175t.25.175l.55 1.725h1.725q.175 0 .238.163T12.2 8.9l-1.45 1.15l.525 1.7q.05.175-.1.288t-.3-.013zm0 5.05q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14" />
    </svg>
  );

  // Control mobile search dropdown visibility
  useEffect(() => {
    if (isMobile) {
      // Get the dropdown element
      const searchDropdown = document.getElementById('mobile-search-dropdown');
      if (searchDropdown) {
        if (isFocused) {
          searchDropdown.classList.add('h-16');
          searchDropdown.classList.remove('h-0');
        } else {
          // Add a slight delay before hiding to allow for animations
          setTimeout(() => {
            if (!isFocused) {
              searchDropdown.classList.remove('h-16');
              searchDropdown.classList.add('h-0');
            }
          }, 200);
        }
      }
    }
  }, [isFocused, isMobile]);

  return (
    <div className="w-full relative">
      <div className="relative mb-1">
        <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#D7FF00]" />
        <Input
          id={isMobile ? "mobile-search-input" : "desktop-search-input"}
          ref={inputRef}
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={`pl-8 pr-7 bg-[#14151A] border-[#2A2B31] focus:border-[#D7FF00] focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white font-medium shadow-none h-9 rounded-md ${isMobile ? 'w-full' : 'max-w-[160px]'}`}
          style={{ transform: 'translateZ(0)' }} // Prevents layout shifts on mobile
        />
        {query && (
          <button 
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#8A8B91] hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
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