import { NextRequest, NextResponse } from 'next/server';
import { parseImageWithVision } from '@/lib/ai-utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Upload PNG or JPG only.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Parse with Vision AI
    try {
      const result = await parseImageWithVision(base64);

      return NextResponse.json({
        flights: result.flights,
        hotels: result.hotels,
        raw_text: 'Image processed successfully',
      });
    } catch (aiError) {
      console.error('AI parsing error:', aiError);
      return NextResponse.json(
        { error: 'Could not extract data from image. Try a clearer image.' },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
