import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Star, Award, Check, Heart, MapPin, Briefcase, GraduationCap, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useModules } from '../context/ModuleContext';

// Membership Badge Component - Dynamically controlled by superadmin module settings
const MembershipBadge = ({ membershipType, isActive, isMembershipEnabled }) => {
  // Check if membership module is enabled
  if (!isMembershipEnabled) return null;
  if (!membershipType || !isActive) return null;

  const badges = {
    gold: { icon: Award, gradient: 'from-yellow-400 to-amber-500', label: 'Gold' },
    platinum: { icon: Star, gradient: 'from-gray-400 to-gray-600', label: 'Platinum' },
    premium: { icon: Crown, gradient: 'from-purple-500 to-purple-700', label: 'Premium' }
  };

  const badge = badges[membershipType?.toLowerCase()];
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <div className={`bg-gradient-to-r ${badge.gradient} text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg shadow-lg flex items-center gap-1`}>
      <Icon size={12} className="sm:w-3.5 sm:h-3.5" />
      <span className="hidden sm:inline">{badge.label}</span>
    </div>
  );
};

// Match Score Badge
const MatchScoreBadge = ({ score }) => {
  const getScoreConfig = (score) => {
    if (score >= 80) return { gradient: 'from-emerald-400 to-emerald-600', text: 'Excellent' };
    if (score >= 60) return { gradient: 'from-blue-400 to-blue-600', text: 'Good' };
    if (score >= 40) return { gradient: 'from-amber-400 to-amber-600', text: 'Fair' };
    return { gradient: 'from-orange-400 to-orange-600', text: 'Low' };
  };

  const config = getScoreConfig(score);

  return (
    <div className={`bg-gradient-to-r ${config.gradient} text-white text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg`}>
      {score}%
    </div>
  );
};

const ProfileCard = ({ profile, showMatchScore = false, onInterestSent }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isModuleEnabled } = useModules();
  const isMembershipEnabled = isModuleEnabled('membership');
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestSent, setInterestSent] = useState(profile.interest_sent || false);
  const [isHovered, setIsHovered] = useState(false);

  const avatarBgColor = theme?.primary?.replace('#', '') || '8B1538';

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

  const handleSendInterest = async (e) => {
    e.stopPropagation();
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

  const age = profile.age || calculateAge(profile.date_of_birth);

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProfile}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={profile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=400&background=${avatarBgColor}&color=fff`}
          alt={profile.full_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=400&background=${avatarBgColor}&color=fff`;
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {isMembershipEnabled && profile.membership_type && profile.is_membership_active && (
            <MembershipBadge
              membershipType={profile.membership_type}
              isActive={profile.is_membership_active}
              isMembershipEnabled={isMembershipEnabled}
            />
          )}
          {showMatchScore && profile.match_score !== undefined && (
            <div className={`${!(isMembershipEnabled && profile.membership_type) ? 'ml-auto' : ''}`}>
              <MatchScoreBadge score={profile.match_score} />
            </div>
          )}
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h3 className="text-white font-bold text-sm sm:text-base truncate mb-1">
            {profile.full_name}
          </h3>
          <div className="flex items-center gap-1.5 text-white/90 text-[10px] sm:text-xs">
            <User size={12} className="flex-shrink-0" />
            <span>{age} yrs</span>
            {profile.height && (
              <>
                <span className="text-white/50">•</span>
                <span>{profile.height}cm</span>
              </>
            )}
            {profile.city && (
              <>
                <span className="text-white/50 hidden sm:inline">•</span>
                <span className="hidden sm:inline truncate">{profile.city}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-3 sm:p-4">
        {/* Quick Info */}
        <div className="space-y-1.5 mb-3">
          {profile.education && (
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600">
              <GraduationCap size={12} className="text-primary flex-shrink-0" />
              <span className="truncate">{profile.education}</span>
            </div>
          )}
          {profile.occupation && (
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600">
              <Briefcase size={12} className="text-primary flex-shrink-0" />
              <span className="truncate">{profile.occupation}</span>
            </div>
          )}
          {(profile.religion || profile.caste) && (
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600">
              <Star size={12} className="text-primary flex-shrink-0" />
              <span className="truncate">
                {profile.religion}{profile.caste ? ` • ${profile.caste}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile();
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl transition-all"
          >
            View Profile
          </button>
          {onInterestSent && (
            <button
              onClick={handleSendInterest}
              disabled={sendingInterest || interestSent}
              className={`flex-1 text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                interestSent
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {sendingInterest ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : interestSent ? (
                <>
                  <Check size={14} />
                  <span className="hidden sm:inline">Sent</span>
                </>
              ) : (
                <>
                  <Heart size={14} fill="currentColor" />
                  <span className="hidden sm:inline">Interest</span>
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
