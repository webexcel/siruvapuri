import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { profileAPI, authAPI } from '../utils/api';
import { showSuccess, showError, showLoading } from '../utils/sweetalert';
import Swal from 'sweetalert2';
import { Camera, Upload, User, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import ImageCropper from '../components/ImageCropper';

const EditProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8 animate-pulse">
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="card mb-6">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j}>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Collapsible Section Component
const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xl font-bold text-gray-800 pb-3 border-b"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="pt-4">{children}</div>}
    </div>
  );
};

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const avatarBgColor = theme?.primary?.replace('#', '') || '8B1538';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    // Primary Information
    full_name: '',
    phone: '',
    age: '',
    date_of_birth: '',
    birth_place: '',
    religion: '',
    caste: '',
    sub_caste: '',

    // Physical Attributes
    height: '',
    weight: '',
    complexion: 'wheatish',
    blood_group: '',
    physical_status: 'normal',

    // Background
    marital_status: 'never_married',
    mother_tongue: '',

    // Education & Career
    education: '',
    education_detail: '',
    occupation: '',
    company_name: '',
    working_place: '',
    annual_income: '',
    monthly_income: '',

    // Horoscope Details
    time_of_birth: '',
    time_of_birth_ampm: 'AM',
    rasi: '',
    nakshatra: '',
    lagnam: '',
    kothram: '',
    dosham: '',
    matching_stars: '',

    // Family Information
    father_name: '',
    father_occupation: '',
    father_status: 'alive',
    mother_name: '',
    mother_occupation: '',
    mother_status: 'alive',
    brothers_count: 0,
    brothers_married: 0,
    sisters_count: 0,
    sisters_married: 0,
    family_type: 'nuclear',
    family_status: 'middle_class',
    own_house: 'yes',
    native_place: '',

    // Contact & Address
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',

    // Alliance Expectations
    expected_age_min: '',
    expected_age_max: '',
    expected_qualification: '',
    expected_location: '',
    expected_income: '',

    // About
    about_me: '',
    looking_for: '',
    hobbies: '',

    // Other
    created_by: 'self',
    profile_picture: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data.user;

      setProfileData(prev => ({
        ...prev,
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        age: userData.age || '',
        date_of_birth: userData.date_of_birth ? userData.date_of_birth.split('T')[0] : '',
        birth_place: userData.birth_place || '',
        height: userData.height || '',
        weight: userData.weight || '',
        complexion: userData.complexion || 'wheatish',
        blood_group: userData.blood_group || '',
        physical_status: userData.physical_status || 'normal',
        marital_status: userData.marital_status || 'never_married',
        religion: userData.religion || '',
        caste: userData.caste || '',
        sub_caste: userData.sub_caste || '',
        mother_tongue: userData.mother_tongue || '',
        education: userData.education || '',
        education_detail: userData.education_detail || '',
        occupation: userData.occupation || '',
        company_name: userData.company_name || '',
        working_place: userData.working_place || '',
        annual_income: userData.annual_income || '',
        monthly_income: userData.monthly_income || '',
        time_of_birth: userData.time_of_birth || '',
        rasi: userData.rasi || '',
        nakshatra: userData.nakshatra || '',
        lagnam: userData.lagnam || '',
        kothram: userData.kothram || '',
        dosham: userData.dosham || '',
        matching_stars: userData.matching_stars || '',
        father_name: userData.father_name || '',
        father_occupation: userData.father_occupation || '',
        father_status: userData.father_status || 'alive',
        mother_name: userData.mother_name || '',
        mother_occupation: userData.mother_occupation || '',
        mother_status: userData.mother_status || 'alive',
        brothers_count: userData.brothers_count || 0,
        brothers_married: userData.brothers_married || 0,
        sisters_count: userData.sisters_count || 0,
        sisters_married: userData.sisters_married || 0,
        family_type: userData.family_type || 'nuclear',
        family_status: userData.family_status || 'middle_class',
        own_house: userData.own_house || 'yes',
        native_place: userData.native_place || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        country: userData.country || 'India',
        pincode: userData.pincode || '',
        expected_age_min: userData.expected_age_min || '',
        expected_age_max: userData.expected_age_max || '',
        expected_qualification: userData.expected_qualification || '',
        expected_location: userData.expected_location || '',
        expected_income: userData.expected_income || '',
        about_me: userData.about_me || '',
        looking_for: userData.looking_for || '',
        hobbies: userData.hobbies || '',
        created_by: userData.created_by || 'self',
        profile_picture: userData.profile_picture || ''
      }));
    } catch (error) {
      showError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    showLoading('Saving your profile...');

    try {
      await profileAPI.updateProfile(profileData);

      Swal.close();
      await showSuccess('Profile updated successfully!', 'Success!');
      navigate('/dashboard');
    } catch (error) {
      Swal.close();
      showError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    e.target.value = '';

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob) => {
    setShowCropper(false);
    setSelectedImage(null);
    setUploadingPhoto(true);
    showLoading('Uploading photo...');

    try {
      const formData = new FormData();
      formData.append('photo', croppedBlob, 'profile.jpg');

      const response = await profileAPI.uploadPhoto(formData);

      setProfileData(prev => ({
        ...prev,
        profile_picture: response.data.profile_picture
      }));

      if (updateUser) {
        updateUser({ profile_picture: response.data.profile_picture });
      }

      Swal.close();
      showSuccess('Photo uploaded successfully!');
    } catch (error) {
      Swal.close();
      showError(error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
  };

  const handleRemovePhoto = async () => {
    const result = await Swal.fire({
      title: 'Remove Photo?',
      text: 'Are you sure you want to remove your profile photo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it'
    });

    if (result.isConfirmed) {
      setProfileData(prev => ({
        ...prev,
        profile_picture: ''
      }));
      showSuccess('Photo removed. Remember to save your changes.');
    }
  };

  if (loading) {
    return <EditProfileSkeleton />;
  }

  // Rasi options
  const rasiOptions = [
    'Mesham (Aries)', 'Rishabam (Taurus)', 'Mithunam (Gemini)', 'Kadagam (Cancer)',
    'Simmam (Leo)', 'Kanni (Virgo)', 'Thulam (Libra)', 'Viruchigam (Scorpio)',
    'Dhanusu (Sagittarius)', 'Makaram (Capricorn)', 'Kumbam (Aquarius)', 'Meenam (Pisces)'
  ];

  // Nakshatra options
  const nakshatraOptions = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        {/* Profile Picture Section */}
        <div className="card mb-6">
          <div className="flex flex-col items-center py-6">
            <div className="relative mb-6">
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
                {profileData.profile_picture ? (
                  <img
                    src={profileData.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || 'User')}&size=200&background=${avatarBgColor}&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary/50" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-2 right-2 bg-primary text-white p-2.5 sm:p-3 rounded-full shadow-lg hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 hover:scale-110"
              >
                {uploadingPhoto ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
              {profileData.full_name || 'Your Name'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {profileData.city && profileData.state
                ? `${profileData.city}, ${profileData.state}`
                : 'Add your location'}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-medium text-sm"
              >
                {uploadingPhoto ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {profileData.profile_picture ? 'Change Photo' : 'Upload Photo'}
                  </>
                )}
              </button>

              {profileData.profile_picture && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <p className="text-xs text-gray-400 mt-4 text-center">
              Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
            </p>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Edit Profile</h1>
          <p className="text-sm sm:text-base text-gray-600">Update your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Primary Information */}
          <CollapsibleSection title="Primary Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Full Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth (D.O.B)</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={profileData.date_of_birth}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={profileData.age}
                  onChange={handleChange}
                  className="input-field"
                  min="18"
                  max="100"
                  placeholder="e.g., 25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birth Place</label>
                <input
                  type="text"
                  name="birth_place"
                  value={profileData.birth_place}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Chennai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                <select
                  name="religion"
                  value={profileData.religion}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Jain">Jain</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caste</label>
                <input
                  type="text"
                  name="caste"
                  value={profileData.caste}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Naidu, Mudaliar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Caste</label>
                <input
                  type="text"
                  name="sub_caste"
                  value={profileData.sub_caste}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Balija Naidu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Complexion</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'very_fair', label: 'Very Fair' },
                    { value: 'fair', label: 'Fair' },
                    { value: 'wheatish', label: 'Wheatish' },
                    { value: 'brown', label: 'Brown' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="complexion"
                        value={option.value}
                        checked={profileData.complexion === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother Tongue</label>
                <select
                  name="mother_tongue"
                  value={profileData.mother_tongue}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </CollapsibleSection>

          {/* Educational Qualification */}
          <CollapsibleSection title="Educational Qualification">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UG (Under Graduate)</label>
                <input
                  type="text"
                  name="education"
                  value={profileData.education}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., BCA, B.Com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PG (Post Graduate)</label>
                <input
                  type="text"
                  name="education_detail"
                  value={profileData.education_detail}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., MCA, MBA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diploma</label>
                <input
                  type="text"
                  name="diploma"
                  value={profileData.diploma || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., DCA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Others</label>
                <input
                  type="text"
                  name="other_qualification"
                  value={profileData.other_qualification || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Other qualifications"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession / Designation</label>
                <input
                  type="text"
                  name="occupation"
                  value={profileData.occupation}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Software Engineer, Doctor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income</label>
                <input
                  type="text"
                  name="monthly_income"
                  value={profileData.monthly_income}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 50,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
                <input
                  type="text"
                  name="annual_income"
                  value={profileData.annual_income}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 6,00,000"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Working Details */}
          <CollapsibleSection title="Working Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={profileData.company_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., TCS, Infosys"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Place</label>
                <input
                  type="text"
                  name="working_place"
                  value={profileData.working_place}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Chennai, Bangalore"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Family Information */}
          <CollapsibleSection title="Family Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father Name</label>
                <input
                  type="text"
                  name="father_name"
                  value={profileData.father_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Father's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father Occupation</label>
                <input
                  type="text"
                  name="father_occupation"
                  value={profileData.father_occupation}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Business, Govt Employee"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father Status</label>
                <select
                  name="father_status"
                  value={profileData.father_status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="alive">Alive</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother Name</label>
                <input
                  type="text"
                  name="mother_name"
                  value={profileData.mother_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Mother's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother Occupation</label>
                <input
                  type="text"
                  name="mother_occupation"
                  value={profileData.mother_occupation}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Homemaker, Teacher"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother Status</label>
                <select
                  name="mother_status"
                  value={profileData.mother_status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="alive">Alive</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">No. of Sisters</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Married</label>
                    <input
                      type="number"
                      name="sisters_married"
                      value={profileData.sisters_married}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Un Married</label>
                    <input
                      type="number"
                      name="sisters_count"
                      value={profileData.sisters_count}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">No. of Brothers</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Married</label>
                    <input
                      type="number"
                      name="brothers_married"
                      value={profileData.brothers_married}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Un Married</label>
                    <input
                      type="number"
                      name="brothers_count"
                      value={profileData.brothers_count}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Native Place</label>
                <input
                  type="text"
                  name="native_place"
                  value={profileData.native_place}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Chennai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Own House</label>
                <select
                  name="own_house"
                  value={profileData.own_house}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
          </CollapsibleSection>

          {/* Horoscope */}
          <CollapsibleSection title="Horoscope" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time of Birth</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    name="time_of_birth"
                    value={profileData.time_of_birth}
                    onChange={handleChange}
                    className="input-field flex-1"
                  />
                  <select
                    name="time_of_birth_ampm"
                    value={profileData.time_of_birth_ampm || 'AM'}
                    onChange={handleChange}
                    className="input-field w-20"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rasi</label>
                <select
                  name="rasi"
                  value={profileData.rasi}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Rasi</option>
                  {rasiOptions.map(rasi => (
                    <option key={rasi} value={rasi}>{rasi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Star (Nakshatra)</label>
                <select
                  name="nakshatra"
                  value={profileData.nakshatra}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Star</option>
                  {nakshatraOptions.map(star => (
                    <option key={star} value={star}>{star}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lagnam</label>
                <select
                  name="lagnam"
                  value={profileData.lagnam}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Lagnam</option>
                  {rasiOptions.map(lagnam => (
                    <option key={lagnam} value={lagnam}>{lagnam}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kothram (Gothram)</label>
                <input
                  type="text"
                  name="kothram"
                  value={profileData.kothram}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Bharadwaja"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (in feet)</label>
                <input
                  type="text"
                  name="height"
                  value={profileData.height}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 5.6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={profileData.weight}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 50"
                  min="30"
                  max="200"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Matching Stars</label>
                <textarea
                  name="matching_stars"
                  value={profileData.matching_stars}
                  onChange={handleChange}
                  className="input-field"
                  rows="2"
                  placeholder="e.g., Ashwini, Bharani, Krittika, Rohini, Mrigashira, Punarvasu..."
                ></textarea>
              </div>
            </div>
          </CollapsibleSection>

          {/* Marital Status */}
          <CollapsibleSection title="Marital Status">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: 'never_married', label: 'Unmarried' },
                    { value: 'second_marriage', label: 'Married (Second Marriage)' },
                    { value: 'widowed', label: 'Widow / Widower' },
                    { value: 'divorced', label: 'Divorcee / Divorcer' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="marital_status"
                        value={option.value}
                        checked={profileData.marital_status === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Physical Status</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { value: 'normal', label: 'Normal' },
                    { value: 'physically_challenged', label: 'Physically Challenged' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="physical_status"
                        value={option.value}
                        checked={profileData.physical_status === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {profileData.physical_status === 'physically_challenged' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">If Applicable, Please give details</label>
                  <textarea
                    name="physical_status_details"
                    value={profileData.physical_status_details || ''}
                    onChange={handleChange}
                    className="input-field"
                    rows="2"
                    placeholder="Please provide details..."
                  ></textarea>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Alliance Expectation Details */}
          <CollapsibleSection title="Alliance Expectation Details" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Age (Min)</label>
                <input
                  type="number"
                  name="expected_age_min"
                  value={profileData.expected_age_min}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 25"
                  min="18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Age (Max)</label>
                <input
                  type="number"
                  name="expected_age_max"
                  value={profileData.expected_age_max}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 35"
                  min="18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Qualification</label>
                <input
                  type="text"
                  name="expected_qualification"
                  value={profileData.expected_qualification}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Degree, Any Graduate"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Residential Address with Contact No */}
          <CollapsibleSection title="Residential Address with Contact No">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="House No, Street Name, Area, City - Pincode"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Chennai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={profileData.pincode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 600001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone / Contact No</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={profileData.state}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Tamil Nadu"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* About You (optional) */}
          <CollapsibleSection title="About You (Optional)" defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
                <textarea
                  name="about_me"
                  value={profileData.about_me}
                  onChange={handleChange}
                  className="input-field"
                  rows="4"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What I'm Looking For</label>
                <textarea
                  name="looking_for"
                  value={profileData.looking_for}
                  onChange={handleChange}
                  className="input-field"
                  rows="4"
                  placeholder="Describe your ideal partner..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hobbies & Interests</label>
                <input
                  type="text"
                  name="hobbies"
                  value={profileData.hobbies}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Reading, Traveling, Music, Sports"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropper
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}
    </div>
  );
};

export default EditProfile;
