
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, User, Settings, UserPlus, BookOpen, BarChart3, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
      className: "bg-blue-100 text-blue-900 border-blue-500",
    });
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user || !user.user_metadata?.full_name) return 'U';
    
    const nameParts = user.user_metadata.full_name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/90 backdrop-blur transition-all duration-300 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2 group transition-all duration-300 hover:scale-105">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden md:block">
            Grade Guardian
          </span>
        </Link>
        
        {/* Navigation Menu */}
        {user && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Students
            </Link>
            <Link 
              to="/performance-report" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/performance-report' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Reports
            </Link>
            <Link 
              to="/brand-sentiment" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/brand-sentiment' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-1" />
              Brand Sentiment
            </Link>
          </nav>
        )}
        
        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 p-1 ring-2 ring-primary/20 hover:ring-primary/30 bg-primary/5 hover:bg-primary/10 transition-all duration-300">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 animate-in slide-in-from-top-1 duration-200">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 cursor-pointer hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button className="shadow-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:shadow-md">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
