import { NextRequest, NextResponse } from 'next/server';

// Throttle mechanism - simple in-memory throttle
let lastCall = 0;
const THROTTLE_MS = 1000; // 1 second

async function throttledGeocode(address: string) {
  const now = Date.now();
  const timeSinceLastCall = now - lastCall;
  
  if (timeSinceLastCall < THROTTLE_MS) {
    const waitTime = THROTTLE_MS - timeSinceLastCall;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastCall = Date.now();
  
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodedAddress}`;
  
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
      const result = data[0];
      return {
        found: true,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name
      };
    } else {
      return { found: false };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Geocoding service unavailable');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }
    
    const result = await throttledGeocode(query.trim());
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




