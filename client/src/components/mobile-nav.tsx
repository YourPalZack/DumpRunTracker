import { Link, useLocation } from "wouter";
import { Home, List, Calendar, User } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40">
      <div className="grid grid-cols-4 h-16">
        <NavItem 
          href="/" 
          icon={<Home className="h-5 w-5" />} 
          label="Home" 
          active={location === "/"} 
        />
        
        <NavItem 
          href="/my-runs" 
          icon={<List className="h-5 w-5" />} 
          label="My Runs" 
          active={location === "/my-runs"} 
        />
        
        <NavItem 
          href="/schedule" 
          icon={<Calendar className="h-5 w-5" />} 
          label="Schedule" 
          active={location === "/schedule"} 
        />
        
        <NavItem 
          href="/profile" 
          icon={<User className="h-5 w-5" />} 
          label="Profile" 
          active={location === "/profile"} 
        />
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link href={href}>
      <a className={`
        flex flex-col items-center justify-center px-4 py-2
        ${active ? 'text-primary' : 'text-neutral-600 hover:text-primary'}
      `}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </a>
    </Link>
  );
}
