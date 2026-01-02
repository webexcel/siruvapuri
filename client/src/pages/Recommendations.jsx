import { useEffect, useState } from 'react';
import { matchAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/sweetalert';
import ProfileCard from '../components/ProfileCard';
import CardSkeleton from '../components/CardSkeleton';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchRecommendations();
  }, [limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await matchAPI.getRecommendations(limit);
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      const errorMsg = err.response?.data?.error || 'Failed to fetch recommendations';
      setError(errorMsg);
      // Don't show error toast for specific user status errors
      if (!errorMsg.includes('not eligible') && !errorMsg.includes('Complete your profile')) {
        showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInterestSent = async (profileId) => {
    try {
      await matchAPI.sendInterest({ receiver_id: profileId });
      showSuccess('Interest sent successfully!');
      // Optionally remove from recommendations
      setRecommendations(recommendations.filter(r => r.id !== profileId));
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to send interest');
      throw error; // Re-throw to let ProfileCard know it failed
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Daily Recommendations
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Profiles specially selected for you based on your preferences
          </p>
        </div>

        {loading ? (
          <CardSkeleton count={8} />
        ) : recommendations.length > 0 ? (
          <>
            <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">
              Showing {recommendations.length} profiles
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              {recommendations.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  showMatchScore={true}
                  onInterestSent={handleInterestSent}
                />
              ))}
            </div>

            {recommendations.length >= limit && (
              <div className="text-center">
                <button
                  onClick={() => setLimit(limit + 20)}
                  className="btn-primary text-sm sm:text-base py-2 sm:py-2.5 px-4 sm:px-6"
                >
                  Load More Profiles
                </button>
              </div>
            )}
          </>
        ) : error ? (
          <div className="card text-center py-8 sm:py-12 px-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Unable to Load Recommendations</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
            <button onClick={() => fetchRecommendations()} className="btn-primary text-sm sm:text-base">
              Try Again
            </button>
          </div>
        ) : (
          <div className="card text-center py-8 sm:py-12 px-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Recommendations Yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              We're working on finding the best matches for you. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
