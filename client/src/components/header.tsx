import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bell, ChevronDown, LogOut, User, Settings, Home, List, Calendar, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "./mobile-nav";
import { Recycle } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <a className="flex items-center">
                    <Recycle className="text-primary mr-2 h-6 w-6" />
                    <span className="text-xl font-bold text-primary">DumpRun</span>
                  </a>
                </Link>
              </div>
              
              {user ? (
                <nav className="hidden md:ml-6 md:flex md:space-x-8">
                  <NavLink href="/" active={location === "/"}>
                    <Home className="h-4 w-4 mr-1" />
                    Dashboard
                  </NavLink>
                  <NavLink href="/my-runs" active={location === "/my-runs"}>
                    <List className="h-4 w-4 mr-1" />
                    My Runs
                  </NavLink>
                  <NavLink href="/schedule" active={location === "/schedule"}>
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </NavLink>
                  <NavLink href="/notifications" active={location === "/notifications"}>
                    <Bell className="h-4 w-4 mr-1" />
                    Notifications
                  </NavLink>
                </nav>
              ) : (
                <nav className="hidden md:ml-6 md:flex md:space-x-8">
                  <NavLink href="/" active={location === "/"}>
                    <Home className="h-4 w-4 mr-1" />
                    Home
                  </NavLink>
                  <NavLink href="/auth" active={location === "/auth"}>
                    <User className="h-4 w-4 mr-1" />
                    Login/Register
                  </NavLink>
                </nav>
              )}
            </div>
            
            <div className="flex items-center">
              {user ? (
                <>
                  <button 
                    type="button" 
                    className="p-1 rounded-full text-neutral-600 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <span className="sr-only">View notifications</span>
                    <div className="relative">
                      <Bell className="h-6 w-6" />
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </div>
                  </button>
                  
                  <div className="ml-3 relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={user?.username} />
                            <AvatarFallback className="bg-primary text-white">
                              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="flex items-center justify-start gap-2 p-2">
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-neutral-600">@{user?.username}</p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile">
                            <a className="flex items-center cursor-pointer w-full">
                              <User className="mr-2 h-4 w-4" />
                              <span>Profile</span>
                            </a>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile">
                            <a className="flex items-center cursor-pointer w-full">
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Settings</span>
                            </a>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer" 
                          onSelect={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <Button 
                  onClick={() => window.location.href = "/auth"}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Login / Register
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      <MobileNav />
    </div>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        className={`
          border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium
          ${active 
            ? 'border-primary text-neutral-900' 
            : 'border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-800'}
        `}
      >
        {children}
      </a>
    </Link>
  );
}
