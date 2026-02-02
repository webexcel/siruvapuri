import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminUserAPI } from '../utils/adminApi';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError, showLoading } from '../utils/sweetalert';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  Save,
  User,
  Camera,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ImageCropper from '../components/ImageCropper';

// Collapsible Section Component
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {Icon && <Icon size={20} className="text-primary" />}
          {title}
        </h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4 md:px-6 md:pb-6 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
};

const AdminEditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({
    // User table fields
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    age: '',
    gender: 'male',
    payment_status: 'unpaid',
    is_approved: false,

    // Profile fields - Primary Information
    full_name: '',
    date_of_birth: '',
    birth_place: '',
    religion: '',
    caste: '',
    sub_caste: '',
    mother_tongue: '',
    complexion: 'wheatish',

    // Physical Attributes
    height: '',
    weight: '',
    physical_status: 'normal',
    physical_status_details: '',

    // Marital Status
    marital_status: 'never_married',

    // Education & Career
    education: '',
    education_detail: '',
    occupation: '',
    monthly_income: '',
    annual_income: '',

    // Working Details
    company_name: '',
    working_place: '',

    // Family Information
    father_name: '',
    father_occupation: '',
    father_status: 'alive',
    mother_name: '',
    mother_occupation: '',
    mother_status: 'alive',
    sisters_married: 0,
    sisters_count: 0,
    brothers_married: 0,
    brothers_count: 0,
    native_place: '',
    own_house: 'yes',

    // Horoscope
    time_of_birth: '',
    rasi: '',
    nakshatra: '',
    lagnam: '',
    kothram: '',
    matching_stars: '',

    // Alliance Expectation
    expected_age_min: '',
    expected_age_max: '',
    expected_qualification: '',

    // Address
    address: '',
    city: '',
    pincode: '',
    state: '',
    country: 'India',

    // About
    about_me: '',
    looking_for: '',
    hobbies: '',
    created_by: 'self',
    profile_picture: ''
  });

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

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await adminUserAPI.getFullProfile(userId);
      const data = response.data.user;

      setUserData({
        email: data.email || '',
        first_name: data.first_name || '',
        middle_name: data.middle_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        age: data.age || '',
        gender: data.gender || 'male',
        payment_status: data.payment_status || 'unpaid',
        is_approved: data.is_approved || false,
        full_name: data.full_name || '',
        date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
        birth_place: data.birth_place || '',
        religion: data.religion || '',
        caste: data.caste || '',
        sub_caste: data.sub_caste || '',
        mother_tongue: data.mother_tongue || '',
        complexion: data.complexion || 'wheatish',
        height: data.height || '',
        weight: data.weight || '',
        physical_status: data.physical_status || 'normal',
        physical_status_details: data.physical_status_details || '',
        marital_status: data.marital_status || 'never_married',
        education: data.education || '',
        education_detail: data.education_detail || '',
        occupation: data.occupation || '',
        monthly_income: data.monthly_income || '',
        annual_income: data.annual_income || '',
        company_name: data.company_name || '',
        working_place: data.working_place || '',
        father_name: data.father_name || '',
        father_occupation: data.father_occupation || '',
        father_status: data.father_status || 'alive',
        mother_name: data.mother_name || '',
        mother_occupation: data.mother_occupation || '',
        mother_status: data.mother_status || 'alive',
        sisters_married: data.sisters_married || 0,
        sisters_count: data.sisters_count || 0,
        brothers_married: data.brothers_married || 0,
        brothers_count: data.brothers_count || 0,
        native_place: data.native_place || '',
        own_house: data.own_house || 'yes',
        time_of_birth: data.time_of_birth || '',
        rasi: data.rasi || '',
        nakshatra: data.nakshatra || '',
        lagnam: data.lagnam || '',
        kothram: data.kothram || '',
        matching_stars: data.matching_stars || '',
        expected_age_min: data.expected_age_min || '',
        expected_age_max: data.expected_age_max || '',
        expected_qualification: data.expected_qualification || '',
        address: data.address || '',
        city: data.city || '',
        pincode: data.pincode || '',
        state: data.state || '',
        country: data.country || 'India',
        about_me: data.about_me || '',
        looking_for: data.looking_for || '',
        hobbies: data.hobbies || '',
        created_by: data.created_by || 'self',
        profile_picture: data.profile_picture || ''
      });
    } catch (error) {
      showError('Failed to load user data');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : parseInt(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    showLoading('Saving user data...');

    try {
      await adminUserAPI.updateFullProfile(userId, userData);

      Swal.close();
      await showSuccess('User updated successfully!');
      navigate('/users');
    } catch (error) {
      Swal.close();
      showError(error.response?.data?.error || 'Failed to update user');
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

      const response = await adminUserAPI.uploadPhoto(userId, formData);

      setUserData(prev => ({
        ...prev,
        profile_picture: response.data.profile_picture
      }));

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
      text: 'Are you sure you want to remove this profile photo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it'
    });

    if (result.isConfirmed) {
      setUserData(prev => ({
        ...prev,
        profile_picture: ''
      }));
      showSuccess('Photo removed. Remember to save changes.');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Edit User Profile</h1>
            <p className="text-gray-600">
              {userData.first_name} {userData.last_name} ({userData.email})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <CollapsibleSection title="Profile Picture" icon={Camera}>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                  {userData.profile_picture ? (
                    <img
                      src={userData.profile_picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.first_name + ' ' + userData.last_name)}&size=200&background=00D26A&color=fff`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary/50" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-all"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  <Upload size={16} />
                  {userData.profile_picture ? 'Change' : 'Upload'}
                </button>
                {userData.profile_picture && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                  >
                    <Trash2 size={16} />
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
            </div>
          </CollapsibleSection>

          {/* Account Information */}
          <CollapsibleSection title="Account Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" name="email" value={userData.email} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" name="phone" value={userData.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Payment Status</label>
                <select name="payment_status" value={userData.payment_status} onChange={handleChange} className={inputClass}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" name="is_approved" checked={userData.is_approved} onChange={handleChange} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <label className="text-sm font-medium text-gray-700">Account Approved</label>
              </div>
            </div>
          </CollapsibleSection>

          {/* Primary Information */}
          <CollapsibleSection title="Primary Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <input type="text" name="first_name" value={userData.first_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input type="text" name="middle_name" value={userData.middle_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input type="text" name="last_name" value={userData.last_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Date of Birth (D.O.B)</label>
                <input type="date" name="date_of_birth" value={userData.date_of_birth} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Age (Years)</label>
                <input type="number" name="age" value={userData.age} onChange={handleChange} className={inputClass} min="18" max="100" />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={userData.gender} onChange={handleChange} className={inputClass}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Birth Place</label>
                <input type="text" name="birth_place" value={userData.birth_place} onChange={handleChange} className={inputClass} placeholder="e.g., Chennai" />
              </div>
              <div>
                <label className={labelClass}>Religion</label>
                <select name="religion" value={userData.religion} onChange={handleChange} className={inputClass}>
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
                <label className={labelClass}>Caste</label>
                <input type="text" name="caste" value={userData.caste} onChange={handleChange} className={inputClass} placeholder="e.g., Naidu, Mudaliar" />
              </div>
              <div>
                <label className={labelClass}>Sub Caste</label>
                <input type="text" name="sub_caste" value={userData.sub_caste} onChange={handleChange} className={inputClass} placeholder="e.g., Balija Naidu" />
              </div>
              <div>
                <label className={labelClass}>Complexion</label>
                <div className="flex flex-wrap gap-3 pt-2">
                  {[
                    { value: 'very_fair', label: 'Very Fair' },
                    { value: 'fair', label: 'Fair' },
                    { value: 'wheatish', label: 'Wheatish' },
                    { value: 'brown', label: 'Brown' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-1 cursor-pointer text-sm">
                      <input type="radio" name="complexion" value={option.value} checked={userData.complexion === option.value} onChange={handleChange} className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Mother Tongue</label>
                <select name="mother_tongue" value={userData.mother_tongue} onChange={handleChange} className={inputClass}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>UG (Under Graduate)</label>
                <input type="text" name="education" value={userData.education} onChange={handleChange} className={inputClass} placeholder="e.g., BCA, B.Com" />
              </div>
              <div>
                <label className={labelClass}>PG (Post Graduate)</label>
                <input type="text" name="education_detail" value={userData.education_detail} onChange={handleChange} className={inputClass} placeholder="e.g., MCA, MBA" />
              </div>
              <div>
                <label className={labelClass}>Diploma</label>
                <input type="text" name="diploma" value={userData.diploma || ''} onChange={handleChange} className={inputClass} placeholder="e.g., DCA" />
              </div>
              <div>
                <label className={labelClass}>Others</label>
                <input type="text" name="other_qualification" value={userData.other_qualification || ''} onChange={handleChange} className={inputClass} placeholder="Other qualifications" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Profession / Designation</label>
                <input type="text" name="occupation" value={userData.occupation} onChange={handleChange} className={inputClass} placeholder="e.g., Software Engineer, Doctor" />
              </div>
              <div>
                <label className={labelClass}>Monthly Income</label>
                <input type="text" name="monthly_income" value={userData.monthly_income} onChange={handleChange} className={inputClass} placeholder="e.g., 50,000" />
              </div>
              <div>
                <label className={labelClass}>Annual Income</label>
                <input type="text" name="annual_income" value={userData.annual_income} onChange={handleChange} className={inputClass} placeholder="e.g., 6,00,000" />
              </div>
            </div>
          </CollapsibleSection>

          {/* Working Details */}
          <CollapsibleSection title="Working Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company Name</label>
                <input type="text" name="company_name" value={userData.company_name} onChange={handleChange} className={inputClass} placeholder="e.g., TCS, Infosys" />
              </div>
              <div>
                <label className={labelClass}>Place</label>
                <input type="text" name="working_place" value={userData.working_place} onChange={handleChange} className={inputClass} placeholder="e.g., Chennai, Bangalore" />
              </div>
            </div>
          </CollapsibleSection>

          {/* Family Information */}
          <CollapsibleSection title="Family Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Father Name</label>
                <input type="text" name="father_name" value={userData.father_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Father Occupation</label>
                <input type="text" name="father_occupation" value={userData.father_occupation} onChange={handleChange} className={inputClass} placeholder="e.g., Business, Govt Employee" />
              </div>
              <div>
                <label className={labelClass}>Father Status</label>
                <select name="father_status" value={userData.father_status} onChange={handleChange} className={inputClass}>
                  <option value="alive">Alive</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Mother Name</label>
                <input type="text" name="mother_name" value={userData.mother_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mother Occupation</label>
                <input type="text" name="mother_occupation" value={userData.mother_occupation} onChange={handleChange} className={inputClass} placeholder="e.g., Homemaker, Teacher" />
              </div>
              <div>
                <label className={labelClass}>Mother Status</label>
                <select name="mother_status" value={userData.mother_status} onChange={handleChange} className={inputClass}>
                  <option value="alive">Alive</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>No. of Sisters</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Married</label>
                    <input type="number" name="sisters_married" value={userData.sisters_married} onChange={handleChange} className={inputClass} min="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Un Married</label>
                    <input type="number" name="sisters_count" value={userData.sisters_count} onChange={handleChange} className={inputClass} min="0" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>No. of Brothers</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Married</label>
                    <input type="number" name="brothers_married" value={userData.brothers_married} onChange={handleChange} className={inputClass} min="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Un Married</label>
                    <input type="number" name="brothers_count" value={userData.brothers_count} onChange={handleChange} className={inputClass} min="0" />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Native Place</label>
                <input type="text" name="native_place" value={userData.native_place} onChange={handleChange} className={inputClass} placeholder="e.g., Chennai" />
              </div>
              <div>
                <label className={labelClass}>Own House</label>
                <select name="own_house" value={userData.own_house} onChange={handleChange} className={inputClass}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
          </CollapsibleSection>

          {/* Horoscope */}
          <CollapsibleSection title="Horoscope" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Time of Birth</label>
                <input type="time" name="time_of_birth" value={userData.time_of_birth} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Rasi</label>
                <select name="rasi" value={userData.rasi} onChange={handleChange} className={inputClass}>
                  <option value="">Select Rasi</option>
                  {rasiOptions.map(rasi => (
                    <option key={rasi} value={rasi}>{rasi}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Star (Nakshatra)</label>
                <select name="nakshatra" value={userData.nakshatra} onChange={handleChange} className={inputClass}>
                  <option value="">Select Star</option>
                  {nakshatraOptions.map(star => (
                    <option key={star} value={star}>{star}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Lagnam</label>
                <select name="lagnam" value={userData.lagnam} onChange={handleChange} className={inputClass}>
                  <option value="">Select Lagnam</option>
                  {rasiOptions.map(lagnam => (
                    <option key={lagnam} value={lagnam}>{lagnam}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Kothram (Gothram)</label>
                <input type="text" name="kothram" value={userData.kothram} onChange={handleChange} className={inputClass} placeholder="e.g., Bharadwaja" />
              </div>
              <div>
                <label className={labelClass}>Height (in feet)</label>
                <input type="text" name="height" value={userData.height} onChange={handleChange} className={inputClass} placeholder="e.g., 5.6" />
              </div>
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input type="number" name="weight" value={userData.weight} onChange={handleChange} className={inputClass} placeholder="e.g., 50" min="30" max="200" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelClass}>Matching Stars</label>
                <textarea name="matching_stars" value={userData.matching_stars} onChange={handleChange} className={inputClass} rows="2" placeholder="e.g., Ashwini, Bharani, Krittika, Rohini, Mrigashira, Punarvasu..."></textarea>
              </div>
            </div>
          </CollapsibleSection>

          {/* Marital Status */}
          <CollapsibleSection title="Marital Status">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Status</label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {[
                    { value: 'never_married', label: 'Unmarried' },
                    { value: 'second_marriage', label: 'Married (Second Marriage)' },
                    { value: 'widowed', label: 'Widow / Widower' },
                    { value: 'divorced', label: 'Divorcee / Divorcer' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="marital_status" value={option.value} checked={userData.marital_status === option.value} onChange={handleChange} className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Physical Status</label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {[
                    { value: 'normal', label: 'Normal' },
                    { value: 'physically_challenged', label: 'Physically Challenged' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="physical_status" value={option.value} checked={userData.physical_status === option.value} onChange={handleChange} className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              {userData.physical_status === 'physically_challenged' && (
                <div>
                  <label className={labelClass}>If Applicable, Please give details</label>
                  <textarea name="physical_status_details" value={userData.physical_status_details} onChange={handleChange} className={inputClass} rows="2" placeholder="Please provide details..."></textarea>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Alliance Expectation Details */}
          <CollapsibleSection title="Alliance Expectation Details" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Expected Age (Min)</label>
                <input type="number" name="expected_age_min" value={userData.expected_age_min} onChange={handleChange} className={inputClass} placeholder="e.g., 25" min="18" />
              </div>
              <div>
                <label className={labelClass}>Expected Age (Max)</label>
                <input type="number" name="expected_age_max" value={userData.expected_age_max} onChange={handleChange} className={inputClass} placeholder="e.g., 35" min="18" />
              </div>
              <div>
                <label className={labelClass}>Expected Qualification</label>
                <input type="text" name="expected_qualification" value={userData.expected_qualification} onChange={handleChange} className={inputClass} placeholder="e.g., Degree, Any Graduate" />
              </div>
            </div>
          </CollapsibleSection>

          {/* Residential Address with Contact No */}
          <CollapsibleSection title="Residential Address with Contact No">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Full Address</label>
                <textarea name="address" value={userData.address} onChange={handleChange} className={inputClass} rows="3" placeholder="House No, Street Name, Area, City - Pincode"></textarea>
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" name="city" value={userData.city} onChange={handleChange} className={inputClass} placeholder="e.g., Chennai" />
              </div>
              <div>
                <label className={labelClass}>Pincode</label>
                <input type="text" name="pincode" value={userData.pincode} onChange={handleChange} className={inputClass} placeholder="e.g., 600001" />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input type="text" name="state" value={userData.state} onChange={handleChange} className={inputClass} placeholder="e.g., Tamil Nadu" />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input type="text" name="country" value={userData.country} onChange={handleChange} className={inputClass} placeholder="India" />
              </div>
            </div>
          </CollapsibleSection>

          {/* About (Optional) */}
          <CollapsibleSection title="About (Optional)" defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>About Me</label>
                <textarea name="about_me" value={userData.about_me} onChange={handleChange} rows="3" className={inputClass} placeholder="Tell us about this person..."></textarea>
              </div>
              <div>
                <label className={labelClass}>Looking For</label>
                <textarea name="looking_for" value={userData.looking_for} onChange={handleChange} rows="3" className={inputClass} placeholder="Describe ideal partner..."></textarea>
              </div>
              <div>
                <label className={labelClass}>Hobbies & Interests</label>
                <input type="text" name="hobbies" value={userData.hobbies} onChange={handleChange} className={inputClass} placeholder="e.g., Reading, Traveling, Music" />
              </div>
              <div>
                <label className={labelClass}>Profile Created By</label>
                <select name="created_by" value={userData.created_by} onChange={handleChange} className={inputClass}>
                  <option value="self">Self</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="relative">Relative</option>
                </select>
              </div>
            </div>
          </CollapsibleSection>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
    </AdminLayout>
  );
};

export default AdminEditUser;
