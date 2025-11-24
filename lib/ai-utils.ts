import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parse travel data from an image using Vision AI
 */
export async function parseImageWithVision(
  imageBase64: string
): Promise<{ flights: any[]; hotels: any[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a travel data extraction model. Return clean JSON only. Extract flight and hotel information from images.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract all flight and hotel data from this screenshot.
Return ONLY valid JSON with fields:
flights: [{airline, price, departure_time, arrival_time, duration, stopovers}]
hotels: [{name, price_per_night, rating, location}]

If no flights are found, return empty array for flights. Same for hotels.
Ensure all prices are numbers without currency symbols.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from Vision API');
    }

    const parsed = JSON.parse(content);
    return {
      flights: parsed.flights || [],
      hotels: parsed.hotels || [],
    };
  } catch (error) {
    console.error('Vision API error:', error);
    throw new Error('Failed to parse image with Vision API');
  }
}

/**
 * Generate travel itinerary using AI
 */
export async function generateItinerary(params: {
  destination: string;
  dates: string[];
  preferences: any;
  selectedFlight?: any;
  selectedHotel?: any;
}): Promise<{
  itinerary: any[];
  summary: string;
  estimated_total_cost: number;
}> {
  try {
    const { destination, dates, preferences, selectedFlight, selectedHotel } =
      params;

    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    const numDays = dates.length;

    const flightCost = selectedFlight ? selectedFlight.price : 0;
    const hotelCost = selectedHotel ? selectedHotel.pricePerNight * numDays : 0;
    const remainingBudget = preferences.budget - flightCost - hotelCost;

    const prompt = `Create a detailed daily travel itinerary for a trip to ${destination} from ${startDate} to ${endDate} (${numDays} days).

User preferences:
- TOTAL BUDGET: $${preferences.budget} (STRICT - DO NOT EXCEED)
- Trip vibe: ${preferences.vibe}
- Purpose: ${preferences.purpose || 'leisure'}
- Food preferences: ${preferences.food?.join(', ') || 'flexible'}
- Pace: ${preferences.pace || 'medium'}

${selectedFlight ? `Selected flight: ${selectedFlight.airline}, $${selectedFlight.price}` : ''}
${selectedHotel ? `Selected hotel: ${selectedHotel.name}, $${selectedHotel.pricePerNight}/night for ${numDays} nights = $${hotelCost}` : ''}

BUDGET BREAKDOWN:
- Flight cost: $${flightCost}
- Hotel cost: $${hotelCost}
- Remaining for activities/food: $${remainingBudget}
- TOTAL MUST NOT EXCEED: $${preferences.budget}

IMPORTANT: The estimated_total_cost in your response MUST be less than or equal to $${preferences.budget}.
Calculate daily costs carefully to stay within budget. Include flight and hotel costs in the total.

Return ONLY valid JSON with this exact structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "${dates[0]}",
      "morning": "Activity description",
      "afternoon": "Activity description",
      "evening": "Activity description",
      "estimated_cost": 150
    }
  ],
  "summary": "A brief 2-3 sentence overview of the trip",
  "estimated_total_cost": ${preferences.budget - 100}
}

Make the itinerary engaging, realistic, and aligned with the user's preferences while STRICTLY staying within the $${preferences.budget} budget.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional travel planner who ALWAYS respects budget constraints. Create detailed, realistic itineraries in JSON format that NEVER exceed the specified budget.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from AI');
    }

    const result = JSON.parse(content);
    return {
      itinerary: result.itinerary || [],
      summary: result.summary || '',
      estimated_total_cost: result.estimated_total_cost || 0,
    };
  } catch (error) {
    console.error('Itinerary generation error:', error);
    throw new Error('Failed to generate itinerary');
  }
}

/**
 * Transcribe audio to text using Whisper
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    return response.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}
