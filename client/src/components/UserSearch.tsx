import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, X } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchResult = {
  id: string;
  username: string;
};

export function UserSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  // Handle keyboard shortcut to open search dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Handle search query
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) {
            throw new Error('Failed to search users');
          }
          const data = await response.json();
          setResults(data.users || []);
        } catch (error) {
          console.error('Search error:', error);
          toast({
            title: 'Error',
            description: 'Failed to search users. Please try again.',
            variant: 'destructive',
          });
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, toast]);

  const handleSelect = (userId: string) => {
    setLocation(`/user/${userId}`);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative rounded-md h-9 w-9 md:h-10 md:w-fit md:px-4 py-2 bg-[#1A1B21]/50 border-[#2A2B31] hover:bg-[#1A1B21] hover:border-[#D7FF00]/50 overflow-hidden group"
        onClick={() => {
          setOpen(true);
          // Focus after the dialog animation completes
          setTimeout(() => {
            const commandInput = document.querySelector('[cmdk-input]') as HTMLInputElement;
            if (commandInput) commandInput.focus();
          }, 100);
        }}
      >
        <Search className="h-4 w-4 md:mr-2 text-[#8A8B91] group-hover:text-[#D7FF00] transition-colors" />
        <span className="hidden md:inline text-sm text-[#8A8B91] group-hover:text-white transition-colors">
          Search users...
        </span>
        <span className="sr-only md:not-sr-only md:absolute md:right-4 md:top-1/2 md:transform md:-translate-y-1/2 md:text-xs md:text-[#8A8B91] md:opacity-60">
          ⌘K
        </span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search users by username..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center p-4 text-sm text-[#8A8B91]">
                <div className="animate-spin h-4 w-4 border-t-2 border-[#D7FF00] rounded-full mr-2" />
                Searching...
              </div>
            ) : (
              <div className="p-4 text-sm text-[#8A8B91]">
                No users found. Try a different search.
              </div>
            )}
          </CommandEmpty>
          
          {results.length > 0 && (
            <CommandGroup heading="Users">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result.id)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-[#2A2B31]/50"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="bg-[#2A2B31] h-7 w-7 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-[#D7FF00]" />
                    </div>
                    <span className="text-white">{result.username}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}