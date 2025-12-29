import { useEffect, useState } from 'react';
import { matchAPI } from '../utils/api';
import ProfileCard from '../components/ProfileCard';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchRecommendations();
  }, [limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await matchAPI.getRecommendations(limit);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestSent = async (profileId) => {
    try {
      await matchAPI.sendInterest({ receiver_id: profileId });
      alert('Interest sent successfully!');
      // Optionally remove from recommendations
      setRecommendations(recommendations.filter(r => r.id !== profileId));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send interest');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Daily Recommendations
          </h1>
          <p className="text-gray-600">
            Profiles specially selected for you based on your preferences
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Showing {recommendations.length} profiles
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                  className="btn-primary"
                >
                  Load More Profiles
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-4">
              We're working on finding the best matches for you. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
