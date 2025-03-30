import React from "react";
import { useLocation } from "wouter";

interface QuickProfileProps {
  userId: string;
  username: string;
  children: React.ReactNode;
}

export function QuickProfile({ userId, username, children }: QuickProfileProps) {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation(`/user/${userId}`);
  };

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
}