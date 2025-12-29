import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI, matchAPI } from '../utils/api';

const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile(id);
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async () => {
    try {
      await matchAPI.sendInterest({ receiver_id: parseInt(id) });
      alert('Interest sent successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send interest');
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture and Quick Actions */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <img
                src={profile.profile_picture || 'https://via.placeholder.com/400x400?text=No+Photo'}
                alt={profile.full_name}
                className="w-full h-80 object-cover rounded-lg mb-6"
              />

              <h2 className="text-2xl font-bold text-gray-800 mb-2">{profile.full_name}</h2>
              <p className="text-gray-600 mb-6">
                {profile.age || calculateAge(profile.date_of_birth)} years • {profile.city || 'Location not specified'}
              </p>

              <button
                onClick={handleSendInterest}
                className="w-full btn-primary mb-3"
              >
                Send Interest
              </button>

              <button className="w-full btn-secondary">
                Shortlist
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Age" value={`${profile.age || calculateAge(profile.date_of_birth)} years`} />
                <InfoItem label="Height" value={profile.height ? `${profile.height} cm` : 'Not specified'} />
                <InfoItem label="Weight" value={profile.weight ? `${profile.weight} kg` : 'Not specified'} />
                <InfoItem label="Marital Status" value={profile.marital_status?.replace('_', ' ') || 'Not specified'} />
                <InfoItem label="Gender" value={profile.gender || 'Not specified'} />
                <InfoItem label="Mother Tongue" value={profile.mother_tongue || 'Not specified'} />
              </div>
            </div>

            {/* Religious Information */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                Religious Background
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Religion" value={profile.religion || 'Not specified'} />
                <InfoItem label="Caste" value={profile.caste || 'Not specified'} />
              </div>
            </div>

            {/* Professional Information */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Education" value={profile.education || 'Not specified'} />
                <InfoItem label="Occupation" value={profile.occupation || 'Not specified'} />
                <InfoItem label="Annual Income" value={profile.annual_income || 'Not specified'} />
              </div>
            </div>

            {/* Location */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="City" value={profile.city || 'Not specified'} />
                <InfoItem label="State" value={profile.state || 'Not specified'} />
                <InfoItem label="Country" value={profile.country || 'India'} />
              </div>
            </div>

            {/* About */}
            {profile.about_me && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                  About Me
                </h3>
                <p className="text-gray-700 leading-relaxed">{profile.about_me}</p>
              </div>
            )}

            {/* Looking For */}
            {profile.looking_for && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                  What I'm Looking For
                </h3>
                <p className="text-gray-700 leading-relaxed">{profile.looking_for}</p>
              </div>
            )}

            {/* Hobbies */}
            {profile.hobbies && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
                  Hobbies & Interests
                </h3>
                <p className="text-gray-700">{profile.hobbies}</p>
              </div>
            )}

            {/* Profile Created By */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">
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
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-gray-800 font-medium capitalize">{value}</p>
  </div>
);

export default ProfileView;
