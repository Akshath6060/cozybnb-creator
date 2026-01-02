import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HeroSection() {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/listings${location ? `?location=${encodeURIComponent(location)}` : ''}`);
  };

  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Find your next <span className="text-primary">adventure</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Discover unique places to stay around the world
          </p>

          {/* Search Box */}
          <div className="bg-background rounded-2xl shadow-lg border border-border p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block text-left">
                  Where
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search destinations"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 border-0 bg-muted/50 focus-visible:ring-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block text-left">
                  When
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Add dates"
                    className="pl-10 border-0 bg-muted/50 focus-visible:ring-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block text-left">
                  Guests
                </label>
                <div className="relative flex items-center gap-2">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Add guests"
                    className="pl-10 border-0 bg-muted/50 focus-visible:ring-1"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleSearch}
              size="lg"
              className="w-full md:w-auto mt-4 gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
