import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Star, Award, Check, Heart } from 'lucide-react';

// Membership Badge Component
const MembershipBadge = ({ membershipType, isActive }) => {
  if (!membershipType || !isActive) return null;

  const badges = {
    gold: { icon: Award, color: 'bg-yellow-500', label: 'Gold' },
    platinum: { icon: Star, color: 'bg-gray-400', label: 'Platinum' },
    premium: { icon: Crown, color: 'bg-purple-500', label: 'Premium' }
  };

  const badge = badges[membershipType?.toLowerCase()];
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <div className={`${badge.color} text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-md flex items-center gap-0.5 sm:gap-1`}>
      <Icon size={12} />
      <span className="hidden sm:inline">{badge.label}</span>
    </div>
  );
};

const ProfileCard = ({ profile, showMatchScore = false, onInterestSent }) => {
  const navigate = useNavigate();
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleViewProfile = () => {
    navigate(`/profile/${profile.id}`);
  };

  const handleSendInterest = async () => {
    if (sendingInterest || interestSent) return;

    setSendingInterest(true);
    try {
      await onInterestSent(profile.id);
      setInterestSent(true);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setSendingInterest(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="card p-2 sm:p-3 hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={profile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=300&background=00D26A&color=fff`}
          alt={profile.full_name}
          className="w-full h-40 sm:h-48 md:h-52 object-cover rounded-lg mb-2 sm:mb-3"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=300&background=00D26A&color=fff`;
          }}
        />
        {showMatchScore && profile.match_score !== undefined && (
          <div className="absolute top-1.5 right-1.5 bg-white rounded-full px-1.5 sm:px-2 py-0.5 shadow-md">
            <span className={`font-bold text-xs sm:text-sm ${getMatchScoreColor(profile.match_score)}`}>
              {profile.match_score}%
            </span>
          </div>
        )}
        {profile.membership_type && profile.is_membership_active && (
          <div className="absolute top-1.5 left-1.5">
            <MembershipBadge
              membershipType={profile.membership_type}
              isActive={profile.is_membership_active}
            />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-gray-800 truncate">{profile.full_name}</h3>

        <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs text-gray-600">
          <span>{profile.age || calculateAge(profile.date_of_birth)} yrs</span>
          {profile.height && (
            <>
              <span className="text-gray-300">•</span>
              <span>{profile.height}cm</span>
            </>
          )}
          {profile.city && (
            <>
              <span className="text-gray-300">•</span>
              <span className="truncate max-w-[60px] sm:max-w-[80px]">{profile.city}</span>
            </>
          )}
        </div>

        <div className="text-[10px] sm:text-xs text-gray-600 space-y-0.5">
          {profile.education && (
            <p className="truncate">{profile.education}</p>
          )}
          {profile.occupation && (
            <p className="truncate">{profile.occupation}</p>
          )}
          {profile.religion && (
            <p>{profile.religion}{profile.caste ? ` • ${profile.caste}` : ''}</p>
          )}
        </div>

        <div className="flex gap-1.5 sm:gap-2 pt-1.5 sm:pt-2">
          <button
            onClick={handleViewProfile}
            className="flex-1 btn-secondary text-[10px] sm:text-xs py-1.5 sm:py-2"
          >
            View
          </button>
          {onInterestSent && (
            <button
              onClick={handleSendInterest}
              disabled={sendingInterest || interestSent}
              className={`flex-1 text-[10px] sm:text-xs py-1.5 sm:py-2 flex items-center justify-center gap-1 cursor-pointer ${
                interestSent
                  ? 'bg-green-100 text-green-700 rounded-lg'
                  : 'btn-primary disabled:opacity-50'
              }`}
            >
              {sendingInterest ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : interestSent ? (
                <>
                  <Check size={12} />
                  <span>Sent</span>
                </>
              ) : (
                <>
                  <Heart size={12} />
                  <span>Interest</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
