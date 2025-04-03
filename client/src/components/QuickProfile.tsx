import React from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { QuickProfileCard } from "./QuickProfileCard";

interface QuickProfileProps {
  userId: string;
  username: string;
  children: React.ReactNode;
}

export function QuickProfile({ userId, username, children }: QuickProfileProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // We no longer need to handle the click directly - QuickProfileCard will handle showing the profile info
// and navigation to the full profile page
  return (
    <QuickProfileCard userId={userId} username={username}>
      {children}
    </QuickProfileCard>
  );
}