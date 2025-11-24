import Link from 'next/link';

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="max-w-4xl text-center relative z-10">
        <h1 className="text-7xl font-bold text-white mb-6 drop-shadow-lg">
          Journi
        </h1>
        <p className="text-2xl text-white mb-4 drop-shadow-md">
          AI-Powered Multimodal Travel Planner
        </p>
        <p className="text-lg text-white mb-12 max-w-2xl mx-auto drop-shadow-md">
          Plan your perfect trip using screenshot uploads.
          Let AI extract travel details, recommend the best options,
          and generate your personalized itinerary.
        </p>

        <div className="mb-16">
          <Link
            href="/planner"
            className="inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg font-bold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-2xl transform hover:scale-105"
          >
            Plan Your Trip
          </Link>
        </div>

        {/* Features Section */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Screenshot Upload</h3>
            <p className="text-gray-600">
              Upload flight and hotel screenshots. AI extracts prices, times, and details automatically.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Recommendations</h3>
            <p className="text-gray-600">
              Get the best flight and hotel recommendations based on price, duration, and your preferences.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Itinerary</h3>
            <p className="text-gray-600">
              Generate detailed day-by-day itineraries tailored to your vibe, budget, and preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
