import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI, matchAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/sweetalert';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { useAuth } from '../context/AuthContext';
import { Crown, Star, Award, ArrowLeft, Heart, Check, MapPin, Briefcase, GraduationCap, User } from 'lucide-react';

// Membership Badge Component
const MembershipBadge = ({ membershipType, isActive, size = 'md' }) => {
  if (!membershipType || !isActive) return null;

  const badges = {
    gold: { icon: Award, color: 'bg-yellow-500', label: 'Gold Member' },
    platinum: { icon: Star, color: 'bg-gray-400', label: 'Platinum Member' },
    premium: { icon: Crown, color: 'bg-purple-500', label: 'Premium Member' }
  };

  const badge = badges[membershipType];
  if (!badge) return null;

  const Icon = badge.icon;
  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-xs gap-1'
    : 'px-3 py-1.5 text-sm gap-1.5';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-semibold ${badge.color} text-white shadow-sm`}>
      <Icon size={iconSize} />
      {badge.label}
    </span>
  );
};

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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
            {error ? 'Error Loading Profile' : 'Profile Not Found'}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {error || 'The profile you are looking for does not exist.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => fetchProfile()} className="btn-secondary text-sm">
              Retry
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && user.id === parseInt(id);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Top Section - Photo + Basic Info + Actions */}
          <div className="flex flex-col sm:flex-row">
            {/* Profile Photo */}
            <div className="sm:w-56 md:w-64 lg:w-72 flex-shrink-0">
              <div className="relative">
                <img
                  src={profile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=400&background=1EA826&color=fff`}
                  alt={profile.full_name}
                  className="w-full h-56 sm:h-full sm:min-h-[280px] object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=400&background=1EA826&color=fff`;
                  }}
                />
                {/* Membership Badge Overlay */}
                {profile.membership_type && profile.is_membership_active && (
                  <div className="absolute top-3 left-3">
                    <MembershipBadge
                      membershipType={profile.membership_type}
                      isActive={profile.is_membership_active}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info + Actions */}
            <div className="flex-1 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Name and Quick Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{profile.full_name}</h1>
                    <MembershipBadge
                      membershipType={profile.membership_type}
                      isActive={profile.is_membership_active}
                      size="sm"
                    />
                  </div>

                  {/* Quick Stats Row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600 mb-5">
                    <span className="flex items-center gap-1.5">
                      <User size={16} className="text-gray-400" />
                      {profile.age || 'N/A'} yrs, {profile.gender || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-gray-400" />
                      {profile.city || 'Not specified'}
                    </span>
                    {profile.occupation && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={16} className="text-gray-400" />
                        {profile.occupation}
                      </span>
                    )}
                    {profile.education && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={16} className="text-gray-400" />
                        {profile.education}
                      </span>
                    )}
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    <DetailChip label="Height" value={profile.height ? `${profile.height}cm` : '-'} />
                    <DetailChip label="Weight" value={profile.weight ? `${profile.weight}kg` : '-'} />
                    <DetailChip label="Status" value={profile.marital_status?.replace('_', ' ') || '-'} />
                    <DetailChip label="Religion" value={profile.religion || '-'} />
                    <DetailChip label="Caste" value={profile.caste || '-'} />
                    <DetailChip label="Tongue" value={profile.mother_tongue || '-'} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col gap-3 sm:w-36">
                  {!isOwnProfile ? (
                    <button
                      onClick={handleSendInterest}
                      disabled={sendingInterest || interestSent}
                      className={`flex-1 sm:w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        interestSent
                          ? 'bg-green-100 text-green-700'
                          : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {sendingInterest ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : interestSent ? (
                        <>
                          <Check size={18} />
                          Sent
                        </>
                      ) : (
                        <>
                          <Heart size={18} />
                          Interest
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="flex-1 sm:w-full btn-primary text-sm py-2.5 rounded-xl"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Sections */}
          <div className="border-t border-gray-100 p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Professional & Location */}
              <DetailSection title="Professional & Location">
                <DetailRow label="Education" value={profile.education} />
                <DetailRow label="Occupation" value={profile.occupation} />
                <DetailRow label="Income" value={profile.annual_income} />
                <DetailRow label="City" value={profile.city} />
                <DetailRow label="State" value={profile.state} />
                <DetailRow label="Country" value={profile.country || 'India'} />
              </DetailSection>

              {/* Personal Details */}
              <DetailSection title="Personal Details">
                <DetailRow label="Age" value={profile.age ? `${profile.age} years` : null} />
                <DetailRow label="Height" value={profile.height ? `${profile.height} cm` : null} />
                <DetailRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
                <DetailRow label="Marital Status" value={profile.marital_status?.replace('_', ' ')} />
                <DetailRow label="Gender" value={profile.gender} />
                <DetailRow label="Mother Tongue" value={profile.mother_tongue} />
              </DetailSection>

              {/* Religious Background */}
              <DetailSection title="Religious Background">
                <DetailRow label="Religion" value={profile.religion} />
                <DetailRow label="Caste" value={profile.caste} />
                <DetailRow label="Created By" value={profile.created_by?.replace('_', ' ') || 'Self'} />
              </DetailSection>
            </div>

            {/* Text Sections - About, Looking For, Hobbies */}
            {(profile.about_me || profile.looking_for || profile.hobbies) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                {profile.about_me && (
                  <TextSection title="About Me" content={profile.about_me} />
                )}
                {profile.looking_for && (
                  <TextSection title="Looking For" content={profile.looking_for} />
                )}
                {profile.hobbies && (
                  <TextSection title="Hobbies & Interests" content={profile.hobbies} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Detail Chip with better spacing - no truncation
const DetailChip = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-center border border-gray-100">
    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800 capitalize break-words">{value}</p>
  </div>
);

// Detail Section with Title
const DetailSection = ({ title, children }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">{title}</h3>
    <div className="space-y-2.5">{children}</div>
  </div>
);

// Detail Row - Label/Value pair
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium capitalize">{value || 'Not Specified'}</span>
  </div>
);

// Text Section for longer content
const TextSection = ({ title, content }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
  </div>
);

export default ProfileView;
