import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom price marker icon
const createPriceMarker = (price: number, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-price-marker',
    html: `<div class="price-marker ${isSelected ? 'selected' : ''}">$${price}</div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
  });
};

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
  center?: [number, number];
  zoom?: number;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Mock coordinates for demo - in production, you'd store lat/lng in your properties table
const getPropertyCoordinates = (property: Property): [number, number] => {
  // Generate consistent coordinates based on property ID
  const hash = property.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Generate coordinates roughly in the US
  const lat = 35 + (Math.abs(hash) % 15);
  const lng = -120 + (Math.abs(hash >> 8) % 50);
  
  return [lat, lng];
};

export function PropertyMap({
  properties,
  selectedPropertyId,
  onPropertySelect,
  center = [39.8283, -98.5795], // Center of US
  zoom = 4,
}: PropertyMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} zoom={zoom} />
      
      {properties.map((property) => {
        const coords = getPropertyCoordinates(property);
        const isSelected = property.id === selectedPropertyId;
        
        return (
          <Marker
            key={property.id}
            position={coords}
            icon={createPriceMarker(property.price_per_night, isSelected)}
            eventHandlers={{
              click: () => onPropertySelect?.(property.id),
            }}
          >
            <Popup className="property-popup">
              <Link 
                to={`/property/${property.id}`}
                className="block w-64 no-underline text-foreground"
              >
                <img
                  src={property.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}
                  alt={property.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <div className="p-3 bg-card rounded-b-lg">
                  <h3 className="font-semibold text-sm line-clamp-1">{property.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{property.location}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold">${property.price_per_night}/night</span>
                    {property.rating && (
                      <span className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-foreground" />
                        {property.rating}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
