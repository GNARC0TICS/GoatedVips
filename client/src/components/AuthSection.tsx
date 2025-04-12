import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

// Import from style constants
import { buttonStyles } from "@/lib/style-constants";

// Style constants for this component
export const authSectionClasses = {
  container: "container mx-auto flex justify-end mt-16 pt-2 px-4",
  wrapper: "hidden md:flex items-center gap-3 z-40 absolute right-4",
  buttons: "flex items-center gap-2 ml-auto",
};

type AuthSectionProps = {
  isAuthenticated: boolean;
};

export function AuthSection({ isAuthenticated }: AuthSectionProps) {
  return (
    <div className={authSectionClasses.container}>
      <div className={authSectionClasses.wrapper}>
        {/* PLAY button - always visible */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className={buttonStyles.primary}>
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button className={buttonStyles.outline}>
                  Login / Register
                </Button>
              </Link>
              <Link href="/play">
                <Button className={`${buttonStyles.primary} uppercase font-heading`}>
                  Play Now
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthSection;
