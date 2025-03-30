import React from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface QuickProfileProps {
  userId: string;
  username: string;
  children: React.ReactNode;
}

export function QuickProfile({ userId, username, children }: QuickProfileProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // First make a request to ensure this profile exists
    try {
      const response = await fetch('/users/ensure-profile-from-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // If the profile exists or was created, navigate to it
          setLocation(`/user/${data.id || userId}`);
        } else {
          // This shouldn't happen as errors should throw
          toast({
            title: "Profile Error",
            description: "There was an issue loading this user's profile",
            variant: "destructive"
          });
        }
      } else {
        // Profile doesn't exist and couldn't be created
        toast({
          title: "Profile Not Found",
          description: `Could not find profile for ${username}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error checking/creating profile:", error);
      toast({
        title: "Error",
        description: "There was an error accessing this profile",
        variant: "destructive"
      });
    }
  };

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      {children}
    </div>
  );
}