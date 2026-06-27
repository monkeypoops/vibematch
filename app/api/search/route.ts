import { NextResponse } from 'next/server';

// Types for Google Places API response
interface GooglePlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

interface GooglePlace {
  place_id: string;
  name: string;
  types: string[];
  rating?: number;
  photos?: GooglePlacePhoto[];
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  vicinity?: string;
}

interface GooglePlacesResponse {
  status: string;
  results: GooglePlace[];
  error_message?: string;
}

// Our frontend restaurant type
interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  distance: string;
  rating: string | number;
  image: string;
  address: string;
  place_id: string;
  phone: string | null;
  website: string | null;
  features: string[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'restaurants in NYC';
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // If no API key, return mock data for demo
  if (!apiKey) {
    console.warn('Google Places API key is missing. Returning mock data.');
    const mockRestaurants: Restaurant[] = [
      {
        id: 'mock1',
        name: 'Pizza Place NYC',
        cuisine: 'Italian',
        distance: '0.5',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=400&h=300&fit=crop',
        address: '123 Mock St, New York, NY',
        place_id: 'mock1',
        phone: null,
        website: null,
        features: ['🍕 Pizza', '🍸 Cocktails'],
      },
      {
        id: 'mock2',
        name: 'Burger Joint',
        cuisine: 'American',
        distance: '1.2',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
        address: '456 Fake Ave, New York, NY',
        place_id: 'mock2',
        phone: null,
        website: null,
        features: ['🍔 Burgers', '🍟 Fries'],
      },
    ];
    return NextResponse.json({ restaurants: mockRestaurants });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data: GooglePlacesResponse = await response.json();

    if (data.status === 'OK') {
      const restaurants: Restaurant[] = data.results.slice(0, 12).map((place: GooglePlace) => {
        const photoRef = place.photos?.[0]?.photo_reference;
        const image = photoRef
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${apiKey}`
          : 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=400&h=300&fit=crop';

        // Build a cuisine label from first type (if available)
        const cuisine = place.types?.[0] || 'Restaurant';

        // Extract features like "bar", "cafe", etc.
        const featureTypes = ['bar', 'cafe', 'restaurant', 'food', 'bakery', 'meal_takeaway', 'meal_delivery'];
        const features = place.types
          ?.filter((t: string) => featureTypes.includes(t))
          .map((t: string) => `🍽️ ${t}`) || [];

        return {
          id: place.place_id,
          name: place.name,
          cuisine,
          distance: 'N/A',
          rating: place.rating || 'N/A',
          image,
          address: place.formatted_address || place.vicinity || 'Address not available',
          place_id: place.place_id,
          phone: place.formatted_phone_number || null,
          website: place.website || null,
          features,
        };
      });

      return NextResponse.json({ restaurants });
    } else {
      return NextResponse.json(
        { error: data.error_message || 'No restaurants found. Try a different search.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    );
  }
}