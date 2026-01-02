import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Property, Review } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Star,
  Heart,
  Share,
  MapPin,
  Users,
  Bed,
  Bath,
  Home,
  Wifi,
  Car,
  Utensils,
  Waves,
  Flame,
  Wind,
  CalendarIcon,
  Minus,
  Plus,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  Parking: Car,
  Kitchen: Utensils,
  Pool: Waves,
  'Hot Tub': Waves,
  Fireplace: Flame,
  'Air Conditioning': Wind,
};

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error:', error);
        toast.error('Property not found');
        navigate('/');
        return;
      }

      setProperty(data);
      setLoading(false);
    };

    const fetchReviews = async () => {
      if (!id) return;

      const { data } = await supabase
        .from('reviews')
        .select('*, profile:profiles(*)')
        .eq('property_id', id)
        .order('created_at', { ascending: false });

      setReviews(data || []);
    };

    const checkFavorite = async () => {
      if (!user || !id) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('property_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsFavorite(!!data);
    };

    fetchProperty();
    fetchReviews();
    checkFavorite();
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save properties');
      return;
    }

    if (isFavorite) {
      await supabase.from('favorites').delete().eq('property_id', id).eq('user_id', user.id);
      setIsFavorite(false);
      toast.success('Removed from favorites');
    } else {
      await supabase.from('favorites').insert({ property_id: id, user_id: user.id });
      setIsFavorite(true);
      toast.success('Added to favorites');
    }
  };

  const calculateTotal = () => {
    if (!property || !checkIn || !checkOut) return null;

    const nights = differenceInDays(checkOut, checkIn);
    if (nights <= 0) return null;

    const subtotal = property.price_per_night * nights;
    const cleaningFee = property.cleaning_fee || 0;
    const serviceFee = property.service_fee || 0;
    const total = subtotal + cleaningFee + serviceFee;

    return { nights, subtotal, cleaningFee, serviceFee, total };
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book');
      navigate('/auth');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const totals = calculateTotal();
    if (!totals) {
      toast.error('Invalid dates selected');
      return;
    }

    setBooking(true);

    const { error } = await supabase.from('bookings').insert({
      property_id: id,
      user_id: user.id,
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
      guests,
      total_price: totals.total,
    });

    if (error) {
      toast.error('Failed to create booking');
    } else {
      toast.success('Booking confirmed!');
      navigate('/profile');
    }

    setBooking(false);
  };

  const totals = calculateTotal();

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="aspect-[2/1] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">{property.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Star className="w-4 h-4 fill-foreground text-foreground" />
              <span className="font-medium text-foreground">{property.rating}</span>
              <span>·</span>
              <span>{property.review_count} reviews</span>
              <span>·</span>
              <MapPin className="w-4 h-4" />
              <span>{property.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Share className="w-4 h-4" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleFavorite}>
              <Heart className={cn('w-4 h-4', isFavorite && 'fill-primary text-primary')} />
              Save
            </Button>
          </div>
        </div>

        {/* Main Image */}
        <div className="rounded-xl overflow-hidden mb-8">
          <img
            src={property.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200'}
            alt={property.title}
            className="w-full aspect-[2/1] object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold">
                  {property.property_type} hosted by Owner
                </h2>
                <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {property.max_guests} guests
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {property.bedrooms} bedrooms
                  </span>
                  <span className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    {property.beds} beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {property.bathrooms} baths
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-semibold">H</span>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-border">
              <h3 className="text-lg font-semibold mb-4">About this place</h3>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="pb-6 border-b border-border">
              <h3 className="text-lg font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities?.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Home;
                  return (
                    <div key={amenity} className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 fill-foreground" />
                {property.rating} · {property.review_count} reviews
              </h3>
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.slice(0, 4).map((review) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="font-medium">G</span>
                        </div>
                        <div>
                          <p className="font-medium">Guest</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(review.created_at), 'MMMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet.</p>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-border rounded-xl p-6 shadow-lg">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-semibold">${property.price_per_night}</span>
                <span className="text-muted-foreground">night</span>
              </div>

              <div className="border border-border rounded-lg overflow-hidden mb-4">
                <div className="grid grid-cols-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-3 text-left border-r border-b border-border hover:bg-muted/50 transition-colors">
                        <p className="text-xs font-semibold uppercase">Check-in</p>
                        <p className="text-sm">
                          {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Add date'}
                        </p>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-3 text-left border-b border-border hover:bg-muted/50 transition-colors">
                        <p className="text-xs font-semibold uppercase">Checkout</p>
                        <p className="text-sm">
                          {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Add date'}
                        </p>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date < (checkIn || new Date())}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold uppercase mb-2">Guests</p>
                  <div className="flex items-center justify-between">
                    <span>{guests} guest{guests > 1 ? 's' : ''}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setGuests(Math.min(property.max_guests || 10, guests + 1))}
                        disabled={guests >= (property.max_guests || 10)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleBooking}
                disabled={booking || !checkIn || !checkOut}
              >
                {booking ? 'Booking...' : 'Reserve'}
              </Button>

              {totals && (
                <>
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    You won't be charged yet
                  </p>
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="underline">
                        ${property.price_per_night} x {totals.nights} nights
                      </span>
                      <span>${totals.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Cleaning fee</span>
                      <span>${totals.cleaningFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Service fee</span>
                      <span>${totals.serviceFee}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${totals.total}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
