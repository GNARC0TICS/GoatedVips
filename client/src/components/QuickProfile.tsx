import React, { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { profileService } from "@/services/profileService";
import { useToast } from "@/hooks/use-toast";
import { QuickProfileCard } from "./profile/QuickProfileCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface QuickProfileProps {
  userId: string | number;
  onClose?: () => void;
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
  username?: string;
}

/**
 * Backward-compatible wrapper for the new profile system
 * Provides the same API as the old QuickProfile component
 * but uses the new profile service and components
 */
export function QuickProfile({
  userId,
  onClose,
  size = "md",
  className,
  children,
  username
}: QuickProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };
  
  // If children are provided, render as a dialog (modal)
  if (children) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button 
            className="cursor-pointer inline-block text-inherit bg-transparent border-0 p-0 m-0" 
            style={{ font: 'inherit' }}
            onClick={() => setIsOpen(true)}
          >
            {children}
          </button>
        </DialogTrigger>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md mx-auto">
          <QuickProfileCard
            profileId={userId}
            onClose={handleClose}
            size={size === "sm" ? "md" : "lg"}  // Make cards bigger in dialog mode
            className={className}
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  // Otherwise, render directly
  return (
    <QuickProfileCard
      profileId={userId}
      onClose={onClose}
      size={size}
      className={className}
    />
  );
}

/**
 * Legacy function to ensure a profile exists
 * Now delegates to the profile service
 * 
 * @deprecated Use the profile service directly instead
 */
export function useEnsureProfile(userId: string | number) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const { toast } = useToast();
  
  React.useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const profileData = await profileService.getProfile(userId);
        setProfile(profileData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        toast({
          title: "Error loading profile",
          description: "Could not retrieve user profile. Please try again later.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfile();
  }, [userId, toast]);
  
  return { profile, isLoading, error };
}

export default QuickProfile;