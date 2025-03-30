import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export function BonusCodeHeroCard() {
  const { isAuthenticated } = useAuth();

  return (
    <Card className={cn(
      "relative overflow-hidden bg-[#1A1B21]/50 backdrop-blur-sm border border-[#2A2B31]",
      !isAuthenticated && "opacity-50 hover:opacity-75 transition-opacity group"
    )}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
      <CardHeader className="pt-6 px-6">
        <div className="flex justify-start mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48" className="text-[#D7FF00]">
            <defs>
              <mask id="ipTDatabaseCode0">
                <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
                  <path d="M34 12v9a9.98 9.98 0 0 0-7.442 3.32A9.96 9.96 0 0 0 24 31q.002.87.144 1.698a10.01 10.01 0 0 0 4.93 7.007C26.412 40.51 22.878 41 19 41c-8.284 0-15-2.239-15-5V12" />
                  <path fill="#555555" d="M34 12c0 2.761-6.716 5-15 5S4 14.761 4 12s6.716-5 15-5s15 2.239 15 5" />
                  <path d="M4 28c0 2.761 6.716 5 15 5c1.807 0 3.54-.106 5.144-.302M4 20c0 2.761 6.716 5 15 5c2.756 0 5.339-.248 7.558-.68" />
                  <path fill="#555555" d="M44 31c0 5.523-4.477 10-10 10c-1.79 0-3.472-.47-4.926-1.295A10.01 10.01 0 0 1 24 31c0-2.568.968-4.91 2.558-6.68A9.98 9.98 0 0 1 34 21c5.523 0 10 4.477 10 10" />
                  <path d="m37 29l2 2l-2 2m-6 0l-2-2l2-2" />
                </g>
              </mask>
            </defs>
            <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipTDatabaseCode0)" />
          </svg>
        </div>
        <CardTitle className="flex items-center justify-center gap-2 text-[#D7FF00]">
          <div className="flex items-center gap-1">
            Bonus Codes
            {!isAuthenticated && <Lock className="h-4 w-4 text-[#8A8B91]" />}
          </div>
          <Badge className="ml-2" variant="outline">
            Today
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <Link href="/bonus-codes">
            <Button variant="default" className="w-full bg-[#D7FF00] text-black hover:bg-[#b2d000]">
              View Bonus Codes
            </Button>
          </Link>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  className="w-full bg-[#2A2B31] text-[#8A8B91] cursor-not-allowed"
                  disabled
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Locked
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign in to access bonus codes and rewards</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}