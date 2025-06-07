import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AuthSection } from "../auth/AuthSection";
import { MobileNavLink } from "@/components/shared/MobileNavLink";
import { getNavigationSections, type NavigationLabelProps } from "@/data/navigationData";
import type { SelectUser } from "@db/schema";

type MobileNavigationProps = {
  user: SelectUser | null | undefined;
  isAuthenticated: boolean;
  handleLogout: () => Promise<void>;
  setOpenMobile?: (open: boolean) => void; // Optional to maintain backward compatibility
  openMobile?: boolean; // Control open state from parent (added for Header.tsx)
};

export function MobileNavigation({ 
  user, 
  isAuthenticated,
  handleLogout,
  setOpenMobile: externalSetOpenMobile,
  openMobile: externalOpenMobile
}: MobileNavigationProps) {
  // If external setter is provided, use it; otherwise use internal state
  const [internalOpenMobile, setInternalOpenMobile] = useState(false);
  const setOpenMobile = externalSetOpenMobile || setInternalOpenMobile;
  // Use externally provided openMobile value if available, otherwise use internal state
  const openMobile = externalOpenMobile !== undefined ? externalOpenMobile : internalOpenMobile;

  // Get navigation sections based on user role
  const navigationSections = getNavigationSections(user?.isAdmin);

  // Create navigation label props
  const labelProps: NavigationLabelProps = {
    isAuthenticated,
    onClose: () => setOpenMobile(false),
  };

  return (
    <div className="md:hidden relative overflow-hidden group">
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open mobile menu"
            className="relative h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center transform transition-all duration-300 hover:scale-110 z-30"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Add dummy handler to ensure touch events register properly
            }}
          >
            <svg
              className="h-8 w-8 text-white hover:text-[#D7FF00] transition-colors duration-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          style={{
            touchAction: 'pan-y', // Allow vertical scrolling
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            overscrollBehavior: 'contain', // Prevent pull-to-refresh
            userSelect: 'none', // Prevent unwanted text selection
            zIndex: 100 // Ensure it's above other elements
          }}
          className="w-[300px] bg-[#14151A] border-r border-[#2A2B31] overflow-y-auto p-0"
        >
          <div className="flex flex-col gap-4 pt-8">
            {navigationSections.map((section, sectionIndex) => (
              <React.Fragment key={section.id}>
                {/* Section divider for non-first sections */}
                {sectionIndex > 0 && (
                  <div className="mt-6 px-4 py-2 text-[#D7FF00] font-heading text-sm font-bold border-t border-[#2A2B31]/50 pt-6">
                    {section.title}
                  </div>
                )}
                {/* First section (MENU) gets special treatment */}
                {sectionIndex === 0 && (
                  <div className="px-4 py-2 text-[#D7FF00] font-heading text-base font-bold">
                    {section.title}
                  </div>
                )}
                
                {/* Section items */}
                {section.items.map((item) => {
                  const label = typeof item.label === 'function' 
                    ? item.label(labelProps) 
                    : item.label;
                  
                  return (
                    <MobileNavLink
                      key={item.id}
                      href={item.href}
                      label={label}
                      onClose={() => setOpenMobile(false)}
                      isTitle={item.id === "home"}
                      isExternal={item.isExternal}
                    />
                  );
                })}
              </React.Fragment>
            ))}

            <div className="mt-6 px-4 border-t border-[#2A2B31]/50 pt-6 space-y-3">
              {/* Authentication section */}
              {!user && (
                <div onClick={() => setOpenMobile(false)}>
                  <AuthSection 
                    user={undefined} /* Force undefined instead of null/undefined to match type */
                    handleLogout={handleLogout} 
                    isMobile={true} 
                    onMobileAction={() => setOpenMobile(false)}
                  />
                </div>
              )}

              <Button
                onClick={() => {
                  setOpenMobile(false);
                  window.open("https://www.goated.com/r/SPIN", "_blank");
                }}
                className="w-full bg-[#D7FF00] text-[#14151A] hover:bg-[#D7FF00]/90 transition-colors font-bold group"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  minHeight: '50px' // Larger touch target
                }}
              >
                <span className="flex items-center gap-1">
                  PLAY NOW
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24"
                    className="ml-1"
                    aria-hidden="true"
                  >
                    <path 
                      fill="currentColor" 
                      fillOpacity="0" 
                      stroke="currentColor" 
                      strokeDasharray="40" 
                      strokeDashoffset="40" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M8 6l10 6l-10 6Z"
                    >
                      <animate 
                        fill="freeze" 
                        attributeName="fill-opacity" 
                        begin="0s" 
                        dur="0.8s" 
                        values="0;1" 
                      />
                      <animate 
                        fill="freeze" 
                        attributeName="stroke-dashoffset" 
                        dur="0.8s" 
                        values="40;0" 
                      />
                    </path>
                  </svg>
                </span>
              </Button>

              {isAuthenticated && (
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    minHeight: '50px' // Larger touch target
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default React.memo(MobileNavigation);
