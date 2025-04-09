/**
 * Quick Profile Component
 * 
 * A consolidated component for displaying user profile previews.
 * Used for user mentions, hover cards, etc.
 */

import React, { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QuickProfileCard } from "./QuickProfileCard";

interface QuickProfileProps {
  /** User ID (can be numeric internal ID or string Goated ID) */
  userId: string | number;
  /** Called when the profile card is closed */
  onClose?: () => void;
  /** Size of the profile card */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Optional content to trigger dialog */
  children?: ReactNode;
  /** Legacy username param (optional, ID is used instead) */
  username?: string;
}

/**
 * QuickProfile component
 * 
 * Shows profile cards with consistent styling
 * Can be used directly or as a dialog trigger when children are provided
 */
export function QuickProfile({
  userId,
  onClose,
  size = "md",
  className,
  children,
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