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
      <header className="glass sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <a className="flex items-center group">
                    <Recycle className="text-primary mr-2 h-7 w-7 group-hover:animate-spin-slow transition-all" />
                    <span className="text-2xl font-bold gradient-text">DumpRun</span>
                  </a>
                </Link>
              </div>
              
              <nav className="hidden md:ml-8 md:flex md:space-x-6">
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
            </div>
            
            <div className="flex items-center">
              <button 
                type="button" 
                className="p-2 rounded-lg hover:bg-muted transition-colors relative group"
              >
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse"></span>
                </div>
              </button>
              
              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
                      <Avatar className="h-10 w-10 shadow-md">
                        <AvatarImage src="" alt={user?.username} />
                        <AvatarFallback className="gradient-bg-primary text-white font-semibold">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass border-border/50 shadow-xl">
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
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          relative px-3 py-2 rounded-lg inline-flex items-center text-sm font-medium transition-all duration-200
          ${active 
            ? 'text-primary bg-primary/10' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
        `}
      >
        {children}
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
        )}
      </a>
    </Link>
  );
}
