import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI, matchAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/sweetalert';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { useAuth } from '../context/AuthContext';

const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
      checkInterestStatus();
    }
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileAPI.getProfile(id);
      if (response.data && response.data.profile) {
        setProfile(response.data.profile);
      } else {
        setError('Profile data not available');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      const errorMsg = err.response?.data?.error || 'Failed to load profile';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Check if interest has already been sent to this profile
  const checkInterestStatus = async () => {
    try {
      const response = await matchAPI.getSentInterests();
      const sentInterests = response.data.interests || [];
      const alreadySent = sentInterests.some(
        (interest) => interest.receiver_id === parseInt(id)
      );
      setInterestSent(alreadySent);
    } catch (err) {
      console.error('Error checking interest status:', err);
    }
  };

  const handleSendInterest = async () => {
    if (sendingInterest || interestSent) return;

    setSendingInterest(true);
    try {
      await matchAPI.sendInterest({ receiver_id: parseInt(id) });
      showSuccess('Interest sent successfully!');
      setInterestSent(true);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send interest';
      if (errorMsg.includes('already')) {
        setInterestSent(true);
      }
      showError(errorMsg);
    } finally {
      setSendingInterest(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            {error ? 'Error Loading Profile' : 'Profile Not Found'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {error || 'The profile you are looking for does not exist.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button onClick={() => fetchProfile()} className="btn-secondary text-sm sm:text-base">
              Retry
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm sm:text-base">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && user.id === parseInt(id);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 flex items-center text-sm sm:text-base text-gray-600 hover:text-primary"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Profile Picture and Quick Actions */}
          <div className="lg:col-span-1">
            <div className="card p-3 sm:p-4 md:p-6 sticky top-4 sm:top-8">
              <img
                src={profile.profile_picture || 'https://via.placeholder.com/400x400?text=No+Photo'}
                alt={profile.full_name}
                className="w-full h-56 sm:h-64 md:h-80 object-cover rounded-lg mb-4 sm:mb-6"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x400?text=No+Photo';
                }}
              />

              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">{profile.full_name}</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                {profile.age || 'N/A'} years | {profile.city || 'Location not specified'}
              </p>

              {!isOwnProfile && (
                <>
                  <button
                    onClick={handleSendInterest}
                    disabled={sendingInterest || interestSent}
                    className={`w-full mb-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      interestSent
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'btn-primary disabled:opacity-50'
                    }`}
                  >
                    {sendingInterest ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : interestSent ? (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Interest Sent
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Send Interest
                      </>
                    )}
                  </button>

                  {/* <button className="w-full btn-secondary">
                    Shortlist
                  </button> */}
                </>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="w-full btn-primary text-sm sm:text-base"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="card p-3 sm:p-4 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
                <InfoItem label="Age" value={`${profile.age || 'N/A'} years`} />
                <InfoItem label="Height" value={profile.height ? `${profile.height} cm` : 'Not specified'} />
                <InfoItem label="Weight" value={profile.weight ? `${profile.weight} kg` : 'Not specified'} />
                <InfoItem label="Marital Status" value={profile.marital_status?.replace('_', ' ') || 'Not specified'} />
                <InfoItem label="Gender" value={profile.gender || 'Not specified'} />
                <InfoItem label="Mother Tongue" value={profile.mother_tongue || 'Not specified'} />
              </div>
            </div>

            {/* Religious Information */}
            <div className="card p-3 sm:p-4 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
                Religious Background
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
                <InfoItem label="Religion" value={profile.religion || 'Not specified'} />
                <InfoItem label="Caste" value={profile.caste || 'Not specified'} />
              </div>
            </div>

            {/* Professional Information */}
            <div className="card p-3 sm:p-4 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
                Professional Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
                <InfoItem label="Education" value={profile.education || 'Not specified'} />
                <InfoItem label="Occupation" value={profile.occupation || 'Not specified'} />
                <InfoItem label="Annual Income" value={profile.annual_income || 'Not specified'} />
              </div>
            </div>

            {/* Location */}
            <div className="card p-3 sm:p-4 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
                Location
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <InfoItem label="City" value={profile.city || 'Not specified'} />
                <InfoItem label="State" value={profile.state || 'Not specified'} />
                <InfoItem label="Country" value={profile.country || 'India'} />
              </div>
            </div>

            {/* About */}
            {profile.about_me && (
              <div className="card p-3 sm:p-4 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
                  About Me
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{profile.about_me}</p>
              </div>
            )}

            {/* Looking For */}
            {profile.looking_for && (
              <div className="card p-3 sm:p-4 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
                  What I'm Looking For
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{profile.looking_for}</p>
              </div>
            )}

            {/* Hobbies */}
            {profile.hobbies && (
              <div className="card p-3 sm:p-4 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
                  Hobbies & Interests
                </h3>
                <p className="text-sm sm:text-base text-gray-700">{profile.hobbies}</p>
              </div>
            )}

            {/* Profile Created By */}
            <div className="card p-3 sm:p-4 md:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b">
                Additional Information
              </h3>
              <InfoItem
                label="Profile Created By"
                value={profile.created_by?.replace('_', ' ') || 'Self'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">{label}</p>
    <p className="text-sm sm:text-base text-gray-800 font-medium capitalize">{value}</p>
  </div>
);

export default ProfileView;
