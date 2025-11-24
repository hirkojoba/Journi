# Journi - AI-Powered Travel Planner

A full-stack web application that allows users to plan trips using screenshot uploads. The system extracts structured travel information, identifies the best travel options, generates optimized itineraries, and produces downloadable trip PDFs.

## Features

- **Screenshot Upload**: Upload screenshots of flight/hotel listings
- **AI Vision Parsing**: Automatically extract prices, times, and details from screenshots
- **Smart Recommendations**: Get ranked flight and hotel options based on price, duration, and ratings
- **AI-Generated Itineraries**: Receive personalized day-by-day travel plans
- **PDF Export**: Download your complete travel plan as a PDF

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Prisma ORM with SQLite (local) / Azure SQL (production)
- **AI**: OpenAI GPT-4o mini (Vision & Text)
- **PDF Generation**: pdf-lib
- **Deployment**: Railway / Azure App Service

## Deployment

### Environment Variables

Set these in your deployment platform:
- `DATABASE_URL`: Database connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_BASE_URL`: Your production URL
