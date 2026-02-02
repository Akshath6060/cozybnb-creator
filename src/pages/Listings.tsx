import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PropertyCard } from '@/components/PropertyCard';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Property, Category } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X, Map, List } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Lazy load the map component to avoid SSR issues with Leaflet
const PropertyMap = lazy(() => import('@/components/PropertyMap').then(mod => ({ default: mod.PropertyMap })));

export default function Listings() {
  const [searchParams] = useSearchParams();
  const locationQuery = searchParams.get('location') || '';

  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>();
  const { user } = useAuth();

  const fetchProperties = async () => {
    setLoading(true);
    let query = supabase.from('properties').select('*');

    if (selectedCategory !== 'All') {
      query = query.eq('category', selectedCategory);
    }

    if (locationQuery) {
      query = query.ilike('location', `%${locationQuery}%`);
    }

    query = query
      .gte('price_per_night', priceRange[0])
      .lte('price_per_night', priceRange[1]);

    const { data, error } = await query.order('rating', { ascending: false });

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
  }, [selectedCategory, priceRange, locationQuery]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

      <main className="flex-1 flex flex-col">
        {/* Header bar */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {locationQuery
                  ? `Properties in "${locationQuery}"`
                  : selectedCategory === 'All'
                  ? 'All properties'
                  : `${selectedCategory} properties`}
              </h1>
              <p className="text-muted-foreground">
                {properties.length} properties found
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={showMap ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                {showMap ? 'List only' : 'Show map'}
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-4">
                      <Label>Price range (per night)</Label>
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        max={1000}
                        step={10}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}+</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setPriceRange([0, 1000])}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Split view content */}
        <div className={`flex-1 flex ${showMap ? 'flex-row' : 'flex-col'}`}>
          {/* Property list */}
          <div className={`overflow-auto ${showMap ? 'w-1/2 lg:w-3/5 border-r border-border' : 'w-full'}`}>
            <div className="p-4">
              {loading ? (
                <div className={`grid gap-6 ${showMap ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
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
                  <p className="text-muted-foreground text-lg">No properties found.</p>
                  <p className="text-muted-foreground">Try adjusting your filters.</p>
                </div>
              ) : (
                <div className={`grid gap-6 ${showMap ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className={`transition-all duration-200 rounded-xl ${
                        selectedPropertyId === property.id 
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                      onMouseEnter={() => setSelectedPropertyId(property.id)}
                      onMouseLeave={() => setSelectedPropertyId(undefined)}
                    >
                      <PropertyCard
                        property={property}
                        isFavorite={favorites.includes(property.id)}
                        onFavoriteChange={fetchFavorites}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map view */}
          {showMap && (
            <div className="w-1/2 lg:w-2/5 sticky top-0 h-[calc(100vh-200px)]">
              <Suspense fallback={
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
                <PropertyMap
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  onPropertySelect={setSelectedPropertyId}
                />
              </Suspense>
            </div>
          )}
        </div>
      </main>

      {!showMap && <Footer />}
    </div>
  );
}
