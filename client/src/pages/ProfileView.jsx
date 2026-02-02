import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI, matchAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/sweetalert';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useModules } from '../context/ModuleContext';
import {
  Crown, Star, Award, ArrowLeft, Heart, Check, MapPin, Briefcase,
  GraduationCap, User, Phone, Mail, Calendar, Ruler, Weight,
  Globe, Building2, Users, Sparkles, MessageCircle, BookHeart
} from 'lucide-react';

// Membership Badge Component - Dynamically controlled by superadmin module settings
const MembershipBadge = ({ membershipType, isActive, size = 'md', isMembershipEnabled }) => {
  // Check if membership module is enabled
  if (!isMembershipEnabled) return null;
  if (!membershipType || !isActive) return null;

  const badges = {
    gold: { icon: Award, color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', label: 'Gold Member' },
    platinum: { icon: Star, color: 'bg-gradient-to-r from-gray-400 to-gray-600', label: 'Platinum Member' },
    premium: { icon: Crown, color: 'bg-gradient-to-r from-purple-500 to-purple-700', label: 'Premium Member' }
  };

  const badge = badges[membershipType];
  if (!badge) return null;

  const Icon = badge.icon;
  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1 text-xs gap-1'
    : 'px-3 py-1.5 text-sm gap-1.5';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-semibold ${badge.color} text-white shadow-lg`}>
      <Icon size={iconSize} />
      {badge.label}
    </span>
  );
};

const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isModuleEnabled } = useModules();
  const avatarBgColor = theme?.primary?.replace('#', '') || '8B1538';
  const isMembershipEnabled = isModuleEnabled('membership');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [viewLimitReached, setViewLimitReached] = useState(false);
  const [viewLimitMessage, setViewLimitMessage] = useState('');

  useEffect(() => {
    if (id) {
      checkAndFetchProfile();
      checkInterestStatus();
    }
  }, [id]);

  const checkAndFetchProfile = async () => {
    setLoading(true);
    setError(null);
    setViewLimitReached(false);

    try {
      try {
        const canViewResponse = await profileAPI.checkCanViewProfile(id);
        if (canViewResponse.data && !canViewResponse.data.canView) {
          setViewLimitReached(true);
          setViewLimitMessage(canViewResponse.data.message || 'Profile view limit reached');
          setLoading(false);
          return;
        }
      } catch (checkErr) {
        console.warn('Profile view limit check failed, proceeding to load profile:', checkErr);
      }

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

  if (viewLimitReached) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Crown size={36} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Profile View Limit Reached</h2>
          <p className="text-gray-600 mb-6">{viewLimitMessage}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary px-6">
              Go Back
            </button>
            {isMembershipEnabled && (
              <button onClick={() => navigate('/membership')} className="btn-primary px-6">
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            {error ? 'Error Loading Profile' : 'Profile Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The profile you are looking for does not exist.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => checkAndFetchProfile()} className="btn-secondary px-6">
              Retry
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary px-6">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && user.id === parseInt(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Search</span>
        </button>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Hero Section - Photo + Basic Info */}
          <div className="relative">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-50 to-primary/5 h-32 sm:h-40"></div>

            <div className="relative flex flex-col sm:flex-row p-4 sm:p-6 gap-5">
              {/* Profile Photo */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="relative">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden ring-4 ring-white shadow-2xl">
                    <img
                      src={profile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=400&background=${avatarBgColor}&color=fff`}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=400&background=${avatarBgColor}&color=fff`;
                      }}
                    />
                  </div>
                  {/* Membership Badge on Photo */}
                  {isMembershipEnabled && profile.membership_type && profile.is_membership_active && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <MembershipBadge
                        membershipType={profile.membership_type}
                        isActive={profile.is_membership_active}
                        size="sm"
                        isMembershipEnabled={isMembershipEnabled}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center sm:text-left pt-2 sm:pt-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>

                {/* Quick Info Tags */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                    <User size={14} className="text-primary" />
                    {profile.age || 'N/A'} yrs
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 capitalize">
                    {profile.gender || 'N/A'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
                    <MapPin size={14} className="text-primary" />
                    {profile.city || 'Not specified'}
                  </span>
                </div>

                {/* Occupation & Education */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-600 mb-5">
                  {profile.occupation && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={15} className="text-primary/70" />
                      {profile.occupation}
                    </span>
                  )}
                  {profile.education && (
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={15} className="text-primary/70" />
                      {profile.education}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex justify-center sm:justify-start">
                  {!isOwnProfile ? (
                    <button
                      onClick={handleSendInterest}
                      disabled={sendingInterest || interestSent}
                      className={`py-3 px-8 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                        interestSent
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-primary to-primary-dark text-white'
                      }`}
                    >
                      {sendingInterest ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : interestSent ? (
                        <>
                          <Check size={18} />
                          Interest Sent
                        </>
                      ) : (
                        <>
                          <Heart size={18} />
                          Send Interest
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="py-3 px-8 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-y border-gray-200">
            <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-gray-200">
              <QuickStat icon={Ruler} label="Height" value={profile.height ? `${profile.height} cm` : '-'} />
              <QuickStat icon={Weight} label="Weight" value={profile.weight ? `${profile.weight} kg` : '-'} />
              <QuickStat icon={Heart} label="Status" value={profile.marital_status?.replace('_', ' ') || '-'} />
              <QuickStat icon={Sparkles} label="Religion" value={profile.religion || '-'} />
              <QuickStat icon={Users} label="Caste" value={profile.caste || '-'} />
              <QuickStat icon={MessageCircle} label="Tongue" value={profile.mother_tongue || '-'} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Professional & Location */}
              <DetailCard
                icon={Briefcase}
                title="Professional & Location"
                gradient="from-blue-500 to-blue-600"
              >
                <DetailItem icon={GraduationCap} label="Education" value={profile.education} />
                <DetailItem icon={Briefcase} label="Occupation" value={profile.occupation} />
                <DetailItem icon={Building2} label="Income" value={profile.annual_income} />
                <DetailItem icon={MapPin} label="City" value={profile.city} />
                <DetailItem icon={Globe} label="State" value={profile.state} />
                <DetailItem icon={Globe} label="Country" value={profile.country || 'India'} />
              </DetailCard>

              {/* Personal Details */}
              <DetailCard
                icon={User}
                title="Personal Details"
                gradient="from-purple-500 to-purple-600"
              >
                <DetailItem icon={Calendar} label="Age" value={profile.age ? `${profile.age} years` : null} />
                <DetailItem icon={Ruler} label="Height" value={profile.height ? `${profile.height} cm` : null} />
                <DetailItem icon={Weight} label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
                <DetailItem icon={Heart} label="Marital Status" value={profile.marital_status?.replace('_', ' ')} />
                <DetailItem icon={User} label="Gender" value={profile.gender} />
                <DetailItem icon={MessageCircle} label="Mother Tongue" value={profile.mother_tongue} />
              </DetailCard>

              {/* Religious Background */}
              <DetailCard
                icon={Sparkles}
                title="Religious Background"
                gradient="from-amber-500 to-amber-600"
              >
                <DetailItem icon={Sparkles} label="Religion" value={profile.religion} />
                <DetailItem icon={Users} label="Caste" value={profile.caste} />
                <DetailItem icon={User} label="Created By" value={profile.created_by?.replace('_', ' ') || 'Self'} />
              </DetailCard>
            </div>

            {/* Contact Information */}
            {(profile.phone || profile.email || profile.address) && (
              <div className="mt-5">
                <div className="bg-gradient-to-br from-primary/5 via-purple-50 to-primary/10 rounded-2xl p-5 border border-primary/10">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                      <Phone size={16} className="text-white" />
                    </div>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.phone && (
                      <ContactCard
                        icon={Phone}
                        label="Phone"
                        value={profile.phone}
                        href={`tel:${profile.phone}`}
                        color="from-green-500 to-emerald-600"
                      />
                    )}
                    {profile.email && (
                      <ContactCard
                        icon={Mail}
                        label="Email"
                        value={profile.email}
                        href={`mailto:${profile.email}`}
                        color="from-blue-500 to-blue-600"
                      />
                    )}
                  </div>
                  {(profile.address || (profile.city && profile.state)) && (
                    <div className="mt-4 flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                          {profile.address && <span>{profile.address}<br /></span>}
                          {[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
                          {profile.country && profile.country !== 'India' && `, ${profile.country}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About Sections */}
            {(profile.about_me || profile.looking_for || profile.hobbies) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                {profile.about_me && (
                  <AboutCard
                    icon={User}
                    title="About Me"
                    content={profile.about_me}
                    gradient="from-indigo-500 to-indigo-600"
                  />
                )}
                {profile.looking_for && (
                  <AboutCard
                    icon={BookHeart}
                    title="Looking For"
                    content={profile.looking_for}
                    gradient="from-pink-500 to-rose-600"
                  />
                )}
                {profile.hobbies && (
                  <AboutCard
                    icon={Sparkles}
                    title="Hobbies & Interests"
                    content={profile.hobbies}
                    gradient="from-teal-500 to-teal-600"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Stat Component for the stats bar
const QuickStat = ({ icon: Icon, label, value }) => (
  <div className="py-4 px-2 text-center">
    <div className="flex justify-center mb-1.5">
      <Icon size={16} className="text-primary" />
    </div>
    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm font-bold text-gray-800 capitalize truncate px-1">{value}</p>
  </div>
);

// Detail Card Component
const DetailCard = ({ icon: Icon, title, gradient, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center gap-2`}>
      <Icon size={18} className="text-white" />
      <h3 className="text-sm font-bold text-white">{title}</h3>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

// Detail Item Component
const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="flex items-center gap-2 text-gray-500">
      <Icon size={14} className="text-gray-400" />
      {label}
    </span>
    <span className="text-gray-800 font-medium capitalize text-right">{value || 'Not Specified'}</span>
  </div>
);

// Contact Card Component
const ContactCard = ({ icon: Icon, label, value, href, color }) => (
  <a
    href={href}
    className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group"
  >
    <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors truncate">{value}</p>
    </div>
  </a>
);

// About Card Component
const AboutCard = ({ icon: Icon, title, content, gradient }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center gap-2`}>
      <Icon size={18} className="text-white" />
      <h3 className="text-sm font-bold text-white">{title}</h3>
    </div>
    <div className="p-4">
      <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
    </div>
  </div>
);

export default ProfileView;
