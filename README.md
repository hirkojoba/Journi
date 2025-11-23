# Journi - AI-Powered Multimodal Travel Planner

A full-stack web application that allows users to plan trips using text, voice, or screenshot uploads. The system extracts structured travel information, identifies the best travel options, generates optimized itineraries, and produces downloadable trip PDFs.

## Features

- **Multimodal Input**: Upload screenshots of flight/hotel listings, type preferences, or use voice input
- **AI Vision Parsing**: Automatically extract prices, times, and details from screenshots
- **Smart Recommendations**: Get best flight and hotel recommendations based on your preferences
- **AI-Generated Itineraries**: Receive personalized day-by-day travel plans
- **PDF Export**: Download your complete travel plan as a PDF

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: SQLite (local), Azure SQL (production)
- **ORM**: Prisma
- **AI**: OpenAI GPT-4o mini (Vision & Text)
- **PDF Generation**: pdf-lib
- **Deployment**: Azure App Service / Azure Static Web Apps

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd journi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your-openai-api-key-here"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
journi/
├── app/
│   ├── api/
│   │   ├── vision/parse/    # Vision AI endpoint
│   │   ├── preferences/     # Preferences processing
│   │   ├── itinerary/       # Itinerary generation
│   │   └── pdf/             # PDF export
│   ├── components/          # React components
│   ├── planner/             # Main planner page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── lib/
│   ├── ai-utils.ts          # AI integration utilities
│   ├── recommendation-engine.ts  # Flight/hotel ranking
│   └── prisma.ts            # Prisma client
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                  # Static assets
```

## API Endpoints

### POST /api/vision/parse
Parse flight and hotel data from screenshot images.

**Request**: `multipart/form-data` with image file

**Response**:
```json
{
  "flights": [...],
  "hotels": [...],
  "raw_text": "..."
}
```

### POST /api/preferences
Calculate preference weights from user input.

**Request**:
```json
{
  "budget": 2500,
  "vibe": "adventure",
  "food": ["seafood"],
  "pace": "medium"
}
```

### POST /api/itinerary
Generate full travel itinerary.

**Request**:
```json
{
  "destination": "Vancouver",
  "dates": ["2025-07-04", "2025-07-07"],
  "preferences": {...},
  "flights": [...],
  "hotels": [...]
}
```

**Response**:
```json
{
  "tripId": "uuid",
  "selectedFlight": {...},
  "selectedHotel": {...},
  "itinerary": [...],
  "summary": "...",
  "estimated_total_cost": 2500
}
```

### POST /api/pdf
Generate and download PDF travel plan.

**Request**:
```json
{
  "tripId": "uuid"
}
```

**Response**: PDF binary file

## Database Schema

### Trip
- id, destination, startDate, endDate, budget, vibe, createdAt

### Flight
- id, tripId, airline, price, departTime, arriveTime, duration, stopovers

### Hotel
- id, tripId, name, pricePerNight, rating, location

### Itinerary
- id, tripId, jsonData (stringified JSON)

## Deployment

### Azure App Service

1. Create an Azure App Service instance
2. Set up environment variables in Azure Portal
3. Connect your repository for CI/CD
4. Configure build settings:
```bash
npm install
npm run build
```
5. Set start command: `npm start`

### Azure SQL Database (Production)

1. Create Azure SQL Database instance
2. Update `.env` with connection string:
```env
DATABASE_URL="sqlserver://server.database.windows.net:1433;database=journi;user=admin;password=pass;encrypt=true"
```
3. Run migrations:
```bash
npx prisma migrate deploy
```

### Environment Variables (Production)

Set these in Azure App Service Configuration:
- `DATABASE_URL`: Azure SQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_BASE_URL`: Your production URL

## Development Roadmap

### Current Features (MVP)
- ✅ Screenshot upload and parsing
- ✅ AI-powered itinerary generation
- ✅ Flight and hotel recommendations
- ✅ PDF export
- ✅ Basic preference settings

### Future Enhancements
- User authentication and trip history
- Real-time flight/hotel API integrations
- Voice input with Whisper API
- Group trip planning
- Weather integration
- Google Maps integration
- Multi-language support

## Testing

Run tests:
```bash
npm test
```

## License

ISC

## Contributing

This is a portfolio project. Feel free to fork and adapt for your own use.

## Contact

For questions or feedback, please open an issue on GitHub.
