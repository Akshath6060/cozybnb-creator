import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types';

// Fix for default marker icons in Leaflet with bundlers
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
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
}: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView([39.8283, -98.5795], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    properties.forEach((property) => {
      const coords = getPropertyCoordinates(property);
      const isSelected = property.id === selectedPropertyId;

      const priceIcon = L.divIcon({
        className: 'custom-price-marker',
        html: `<div class="price-marker ${isSelected ? 'selected' : ''}">$${property.price_per_night}</div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });

      const marker = L.marker(coords, { icon: priceIcon })
        .addTo(mapRef.current!)
        .on('click', () => onPropertySelect?.(property.id));

      // Add popup
      const popupContent = `
        <a href="/property/${property.id}" class="block w-64 no-underline" style="color: inherit;">
          <img
            src="${property.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}"
            alt="${property.title}"
            style="width: 100%; height: 128px; object-fit: cover; border-radius: 8px 8px 0 0;"
          />
          <div style="padding: 12px; background: white; border-radius: 0 0 8px 8px;">
            <h3 style="font-weight: 600; font-size: 14px; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${property.title}</h3>
            <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">${property.location}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
              <span style="font-weight: 600;">$${property.price_per_night}/night</span>
              ${property.rating ? `<span style="font-size: 12px;">★ ${property.rating}</span>` : ''}
            </div>
          </div>
        </a>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'property-popup',
      });

      markersRef.current.set(property.id, marker);
    });
  }, [properties, selectedPropertyId, onPropertySelect]);

  // Update marker styles when selection changes
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const property = properties.find((p) => p.id === id);
      if (!property) return;

      const isSelected = id === selectedPropertyId;
      const priceIcon = L.divIcon({
        className: 'custom-price-marker',
        html: `<div class="price-marker ${isSelected ? 'selected' : ''}">$${property.price_per_night}</div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });

      marker.setIcon(priceIcon);
    });
  }, [selectedPropertyId, properties]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
}
