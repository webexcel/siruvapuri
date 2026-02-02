import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Search, Lock, Eye, UserPlus, Phone, Mail, MapPin, Filter, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Blurred Profile Card Component
const BlurredProfileCard = ({ profile }) => {
  const { theme } = useTheme();
  const avatarBgColor = theme?.primary?.replace('#', '') || '8B1538';

  return (
    <div className="card p-3 sm:p-4 relative overflow-hidden group">
      {/* Profile Image */}
      <div className="relative mb-3">
        <img
          src={profile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=200&background=${avatarBgColor}&color=fff`}
          alt={profile.full_name}
          className="w-full aspect-square object-cover rounded-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=200&background=${avatarBgColor}&color=fff`;
          }}
        />
      </div>

      {/* Basic Info - Visible */}
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
          {profile.full_name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          {profile.age} yrs • {profile.gender === 'male' ? 'Male' : 'Female'}
        </p>
        {profile.city && (
          <p className="text-xs text-gray-500 truncate">
            {profile.city}{profile.state ? `, ${profile.state}` : ''}
          </p>
        )}
        {profile.education && (
          <p className="text-xs text-gray-500 truncate">{profile.education}</p>
        )}
        {profile.occupation && (
          <p className="text-xs text-gray-500 truncate">{profile.occupation}</p>
        )}
      </div>

      {/* Blurred Contact Info Section */}
      <div className="mt-3 pt-3 border-t border-gray-100 relative">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/60 rounded-lg flex flex-col items-center justify-center z-10">
          <Lock className="w-5 h-5 text-primary mb-1" />
          <span className="text-xs text-gray-600 font-medium">Contact Hidden</span>
        </div>

        {/* Placeholder contact info (blurred) */}
        <div className="space-y-2 opacity-50">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Phone className="w-3 h-3" />
            <span className="blur-sm select-none">9876543210</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Mail className="w-3 h-3" />
            <span className="blur-sm select-none">email@hidden.com</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />
            <span className="blur-sm select-none">Full Address Hidden</span>
          </div>
        </div>
      </div>

      {/* Register CTA on Hover */}
      <div className="mt-3">
        <Link
          to="/register"
          className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1"
        >
          <UserPlus className="w-3 h-3" />
          Register to Connect
        </Link>
      </div>
    </div>
  );
};

// Skeleton Loader
const CardSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="card p-3 sm:p-4 animate-pulse">
        <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    ))}
  </div>
);

const FreeSearch = () => {
  const [searchParams, setSearchParams] = useState({
    gender: '',
    age_min: '',
    age_max: '',
    religion: '',
    caste: '',
    city: '',
    marital_status: '',
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load profiles on initial page load
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/match/public-search`);
      setResults(response.data.profiles || []);
    } catch (error) {
      console.error('Load profiles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setShowMobileFilters(false);

    try {
      // Remove empty parameters
      const params = Object.entries(searchParams).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await axios.get(`${API_BASE_URL}/match/public-search`, { params });
      setResults(response.data.profiles || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      gender: '',
      age_min: '',
      age_max: '',
      religion: '',
      caste: '',
      city: '',
      marital_status: '',
    });
    loadProfiles();
  };

  // Filter sidebar component
  const FilterSidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? '' : 'sticky top-24'}`}>
      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-800">Filter Profiles</h3>
          </div>
          {isMobile && (
            <button onClick={() => setShowMobileFilters(false)} className="p-1">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Looking For
            </label>
            <select
              name="gender"
              value={searchParams.gender}
              onChange={handleChange}
              className="input-field text-sm py-2.5"
            >
              <option value="">Any</option>
              <option value="male">Groom (Male)</option>
              <option value="female">Bride (Female)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Min Age
              </label>
              <input
                type="number"
                name="age_min"
                value={searchParams.age_min}
                onChange={handleChange}
                className="input-field text-sm py-2.5"
                placeholder="21"
                min="18"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Max Age
              </label>
              <input
                type="number"
                name="age_max"
                value={searchParams.age_max}
                onChange={handleChange}
                className="input-field text-sm py-2.5"
                placeholder="35"
                min="18"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Religion
            </label>
            <select
              name="religion"
              value={searchParams.religion}
              onChange={handleChange}
              className="input-field text-sm py-2.5"
            >
              <option value="">Any</option>
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
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Caste
            </label>
            <input
              type="text"
              name="caste"
              value={searchParams.caste}
              onChange={handleChange}
              className="input-field text-sm py-2.5"
              placeholder="e.g., Naidu, Mudaliar"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              City
            </label>
            <input
              type="text"
              name="city"
              value={searchParams.city}
              onChange={handleChange}
              className="input-field text-sm py-2.5"
              placeholder="e.g., Chennai"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              Marital Status
            </label>
            <select
              name="marital_status"
              value={searchParams.marital_status}
              onChange={handleChange}
              className="input-field text-sm py-2.5"
            >
              <option value="">Any</option>
              <option value="never_married">Never Married</option>
              <option value="second_marriage">Second Marriage</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="separated">Separated</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary text-sm py-2.5"
            >
              Reset Filters
            </button>
          </div>
        </form>

        {/* Register CTA in sidebar */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-2">
              Register to view contact details
            </p>
            <Link
              to="/register"
              className="btn-primary text-xs py-2 w-full flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              Register Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Free Profile Search
              </h1>
            </div>
            {/* Mobile filter button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 btn-secondary text-sm py-2 px-3"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Browse profiles for free. Register to view contact details and connect with matches.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Preview Profiles for Free</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Contact information (phone, email, address) is hidden for non-members.
              <Link to="/register" className="text-primary font-medium ml-1 hover:underline">
                Register now
              </Link> to unlock full access!
            </p>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profiles Grid - Left/Main */}
          <div className="flex-1 order-2 lg:order-1">
            {loading ? (
              <CardSkeleton count={6} />
            ) : searched ? (
              results.length > 0 ? (
                <>
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Found {results.length} profiles
                    </span>
                    <Link
                      to="/register"
                      className="text-xs sm:text-sm text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Register to view contact details
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {results.map((profile) => (
                      <BlurredProfileCard key={profile.id} profile={profile} />
                    ))}
                  </div>

                  {/* Bottom CTA */}
                  <div className="mt-8 text-center">
                    <div className="card p-6 sm:p-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                        Ready to Find Your Life Partner?
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        Register now to view contact details, send interests, and connect with your matches.
                      </p>
                      <Link
                        to="/register"
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Register Free
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card text-center py-8 sm:py-12 px-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Profiles Found</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Try adjusting your search criteria to find more matches
                  </p>
                </div>
              )
            ) : (
              <div className="card text-center py-8 sm:py-12 px-4">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Start Your Search</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Use the filters to find profiles matching your preferences
                </p>
                <p className="text-xs text-gray-500">
                  No registration required to browse profiles
                </p>
              </div>
            )}
          </div>

          {/* Filter Sidebar - Right (Desktop) */}
          <div className="hidden lg:block w-72 xl:w-80 order-1 lg:order-2">
            <FilterSidebar />
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <FilterSidebar isMobile={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeSearch;
