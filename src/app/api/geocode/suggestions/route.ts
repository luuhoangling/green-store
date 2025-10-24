import { NextRequest, NextResponse } from 'next/server';

// Throttle mechanism - simple in-memory throttle
let lastCall = 0;
const THROTTLE_MS = 500; // 500ms for suggestions

async function throttledGeocodeSuggestions(query: string) {
  const now = Date.now();
  const timeSinceLastCall = now - lastCall;
  
  if (timeSinceLastCall < THROTTLE_MS) {
    const waitTime = THROTTLE_MS - timeSinceLastCall;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastCall = Date.now();
  
  const encodedQuery = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodedQuery}&countrycodes=vn&addressdetails=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GreenStore/1.0 (greenstore@example.com)',
        'Accept-Language': 'vi'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return data.map((result: any) => ({
        display_name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.address || {},
        place_id: result.place_id
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Geocoding suggestions error:', error);
    throw new Error('Geocoding service unavailable');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 3) {
      return NextResponse.json([]);
    }
    
    const suggestions = await throttledGeocodeSuggestions(query.trim());
    return NextResponse.json(suggestions);
    
  } catch (error) {
    console.error('Geocode suggestions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
