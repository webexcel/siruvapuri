import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchAPI, profileAPI } from '../utils/api';
import ProfileCard from '../components/ProfileCard';
import CardSkeleton from '../components/CardSkeleton';
import { showSuccess, showError } from '../utils/sweetalert';
import { Crown, Star, Award } from 'lucide-react';

// Membership Badge Component
const MembershipBadge = ({ membershipType, isActive }) => {
  if (!membershipType || !isActive) return null;

  const badges = {
    gold: { icon: Award, color: 'bg-yellow-500', label: 'Gold Member' },
    platinum: { icon: Star, color: 'bg-gray-400', label: 'Platinum Member' },
    premium: { icon: Crown, color: 'bg-purple-500', label: 'Premium Member' }
  };

  const badge = badges[membershipType];
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-semibold ${badge.color} text-white`}>
      <Icon size={12} />
      {badge.label}
    </span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recsError, setRecsError] = useState(null);
  const [stats, setStats] = useState({
    receivedInterests: 0,
    sentInterests: 0,
    profileViews: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setRecsError(null);

    const results = await Promise.allSettled([
      matchAPI.getRecommendations(6),
      matchAPI.getTopMatches(),
      matchAPI.getReceivedInterests(),
      matchAPI.getSentInterests(),
      profileAPI.getProfileViewsCount(),
    ]);

    if (results[0].status === 'fulfilled') {
      setRecommendations(results[0].value.data.recommendations || []);
    } else {
      console.error('Error fetching recommendations:', results[0].reason);
      const errorMsg = results[0].reason?.response?.data?.error || 'Failed to load recommendations';
      setRecsError(errorMsg);
    }

    if (results[1].status === 'fulfilled') {
      setTopMatches(results[1].value.data.topMatches || []);
    }

    const receivedInterests = results[2].status === 'fulfilled'
      ? results[2].value.data.interests?.length || 0
      : 0;
    const sentInterests = results[3].status === 'fulfilled'
      ? results[3].value.data.interests?.length || 0
      : 0;
    const profileViews = results[4].status === 'fulfilled'
      ? results[4].value.data.viewCount || 0
      : 0;

    setStats({
      receivedInterests,
      sentInterests,
      profileViews,
    });

    setLoading(false);
  };

  const handleInterestSent = async (profileId) => {
    try {
      await matchAPI.sendInterest({ receiver_id: profileId });
      showSuccess('Interest sent successfully!');
      fetchDashboardData();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to send interest');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Welcome back, {user?.full_name}!
            </h1>
            <MembershipBadge
              membershipType={user?.membership_type}
              isActive={user?.is_membership_active}
            />
          </div>
          <p className="text-sm sm:text-base text-gray-600">Find your perfect match today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Link to="/interests" className="card p-3 sm:p-4 md:p-6 hover:shadow-xl transition-shadow">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-gray-600 text-xs sm:text-sm mb-1">Received</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stats.receivedInterests}</p>
              </div>
              <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </Link>

          <div className="card p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-gray-600 text-xs sm:text-sm mb-1">Sent</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{stats.sentInterests}</p>
              </div>
              <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-gray-600 text-xs sm:text-sm mb-1">Views</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{stats.profileViews}</p>
              </div>
              <div className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <Link to="/recommendations" className="bg-primary text-white rounded-lg p-3 sm:p-4 flex items-center justify-between hover:bg-primary-dark transition-colors">
            <span className="font-semibold text-sm sm:text-base">View Daily Matches</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link to="/search" className="bg-gray-800 text-white rounded-lg p-3 sm:p-4 flex items-center justify-between hover:bg-gray-700 transition-colors">
            <span className="font-semibold text-sm sm:text-base">Advanced Search</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          <Link to="/profile/edit" className="bg-white border-2 border-primary text-primary rounded-lg p-3 sm:p-4 flex items-center justify-between hover:bg-primary hover:text-white transition-colors">
            <span className="font-semibold text-sm sm:text-base">Edit Profile</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>

        {/* Admin-Assigned Top Matches */}
        {topMatches.length > 0 && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Top Matches</h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                  Admin Selected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {topMatches.slice(0, 10).map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  showMatchScore={true}
                  onInterestSent={handleInterestSent}
                />
              ))}
            </div>
          </div>
        )}

        {/* System Recommendations */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">System Recommendations</h2>
            <Link to="/recommendations" className="text-primary hover:text-primary-dark font-semibold text-xs sm:text-sm whitespace-nowrap">
              View All →
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={8} />
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {recommendations.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  showMatchScore={true}
                  onInterestSent={handleInterestSent}
                />
              ))}
            </div>
          ) : recsError ? (
            <div className="card text-center py-8 sm:py-12">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{recsError}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button onClick={() => fetchDashboardData()} className="btn-secondary text-sm">
                  Retry
                </button>
                <Link to="/search" className="btn-primary text-sm inline-block">
                  Search Profiles
                </Link>
              </div>
            </div>
          ) : (
            <div className="card text-center py-8 sm:py-12">
              <p className="text-gray-600 text-sm sm:text-base">No recommendations available at the moment.</p>
              <Link to="/search" className="btn-primary mt-3 sm:mt-4 inline-block text-sm">
                Search Profiles
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
