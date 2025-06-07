import React from "react";
import { SelectUser } from "@db/schema";
import AuthModal from "@/components/AuthModal";
import { UserMenu } from "../layout/UserMenu";

/**
 * AuthSection component
 * This component abstracts the authentication display logic
 * to ensure consistent rendering across desktop and mobile views
 */
interface AuthSectionProps {
  user: SelectUser | undefined;
  handleLogout: () => Promise<void>;
  isMobile?: boolean;
  onMobileAction?: () => void; // Optional callback for mobile actions (e.g., closing menu)
}

export function AuthSection({ 
  user, 
  handleLogout, 
  isMobile = false,
  onMobileAction
}: AuthSectionProps) {
  // If user is logged in, show user menu, otherwise show auth modal
  return (
    <>
      {user ? (
        <UserMenu 
          user={user} 
          handleLogout={handleLogout} 
        />
      ) : (
        <div onClick={onMobileAction}>
          <AuthModal isMobile={isMobile} />
        </div>
      )}
    </>
  );
}

export default AuthSection;
