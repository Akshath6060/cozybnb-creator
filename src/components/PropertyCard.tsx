import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Property } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
}

export function PropertyCard({ property, isFavorite = false, onFavoriteChange }: PropertyCardProps) {
  const { user } = useAuth();
  const [favorite, setFavorite] = useState(isFavorite);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to save properties');
      return;
    }

    try {
      if (favorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('property_id', property.id)
          .eq('user_id', user.id);
        setFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('favorites')
          .insert({ property_id: property.id, user_id: user.id });
        setFavorite(true);
        toast.success('Added to favorites');
      }
      onFavoriteChange?.();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={property.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
          alt={property.title}
          className={cn(
            'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
        />
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors',
              favorite ? 'fill-primary text-primary' : 'text-foreground'
            )}
          />
        </button>
        {property.is_featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md">
            <span className="text-xs font-medium">Guest favorite</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground truncate">{property.location}</h3>
          {property.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-foreground text-foreground" />
              <span className="text-sm">{property.rating}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{property.title}</p>
        <p className="text-sm text-muted-foreground">{property.property_type}</p>
        <p className="mt-1">
          <span className="font-semibold">${property.price_per_night}</span>
          <span className="text-muted-foreground"> night</span>
        </p>
      </div>
    </Link>
  );
}
