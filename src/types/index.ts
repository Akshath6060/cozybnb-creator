export interface Property {
  id: string;
  host_id: string | null;
  title: string;
  description: string | null;
  location: string;
  address: string | null;
  price_per_night: number;
  cleaning_fee: number | null;
  service_fee: number | null;
  max_guests: number | null;
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;
  property_type: string | null;
  category: string | null;
  amenities: string[] | null;
  rating: number | null;
  review_count: number | null;
  image_url: string | null;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Favorite {
  id: string;
  property_id: string;
  user_id: string;
  created_at: string;
}

export type Category = 'All' | 'Beach' | 'Mountain' | 'City' | 'Lake' | 'Countryside' | 'Desert';

export type AppRole = 'admin' | 'moderator' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}
