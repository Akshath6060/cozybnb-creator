import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PropertyCard } from '@/components/PropertyCard';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Property, Category } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export default function Index() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProperties = async () => {
    setLoading(true);
    let query = supabase.from('properties').select('*');

    if (selectedCategory !== 'All') {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query.order('is_featured', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      setProperties(data || []);
    }
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const { data } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', user.id);

    setFavorites(data?.map((f) => f.property_id) || []);
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedCategory]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <h2 className="text-2xl font-semibold mb-6">
          {selectedCategory === 'All' ? 'Featured stays' : `${selectedCategory} properties`}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No properties found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.includes(property.id)}
                onFavoriteChange={fetchFavorites}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
