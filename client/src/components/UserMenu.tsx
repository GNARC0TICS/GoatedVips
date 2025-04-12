import React from "react";
import { Link } from "wouter";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SelectUser } from "@db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  user: SelectUser;
  handleLogout: () => Promise<void>;
};

export function UserMenu({ user, handleLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 md:gap-2 text-white px-2 md:px-4 h-8 md:h-10 hover:text-[#D7FF00] transition-all duration-300"
        >
          <User className="h-5 w-5" />
          <span className="hidden md:inline">
            {user.username}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#1A1B21] border-[#2A2B31]">
        <DropdownMenuLabel className="text-[#D7FF00]">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/user/${user.id}`}>
          <DropdownMenuItem className="cursor-pointer text-white">
            Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/notification-preferences">
          <DropdownMenuItem className="cursor-pointer text-white">
            Settings
          </DropdownMenuItem>
        </Link>
        {user.isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[#D7FF00]">Admin Panel</DropdownMenuLabel>
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
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-500 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
