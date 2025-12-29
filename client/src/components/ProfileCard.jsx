import { useNavigate } from 'react-router-dom';

const ProfileCard = ({ profile, showMatchScore = false, onInterestSent }) => {
  const navigate = useNavigate();

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

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="card hover:scale-105 transition-transform duration-200">
      <div className="relative">
        <img
          src={profile.profile_picture || 'https://via.placeholder.com/300x300?text=No+Photo'}
          alt={profile.full_name}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        {showMatchScore && profile.match_score !== undefined && (
          <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 shadow-md">
            <span className={`font-bold text-lg ${getMatchScoreColor(profile.match_score)}`}>
              {profile.match_score}%
            </span>
            <span className="text-xs text-gray-600 ml-1">Match</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-800">{profile.full_name}</h3>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{profile.age || calculateAge(profile.date_of_birth)} yrs</span>
          {profile.height && <span>{profile.height} cm</span>}
          {profile.city && <span>{profile.city}</span>}
        </div>

        <div className="space-y-1 text-sm">
          {profile.education && (
            <p className="text-gray-700">
              <span className="font-semibold">Education:</span> {profile.education}
            </p>
          )}
          {profile.occupation && (
            <p className="text-gray-700">
              <span className="font-semibold">Occupation:</span> {profile.occupation}
            </p>
          )}
          {profile.religion && (
            <p className="text-gray-700">
              <span className="font-semibold">Religion:</span> {profile.religion}
            </p>
          )}
        </div>

        {profile.about_me && (
          <p className="text-gray-600 text-sm line-clamp-2 mt-2">
            {profile.about_me}
          </p>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleViewProfile}
            className="flex-1 btn-secondary text-sm py-2"
          >
            View Profile
          </button>
          {onInterestSent && (
            <button
              onClick={() => onInterestSent(profile.id)}
              className="flex-1 btn-primary text-sm py-2"
            >
              Send Interest
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
