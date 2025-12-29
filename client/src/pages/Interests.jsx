import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI } from '../utils/api';

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
      alert(`Interest ${status} successfully!`);
      fetchInterests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to respond to interest');
    }
  };

  const InterestCard = ({ interest, type }) => (
    <div className="card">
      <div className="flex items-start space-x-4">
        <img
          src={interest.profile_picture || 'https://via.placeholder.com/100'}
          alt={interest.full_name}
          className="w-20 h-20 rounded-lg object-cover"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link
                to={`/profile/${type === 'received' ? interest.sender_id : interest.receiver_id}`}
                className="text-lg font-bold text-gray-800 hover:text-primary"
              >
                {interest.full_name}
              </Link>
              <p className="text-sm text-gray-600">
                {interest.age} years • {interest.city || 'Location not specified'}
              </p>
              {interest.education && (
                <p className="text-sm text-gray-600">{interest.education}</p>
              )}
              {interest.occupation && (
                <p className="text-sm text-gray-600">{interest.occupation}</p>
              )}
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  interest.status === 'sent'
                    ? 'bg-blue-100 text-blue-800'
                    : interest.status === 'accepted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(interest.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {interest.message && (
            <p className="text-sm text-gray-700 mt-2 italic">"{interest.message}"</p>
          )}

          {type === 'received' && interest.status === 'sent' && (
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => handleRespond(interest.id, 'accepted')}
                className="btn-primary text-sm py-2 px-4"
              >
                Accept
              </button>
              <button
                onClick={() => handleRespond(interest.id, 'rejected')}
                className="btn-secondary text-sm py-2 px-4"
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Interests</h1>
          <p className="text-gray-600">Manage your sent and received interests</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'received'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Received ({receivedInterests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
        <div className="space-y-4">
          {activeTab === 'received' ? (
            receivedInterests.length > 0 ? (
              receivedInterests.map((interest) => (
                <InterestCard key={interest.id} interest={interest} type="received" />
              ))
            ) : (
              <div className="card text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Interests Received</h3>
                <p className="text-gray-600">
                  You haven't received any interests yet. Keep your profile updated to attract more matches!
                </p>
              </div>
            )
          ) : sentInterests.length > 0 ? (
            sentInterests.map((interest) => (
              <InterestCard key={interest.id} interest={interest} type="sent" />
            ))
          ) : (
            <div className="card text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Interests Sent</h3>
              <p className="text-gray-600 mb-4">
                You haven't sent any interests yet. Start exploring profiles to find your match!
              </p>
              <Link to="/recommendations" className="btn-primary inline-block">
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
