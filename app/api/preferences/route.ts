import { NextRequest, NextResponse } from 'next/server';
import { calculatePreferenceWeights } from '@/lib/recommendation-engine';
import { z } from 'zod';

const PreferencesSchema = z.object({
  budget: z.number().positive().optional(),
  vibe: z.string().optional(),
  purpose: z.string().optional(),
  food: z.array(z.string()).optional(),
  pace: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = PreferencesSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid preferences data', details: validationResult.error },
        { status: 400 }
      );
    }

    const preferences = validationResult.data;

    // Calculate preference weights
    const weights = calculatePreferenceWeights(preferences);

    return NextResponse.json({
      weights,
      preferences,
    });
  } catch (error) {
    console.error('Preferences API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
