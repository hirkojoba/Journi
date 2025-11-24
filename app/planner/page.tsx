'use client';

import { useState, useMemo } from 'react';
import FileUpload from '../components/FileUpload';
import Button from '../components/Button';
import Card from '../components/Card';
import axios from 'axios';
import { rankFlights, rankHotels } from '@/lib/recommendation-engine';

type Step = 'upload' | 'preferences' | 'recommendations' | 'itinerary';

interface FlightData {
  airline: string;
  price: number;
  departure_time: string;
  arrival_time: string;
  duration: string;
  stopovers: number;
}

interface HotelData {
  name: string;
  price_per_night: number;
  rating: number;
  location: string;
}

export default function PlannerPage() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [selectedFlightIndex, setSelectedFlightIndex] = useState<number>(0);
  const [selectedHotelIndex, setSelectedHotelIndex] = useState<number>(0);
  const [preferences, setPreferences] = useState({
    budget: 2000,
    vibe: 'adventure',
    purpose: 'leisure',
    food: [] as string[],
    pace: 'medium',
    allInclusive: false,
  });
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itineraryData, setItineraryData] = useState<any>(null);
  const [tripId, setTripId] = useState<string | null>(null);

  // Rank flights and hotels
  const rankedFlights = useMemo(() => rankFlights(flights), [flights]);
  const rankedHotels = useMemo(() => rankHotels(hotels, preferences.vibe), [hotels, preferences.vibe]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/vision/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFlights(response.data.flights || []);
      setHotels(response.data.hotels || []);
      setCurrentStep('preferences');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse image');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If all-inclusive, skip recommendations and generate itinerary directly
    if (preferences.allInclusive) {
      await handleGenerateItinerary();
    } else {
      setCurrentStep('recommendations');
    }
  };

  const handleGenerateItinerary = async () => {
    if (!destination || !startDate || !endDate) {
      setError('Please fill in destination and dates');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dates = generateDateRange(startDate, endDate);

      // Use selected flight and hotel based on user's choice
      const selectedFlight = rankedFlights[selectedFlightIndex] || null;
      const selectedHotel = rankedHotels[selectedHotelIndex] || null;

      const response = await axios.post('/api/itinerary', {
        destination,
        dates,
        preferences,
        flights: selectedFlight ? [selectedFlight] : [],
        hotels: selectedHotel ? [selectedHotel] : [],
      });

      setItineraryData(response.data);
      setTripId(response.data.tripId);
      setCurrentStep('itinerary');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!tripId) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        '/api/pdf',
        { tripId },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `journi-trip-${destination}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Get background image based on current step
  const getBackgroundImage = () => {
    const backgrounds = {
      upload: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2000', // Tropical beach with palm trees
      preferences: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2000', // City skyline
      recommendations: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000', // Mountains
      itinerary: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2000', // Paris architecture
    };
    return backgrounds[currentStep];
  };

  return (
    <div
      className="min-h-screen py-12 px-4 relative"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">Journi</h1>
          <p className="text-white drop-shadow-md">AI-Powered Travel Planning</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          {['upload', 'preferences', 'recommendations', 'itinerary'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${currentStep === step ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-800'}
                `}
              >
                {index + 1}
              </div>
              {index < 3 && <div className="w-16 h-1 bg-white/60 mx-2" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <Card title="Upload Travel Screenshots (Optional)">
            <p className="text-gray-600 mb-6">
              Upload screenshots of flight or hotel options, or skip to enter your preferences manually
            </p>
            <FileUpload onFileSelect={handleFileUpload} />
            {isLoading && <p className="mt-4 text-center text-gray-600">Processing image...</p>}
            {!isLoading && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => setCurrentStep('preferences')}>
                  Skip - Enter Preferences Manually
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Step 2: Preferences */}
        {currentStep === 'preferences' && (
          <Card title="Your Travel Preferences">
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="e.g., Vancouver"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={preferences.budget}
                    onChange={(e) => setPreferences({ ...preferences, budget: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trip Vibe
                  </label>
                  <select
                    value={preferences.vibe}
                    onChange={(e) => setPreferences({ ...preferences, vibe: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="adventure">Adventure</option>
                    <option value="relaxing">Relaxing</option>
                    <option value="party">Party</option>
                    <option value="luxury">Luxury</option>
                    <option value="cultural">Cultural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pace
                  </label>
                  <select
                    value={preferences.pace}
                    onChange={(e) => setPreferences({ ...preferences, pace: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="slow">Slow</option>
                    <option value="medium">Medium</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>

              {/* All Inclusive Option */}
              <div className="border-t pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.allInclusive}
                    onChange={(e) => setPreferences({ ...preferences, allInclusive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900">All-Inclusive Package</span>
                    <p className="text-xs text-gray-600">Flight, hotel, meals, and activities included in one package</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="secondary" onClick={() => setCurrentStep('upload')}>
                  Back
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step 3: Recommendations */}
        {currentStep === 'recommendations' && (
          <div className="space-y-6">
            {rankedFlights.length > 0 && (
              <Card title="Flight Options (Ranked)">
                <p className="text-sm text-gray-600 mb-4">Select your preferred flight. Options are ranked from best to good value.</p>
                <div className="space-y-3">
                  {rankedFlights.map((flight, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedFlightIndex(index)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedFlightIndex === index
                          ? 'bg-blue-100 border-2 border-blue-600'
                          : 'bg-blue-50 border-2 border-transparent hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg text-gray-900">{flight.airline}</p>
                            {index === 0 && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">BEST VALUE</span>
                            )}
                          </div>
                          <p className="text-gray-700">{flight.departure_time} - {flight.arrival_time}</p>
                          <p className="text-gray-600 text-sm">Duration: {flight.duration} • {flight.stopovers === 0 ? 'Direct' : `${flight.stopovers} stop(s)`}</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">${flight.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {rankedHotels.length > 0 && (
              <Card title="Hotel Options (Ranked)">
                <p className="text-sm text-gray-600 mb-4">Select your preferred hotel. Options are ranked from best to good value.</p>
                <div className="space-y-3">
                  {rankedHotels.map((hotel, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedHotelIndex(index)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedHotelIndex === index
                          ? 'bg-green-100 border-2 border-green-600'
                          : 'bg-green-50 border-2 border-transparent hover:border-green-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg text-gray-900">{hotel.name}</p>
                            {index === 0 && (
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">BEST VALUE</span>
                            )}
                          </div>
                          <p className="text-gray-700">{hotel.location}</p>
                          <p className="text-gray-600 text-sm">Rating: {hotel.rating}/5 ⭐</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">${hotel.price_per_night || hotel.pricePerNight}/night</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setCurrentStep('preferences')}>
                  Back
                </Button>
                <Button onClick={handleGenerateItinerary} isLoading={isLoading}>
                  Generate Itinerary
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Itinerary */}
        {currentStep === 'itinerary' && itineraryData && (
          <div className="space-y-6">
            <Card title="Your Travel Itinerary">
              <p className="text-gray-700 mb-6">{itineraryData.summary}</p>

              <div className="space-y-4">
                {itineraryData.itinerary?.map((day: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-lg mb-2 text-gray-900">Day {day.day}</h4>
                    {day.morning && (
                      <div className="mb-2">
                        <span className="font-semibold text-sm text-gray-600">Morning:</span>
                        <p className="text-gray-800">{day.morning}</p>
                      </div>
                    )}
                    {day.afternoon && (
                      <div className="mb-2">
                        <span className="font-semibold text-sm text-gray-600">Afternoon:</span>
                        <p className="text-gray-800">{day.afternoon}</p>
                      </div>
                    )}
                    {day.evening && (
                      <div>
                        <span className="font-semibold text-sm text-gray-600">Evening:</span>
                        <p className="text-gray-800">{day.evening}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-900">
                  Estimated Total Cost: ${itineraryData.estimated_total_cost}
                </p>
              </div>
            </Card>

            <Card>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep('preferences')}>
                  Start Over
                </Button>
                <Button onClick={handleDownloadPDF} isLoading={isLoading}>
                  Download PDF
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
