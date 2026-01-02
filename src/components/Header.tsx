import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, Heart, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-primary hidden sm:block">airbnb</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center border border-border rounded-full shadow-sm hover:shadow-md transition-shadow">
            <button className="px-4 py-2 text-sm font-medium border-r border-border">
              Anywhere
            </button>
            <button className="px-4 py-2 text-sm font-medium border-r border-border">
              Any week
            </button>
            <button className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
              Add guests
              <div className="p-2 bg-primary rounded-full">
                <Search className="w-4 h-4 text-primary-foreground" />
              </div>
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              Become a Host
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Globe className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 rounded-full p-2 pl-3">
                  <Menu className="w-4 h-4" />
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/favorites')}>
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlists
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/auth')}>
                      <span className="font-medium">Sign up</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/auth?mode=login')}>
                      Log in
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>Help Center</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
