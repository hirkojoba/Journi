import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary } from '@/lib/ai-utils';
import { selectBestFlight, selectBestHotel } from '@/lib/recommendation-engine';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ItineraryRequestSchema = z.object({
  destination: z.string().min(1),
  dates: z.array(z.string()),
  preferences: z.object({
    budget: z.number().optional(),
    vibe: z.string().optional(),
    purpose: z.string().optional(),
    food: z.array(z.string()).optional(),
    pace: z.string().optional(),
  }),
  flights: z.array(z.any()).optional(),
  hotels: z.array(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = ItineraryRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }

    const { destination, dates, preferences, flights, hotels } = validationResult.data;

    // Select best flight and hotel using recommendation engine
    const selectedFlight = flights && flights.length > 0 ? selectBestFlight(flights) : null;
    const selectedHotel = hotels && hotels.length > 0 ? selectBestHotel(hotels, preferences.vibe) : null;

    // Generate itinerary with AI
    let itineraryData;
    try {
      itineraryData = await generateItinerary({
        destination,
        dates,
        preferences,
        selectedFlight,
        selectedHotel,
      });
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      return NextResponse.json(
        { error: 'Failed to generate itinerary. Please try again.' },
        { status: 422 }
      );
    }

    // Save to database
    const trip = await prisma.trip.create({
      data: {
        destination,
        startDate: new Date(dates[0]),
        endDate: new Date(dates[dates.length - 1]),
        budget: preferences.budget || 0,
        vibe: preferences.vibe || 'leisure',
      },
    });

    // Save flights
    if (flights && flights.length > 0) {
      await prisma.flight.createMany({
        data: flights.map((flight) => ({
          tripId: trip.id,
          airline: flight.airline,
          price: parseInt(flight.price) || 0,
          departTime: flight.departure_time || flight.departTime,
          arriveTime: flight.arrival_time || flight.arriveTime,
          duration: flight.duration,
          stopovers: parseInt(flight.stopovers) || 0,
        })),
      });
    }

    // Save hotels
    if (hotels && hotels.length > 0) {
      await prisma.hotel.createMany({
        data: hotels.map((hotel) => ({
          tripId: trip.id,
          name: hotel.name,
          pricePerNight: parseInt(hotel.price_per_night || hotel.pricePerNight) || 0,
          rating: parseFloat(hotel.rating) || 0,
          location: hotel.location || 'Unknown',
        })),
      });
    }

    // Save itinerary
    await prisma.itinerary.create({
      data: {
        tripId: trip.id,
        jsonData: JSON.stringify(itineraryData),
      },
    });

    return NextResponse.json({
      tripId: trip.id,
      selectedFlight,
      selectedHotel,
      itinerary: itineraryData.itinerary,
      summary: itineraryData.summary,
      estimated_total_cost: itineraryData.estimated_total_cost,
    });
  } catch (error) {
    console.error('Itinerary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
