import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/sweetalert';
import { Crown, Star, Award } from 'lucide-react';

// Membership Badge Component
const MembershipBadge = ({ membershipType, isActive }) => {
  if (!membershipType || !isActive) return null;

  const badges = {
    gold: { icon: Award, color: 'bg-yellow-500', label: 'Gold' },
    platinum: { icon: Star, color: 'bg-gray-400', label: 'Platinum' },
    premium: { icon: Crown, color: 'bg-purple-500', label: 'Premium' }
  };

  const badge = badges[membershipType];
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full font-semibold ${badge.color} text-white`}>
      <Icon size={10} />
      {badge.label}
    </span>
  );
};

const InterestsSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
    <div className="container mx-auto px-3 sm:px-4">
      <div className="mb-4 sm:mb-8 animate-pulse">
        <div className="h-6 sm:h-8 w-24 sm:w-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-48 sm:w-64 bg-gray-200 rounded"></div>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-4 sm:space-x-8">
            <div className="h-6 w-20 sm:w-24 bg-gray-200 rounded py-4"></div>
            <div className="h-6 w-16 sm:w-20 bg-gray-200 rounded py-4"></div>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-3 sm:p-4 md:p-6 animate-pulse">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 sm:h-4 w-32 sm:w-48 bg-gray-200 rounded"></div>
                    <div className="h-3 sm:h-4 w-24 sm:w-36 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="h-5 sm:h-6 w-14 sm:w-16 bg-gray-200 rounded-full"></div>
                    <div className="h-3 w-16 sm:w-20 bg-gray-200 rounded mt-1"></div>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
                  <div className="h-8 sm:h-9 w-16 sm:w-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-8 sm:h-9 w-16 sm:w-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Interests = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [sentInterests, setSentInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        matchAPI.getReceivedInterests(),
        matchAPI.getSentInterests(),
      ]);

      setReceivedInterests(receivedResponse.data.interests || []);
      setSentInterests(sentResponse.data.interests || []);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (interestId, status) => {
    try {
      await matchAPI.respondToInterest({ interest_id: interestId, status });
      showSuccess(`Interest ${status} successfully!`);
      fetchInterests();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to respond to interest');
    }
  };

  const InterestCard = ({ interest, type }) => (
    <div className="card p-3 sm:p-4 md:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <img
          src={interest.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(interest.full_name || 'User')}&size=100&background=00D26A&color=fff`}
          alt={interest.full_name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(interest.full_name || 'User')}&size=100&background=00D26A&color=fff`;
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/profile/${type === 'received' ? interest.sender_id : interest.receiver_id}`}
                  className="text-sm sm:text-base md:text-lg font-bold text-gray-800 hover:text-primary"
                >
                  {interest.full_name}
                </Link>
                <MembershipBadge
                  membershipType={interest.membership_type}
                  isActive={interest.is_membership_active}
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {interest.age} yrs • {interest.city || 'Location N/A'}
              </p>
              {interest.education && (
                <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">{interest.education}</p>
              )}
              {interest.occupation && (
                <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">{interest.occupation}</p>
              )}
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                  interest.status === 'sent'
                    ? 'bg-blue-100 text-blue-800'
                    : interest.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {new Date(interest.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {interest.message && (
            <p className="text-xs sm:text-sm text-gray-700 mt-2 italic line-clamp-2">"{interest.message}"</p>
          )}

          {type === 'received' && interest.status === 'sent' && (
            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
              <button
                onClick={() => handleRespond(interest.id, 'accepted')}
                className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 cursor-pointer"
              >
                Accept
              </button>
              <button
                onClick={() => handleRespond(interest.id, 'rejected')}
                className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 cursor-pointer"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <InterestsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Interests</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your sent and received interests</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('received')}
                className={`flex-1 sm:flex-none py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                  activeTab === 'received'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Received ({receivedInterests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 sm:flex-none py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                  activeTab === 'sent'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sent ({sentInterests.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 sm:space-y-4">
          {activeTab === 'received' ? (
            receivedInterests.length > 0 ? (
              receivedInterests.map((interest) => (
                <InterestCard key={interest.id} interest={interest} type="received" />
              ))
            ) : (
              <div className="card text-center py-8 sm:py-12">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Interests Received</h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">
                  You haven't received any interests yet. Keep your profile updated!
                </p>
              </div>
            )
          ) : sentInterests.length > 0 ? (
            sentInterests.map((interest) => (
              <InterestCard key={interest.id} interest={interest} type="sent" />
            ))
          ) : (
            <div className="card text-center py-8 sm:py-12">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Interests Sent</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                Start exploring profiles to find your match!
              </p>
              <Link to="/recommendations" className="btn-primary inline-block text-sm sm:text-base">
                View Recommendations
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interests;
