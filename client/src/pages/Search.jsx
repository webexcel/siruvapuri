import { useState, useEffect } from 'react';
import { matchAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/sweetalert';
import ProfileCard from '../components/ProfileCard';
import CardSkeleton from '../components/CardSkeleton';
import { Search as SearchIcon, Filter, X } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useState({
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
      const response = await matchAPI.searchProfiles({});
      setResults(response.data.profiles || []);
    } catch (error) {
      console.error('Load profiles error:', error);
      showError('Failed to load profiles');
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

      const response = await matchAPI.searchProfiles(params);
      setResults(response.data.profiles || []);
    } catch (error) {
      console.error('Search error:', error);
      showError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestSent = async (profileId) => {
    try {
      await matchAPI.sendInterest({ receiver_id: profileId });
      showSuccess('Interest sent successfully!');
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to send interest');
      throw error; // Re-throw to let ProfileCard know it failed
    }
  };

  const handleReset = () => {
    setSearchParams({
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
              <SearchIcon className="w-4 h-4" />
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
              <SearchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Search Profiles
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
            Find profiles matching your specific criteria
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profiles Grid - Left/Main */}
          <div className="flex-1 order-2 lg:order-1">
            {loading ? (
              <CardSkeleton count={8} />
            ) : searched ? (
              results.length > 0 ? (
                <>
                  <div className="mb-4 text-xs sm:text-sm text-gray-600">
                    Found {results.length} profiles
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {results.map((profile) => (
                      <ProfileCard
                        key={profile.id}
                        profile={profile}
                        onInterestSent={handleInterestSent}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="card text-center py-8 sm:py-12 px-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Results Found</h3>
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
                <p className="text-sm sm:text-base text-gray-600">
                  Use the filters to find profiles matching your preferences
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

export default Search;
