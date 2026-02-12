import { useEffect, useState } from 'react';
import { matchAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/sweetalert';
import ProfileCard from '../components/ProfileCard';
import CardSkeleton from '../components/CardSkeleton';
import { Heart, Sparkles, RefreshCw, Users, ChevronDown } from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (newLimit = limit) => {
    try {
      if (newLimit > limit) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await matchAPI.getRecommendations(newLimit);
      setRecommendations(response.data.recommendations || []);
      setLimit(newLimit);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      const errorMsg = err.response?.data?.error || 'Failed to fetch recommendations';
      setError(errorMsg);
      if (!errorMsg.includes('not eligible') && !errorMsg.includes('Complete your profile')) {
        showError(errorMsg);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleInterestSent = async (profileId) => {
    try {
      await matchAPI.sendInterest({ receiver_id: profileId });
      showSuccess('Interest sent successfully!');
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to send interest');
      throw error;
    }
  };

  const handleLoadMore = () => {
    fetchRecommendations(limit + 20);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary via-primary-dark to-primary relative overflow-hidden pb-8">
        {/* Dot pattern background */}
        <div className="absolute inset-0 opacity-50" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'%3E%3C/path%3E%3C/svg%3E\")"}}></div>

        <div className="container mx-auto px-4 pt-8 sm:pt-10 pb-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Daily Recommendations
                </h1>
              </div>
              <p className="text-white/80 text-sm sm:text-base">
                Handpicked profiles matching your preferences
              </p>
            </div>
            <button
              onClick={() => fetchRecommendations(limit)}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium mx-auto sm:mx-0"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Decorative wave - properly positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 leading-[0]">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 40V20C240 5 480 0 720 8C960 16 1200 30 1440 20V40H0Z" fill="white" fillOpacity="0.1"/>
            <path d="M0 40V28C240 12 480 6 720 14C960 22 1200 36 1440 28V40H0Z" className="fill-gray-50"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {loading ? (
          <CardSkeleton count={8} />
        ) : recommendations.length > 0 ? (
          <>
            {/* Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Showing</p>
                  <p className="text-lg font-bold text-gray-800">{recommendations.length} <span className="text-sm font-normal text-gray-500">profiles</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Sorted by</span>
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Heart size={12} />
                  Best Match
                </span>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
              {recommendations.map((profile, index) => (
                <div
                  key={profile.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProfileCard
                    profile={profile}
                    showMatchScore={true}
                    onInterestSent={handleInterestSent}
                  />
                </div>
              ))}
            </div>

            {/* Load More */}
            {recommendations.length >= limit && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown size={18} />
                      Load More Profiles
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : error ? (
          <div className="max-w-md mx-auto mt-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Recommendations</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => fetchRecommendations()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center mx-auto mb-5">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-600 mb-6">
                We're working on finding the best matches for you. Complete your profile and preferences to get better recommendations!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => fetchRecommendations()}
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition-all"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <a
                  href="/profile/edit"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Complete Profile
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Recommendations;
