import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { z } from 'zod';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  location: z.string().min(2, 'Location is required').max(100),
  address: z.string().max(200).optional(),
  price_per_night: z.number().min(1, 'Price must be at least $1'),
  max_guests: z.number().min(1).max(20),
  bedrooms: z.number().min(0).max(20),
  beds: z.number().min(1).max(50),
  bathrooms: z.number().min(1).max(20),
  property_type: z.string(),
  category: z.string(),
  image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

const categories = ['Beach', 'Mountain', 'City', 'Lake', 'Countryside', 'Desert'];
const propertyTypes = ['Apartment', 'House', 'Villa', 'Cabin', 'Cottage', 'Condo', 'Loft', 'Studio'];

export default function AddListing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    price_per_night: '',
    max_guests: '2',
    bedrooms: '1',
    beds: '1',
    bathrooms: '1',
    property_type: 'Apartment',
    category: 'City',
    image_url: '',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const validatedData = listingSchema.parse({
        ...formData,
        price_per_night: parseFloat(formData.price_per_night) || 0,
        max_guests: parseInt(formData.max_guests) || 2,
        bedrooms: parseInt(formData.bedrooms) || 1,
        beds: parseInt(formData.beds) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
      });

      const { error } = await supabase.from('properties').insert({
        host_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        address: validatedData.address || null,
        price_per_night: validatedData.price_per_night,
        max_guests: validatedData.max_guests,
        bedrooms: validatedData.bedrooms,
        beds: validatedData.beds,
        bathrooms: validatedData.bathrooms,
        property_type: validatedData.property_type,
        category: validatedData.category,
        image_url: validatedData.image_url || null,
      });

      if (error) {
        console.error('Error creating listing:', error);
        toast.error('Failed to create listing');
        return;
      }

      toast.success('Listing created successfully!');
      navigate('/my-listings');
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            fieldErrors[e.path[0].toString()] = e.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Cozy beachfront apartment"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your property..."
                  rows={4}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Miami, Florida"
                  />
                  {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Beach Road"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_night">Price/Night ($) *</Label>
                  <Input
                    id="price_per_night"
                    type="number"
                    min="1"
                    value={formData.price_per_night}
                    onChange={(e) => handleChange('price_per_night', e.target.value)}
                    placeholder="100"
                  />
                  {errors.price_per_night && <p className="text-sm text-destructive">{errors.price_per_night}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_guests">Max Guests</Label>
                  <Input
                    id="max_guests"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_guests}
                    onChange={(e) => handleChange('max_guests', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.bedrooms}
                    onChange={(e) => handleChange('bedrooms', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beds">Beds</Label>
                  <Input
                    id="beds"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.beds}
                    onChange={(e) => handleChange('beds', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange('bathrooms', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select value={formData.property_type} onValueChange={(v) => handleChange('property_type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image_url && <p className="text-sm text-destructive">{errors.image_url}</p>}
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Listing'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
