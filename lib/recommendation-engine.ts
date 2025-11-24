/**
 * Flight ranking weights
 */
const FLIGHT_WEIGHTS = {
  price: 0.5,
  duration: 0.3,
  stopover: 0.2,
};

/**
 * Hotel ranking weights
 */
const HOTEL_WEIGHTS = {
  price: 0.4,
  rating: 0.4,
  location: 0.2,
};

/**
 * Normalize a value to 0-1 scale
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Calculate duration in minutes from string like "4h 15m"
 */
function parseDuration(duration: string): number {
  const hours = duration.match(/(\d+)h/)?.[1] || '0';
  const minutes = duration.match(/(\d+)m/)?.[1] || '0';
  return parseInt(hours) * 60 + parseInt(minutes);
}

/**
 * Rank all flights and return them sorted by score
 */
export function rankFlights(flights: any[]): any[] {
  if (!flights || flights.length === 0) return [];
  if (flights.length === 1) return flights;

  const prices = flights.map((f) => f.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const durations = flights.map((f) => parseDuration(f.duration));
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  const stopovers = flights.map((f) => f.stopovers || 0);
  const maxStopovers = Math.max(...stopovers);

  const scores = flights.map((flight, index) => {
    const priceScore = 1 - normalize(flight.price, minPrice, maxPrice);
    const durationScore = 1 - normalize(durations[index], minDuration, maxDuration);
    const stopoverScore = maxStopovers === 0 ? 1 : 1 - stopovers[index] / maxStopovers;

    const totalScore =
      priceScore * FLIGHT_WEIGHTS.price +
      durationScore * FLIGHT_WEIGHTS.duration +
      stopoverScore * FLIGHT_WEIGHTS.stopover;

    return { ...flight, score: totalScore };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores;
}

/**
 * Rank and select best flight option
 */
export function selectBestFlight(flights: any[]): any | null {
  const ranked = rankFlights(flights);
  return ranked.length > 0 ? ranked[0] : null;
}

/**
 * Rank all hotels and return them sorted by score
 */
export function rankHotels(hotels: any[], vibe?: string): any[] {
  if (!hotels || hotels.length === 0) return [];
  if (hotels.length === 1) return hotels;

  const prices = hotels.map((h) => h.price_per_night || h.pricePerNight);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const ratings = hotels.map((h) => h.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  const scores = hotels.map((hotel, index) => {
    const priceScore = 1 - normalize(prices[index], minPrice, maxPrice);
    const ratingScore = normalize(ratings[index], minRating, maxRating);

    let locationScore = 0.5;
    if (vibe && hotel.location) {
      const location = hotel.location.toLowerCase();
      if (vibe === 'party' && location.includes('downtown')) {
        locationScore = 1;
      } else if (vibe === 'relaxing' && location.includes('beach')) {
        locationScore = 1;
      } else if (vibe === 'adventure' && location.includes('mountain')) {
        locationScore = 1;
      }
    }

    const totalScore =
      priceScore * HOTEL_WEIGHTS.price +
      ratingScore * HOTEL_WEIGHTS.rating +
      locationScore * HOTEL_WEIGHTS.location;

    return { ...hotel, score: totalScore };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores;
}

/**
 * Rank and select best hotel option
 */
export function selectBestHotel(hotels: any[], vibe?: string): any | null {
  const ranked = rankHotels(hotels, vibe);
  return ranked.length > 0 ? ranked[0] : null;
}

/**
 * Calculate preference weights from user input
 */
export function calculatePreferenceWeights(preferences: {
  budget?: number;
  vibe?: string;
  purpose?: string;
  food?: string[];
  pace?: string;
}): any {
  const weights: any = {
    food: 0.2,
    outdoors: 0.2,
    museums: 0.2,
    nightlife: 0.2,
    relaxation: 0.2,
  };

  if (preferences.vibe) {
    switch (preferences.vibe.toLowerCase()) {
      case 'adventure':
        weights.outdoors = 0.5;
        weights.food = 0.2;
        weights.museums = 0.1;
        weights.nightlife = 0.1;
        weights.relaxation = 0.1;
        break;
      case 'party':
        weights.nightlife = 0.5;
        weights.food = 0.3;
        weights.outdoors = 0.1;
        weights.museums = 0.05;
        weights.relaxation = 0.05;
        break;
      case 'relaxing':
      case 'luxury':
        weights.relaxation = 0.4;
        weights.food = 0.3;
        weights.outdoors = 0.2;
        weights.museums = 0.05;
        weights.nightlife = 0.05;
        break;
      case 'cultural':
        weights.museums = 0.4;
        weights.food = 0.3;
        weights.outdoors = 0.15;
        weights.nightlife = 0.1;
        weights.relaxation = 0.05;
        break;
    }
  }

  return weights;
}
