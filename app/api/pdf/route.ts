import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // Fetch trip data from database
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        flights: true,
        hotels: true,
        itinerary: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = height - 50;

    // Title
    page.drawText('Journi Travel Plan', {
      x: 50,
      y: yPosition,
      size: 24,
      font: fontBold,
      color: rgb(0, 0.2, 0.6),
    });
    yPosition -= 40;

    // Trip Details
    page.drawText(`Destination: ${trip.destination}`, {
      x: 50,
      y: yPosition,
      size: 14,
      font: fontBold,
    });
    yPosition -= 25;

    page.drawText(`Dates: ${trip.startDate.toDateString()} - ${trip.endDate.toDateString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 20;

    page.drawText(`Budget: $${trip.budget}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 20;

    page.drawText(`Vibe: ${trip.vibe}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 35;

    // Flight Summary
    if (trip.flights && trip.flights.length > 0) {
      page.drawText('Flight Information:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: fontBold,
      });
      yPosition -= 25;

      const flight = trip.flights[0];
      page.drawText(`${flight.airline} - $${flight.price}`, {
        x: 60,
        y: yPosition,
        size: 11,
        font,
      });
      yPosition -= 18;

      page.drawText(`${flight.departTime} - ${flight.arriveTime} (${flight.duration})`, {
        x: 60,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 30;
    }

    // Hotel Summary
    if (trip.hotels && trip.hotels.length > 0) {
      page.drawText('Hotel Information:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: fontBold,
      });
      yPosition -= 25;

      const hotel = trip.hotels[0];
      page.drawText(`${hotel.name} - $${hotel.pricePerNight}/night`, {
        x: 60,
        y: yPosition,
        size: 11,
        font,
      });
      yPosition -= 18;

      page.drawText(`Rating: ${hotel.rating}/5 - ${hotel.location}`, {
        x: 60,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 30;
    }

    // Itinerary
    if (trip.itinerary) {
      const itineraryData = JSON.parse(trip.itinerary.jsonData);

      page.drawText('Itinerary:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: fontBold,
      });
      yPosition -= 25;

      if (itineraryData.summary) {
        const summaryLines = wrapText(itineraryData.summary, 70);
        for (const line of summaryLines) {
          page.drawText(line, {
            x: 60,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
        yPosition -= 10;
      }

      // Add day-by-day itinerary (first few days to fit on page)
      if (itineraryData.itinerary && Array.isArray(itineraryData.itinerary)) {
        for (let i = 0; i < Math.min(3, itineraryData.itinerary.length); i++) {
          if (yPosition < 100) break; // Stop if running out of space

          const day = itineraryData.itinerary[i];
          page.drawText(`Day ${day.day}:`, {
            x: 60,
            y: yPosition,
            size: 11,
            font: fontBold,
          });
          yPosition -= 18;

          if (day.morning) {
            page.drawText(`Morning: ${truncate(day.morning, 60)}`, {
              x: 70,
              y: yPosition,
              size: 9,
              font,
            });
            yPosition -= 14;
          }
          if (day.afternoon) {
            page.drawText(`Afternoon: ${truncate(day.afternoon, 60)}`, {
              x: 70,
              y: yPosition,
              size: 9,
              font,
            });
            yPosition -= 14;
          }
          yPosition -= 10;
        }
      }

      // Total cost
      if (itineraryData.estimated_total_cost && yPosition > 80) {
        yPosition -= 10;
        page.drawText(`Total Estimated Cost: $${itineraryData.estimated_total_cost}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: fontBold,
        });
      }
    }

    // Generate QR code (link to trip on web)
    const tripUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/trip/${tripId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(tripUrl);
    const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);

    page.drawImage(qrCodeImage, {
      x: width - 120,
      y: 30,
      width: 80,
      height: 80,
    });

    page.drawText('Scan for web version', {
      x: width - 130,
      y: 15,
      size: 8,
      font,
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Return PDF as response
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="journi-trip-${trip.destination}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'PDF generation failed. Try again.' },
      { status: 500 }
    );
  }
}

// Helper function to wrap text
function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

// Helper function to truncate text
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
