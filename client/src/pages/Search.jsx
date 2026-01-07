import { useState } from 'react';
import { matchAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/sweetalert';
import ProfileCard from '../components/ProfileCard';
import CardSkeleton from '../components/CardSkeleton';

const Search = () => {
  const [searchParams, setSearchParams] = useState({
    age_min: '',
    age_max: '',
    height_min: '',
    height_max: '',
    religion: '',
    education: '',
    city: '',
    marital_status: '',
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
      height_min: '',
      height_max: '',
      religion: '',
      education: '',
      city: '',
      marital_status: '',
    });
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Advanced Search
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Find profiles matching your specific criteria
          </p>
        </div>

        {/* Search Form */}
        <div className="card p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Min Age
                </label>
                <input
                  type="number"
                  name="age_min"
                  value={searchParams.age_min}
                  onChange={handleChange}
                  className="input-field text-sm sm:text-base py-2 sm:py-2.5"
                  placeholder="21"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Max Age
                </label>
                <input
                  type="number"
                  name="age_max"
                  value={searchParams.age_max}
                  onChange={handleChange}
                  className="input-field text-sm sm:text-base py-2 sm:py-2.5"
                  placeholder="35"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Min Height (cm)
                </label>
                <input
                  type="number"
                  name="height_min"
                  value={searchParams.height_min}
                  onChange={handleChange}
                  className="input-field text-sm sm:text-base py-2 sm:py-2.5"
                  placeholder="150"
                  min="100"
                  max="250"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Max Height (cm)
                </label>
                <input
                  type="number"
                  name="height_max"
                  value={searchParams.height_max}
                  onChange={handleChange}
                  className="input-field text-sm sm:text-base py-2 sm:py-2.5"
                  placeholder="180"
                  min="100"
                  max="250"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Religion
                </label>
                <select
                  name="religion"
                  value={searchParams.religion}
                  onChange={handleChange}
                  className="input-field text-sm sm:text-base py-2 sm:py-2.5"
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
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Marital Status
                </label>
                <select
                  name="marital_status"
                  value={searchParams.marital_status}
                  onChange={handleChange}
                  className="input-field text-sm sm:text-base py-2 sm:py-2.5"
                >
                  <option value="">Any</option>
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  value={searchParams.education}
                  onChange={handleChange}
                  className="input-field text-sm sm:text-base py-2 sm:py-2.5"
                  placeholder="e.g., B.Tech, MBA"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={searchParams.city}
                  onChange={handleChange}
                  className="input-field text-sm sm:text-base py-2 sm:py-2.5"
                  placeholder="e.g., Mumbai"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-sm sm:text-base py-2 sm:py-2.5 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Profiles'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary text-sm sm:text-base py-2 sm:py-2.5"
              >
                Reset Filters
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {loading ? (
          <CardSkeleton count={8} />
        ) : searched ? (
          results.length > 0 ? (
            <>
              <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">
                Found {results.length} profiles
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
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
              Use the filters above to find profiles matching your preferences
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
