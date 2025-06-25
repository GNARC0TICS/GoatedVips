import React from "react";
import { Link } from "wouter";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AdminMenuProps = {};

export function AdminMenu({}: AdminMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center transform transition-all duration-300 hover:scale-110"
        >
          <Settings className="h-4 w-4 md:h-5 md:w-5 text-white hover:text-[#D7FF00] transition-colors duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1A1B21] border-[#2A2B31]">
        <DropdownMenuLabel className="text-[#D7FF00]">Admin Panel</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/admin/user-management">
          <DropdownMenuItem className="cursor-pointer text-white">
            User Management
          </DropdownMenuItem>
        </Link>
        <Link href="/admin/wager-races">
          <DropdownMenuItem className="cursor-pointer text-white">
            Wager Races
          </DropdownMenuItem>
        </Link>
        <Link href="/admin/bonus-codes">
          <DropdownMenuItem className="cursor-pointer text-white">
            Bonus Codes
          </DropdownMenuItem>
        </Link>
        <Link href="/admin/notifications">
          <DropdownMenuItem className="cursor-pointer text-white">
            Notifications
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AdminMenu;
