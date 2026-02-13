import { useState, useEffect } from 'react';
import { adminUserAPI, adminMatchAPI } from '../utils/adminApi';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError, showConfirm } from '../utils/sweetalert';
import {
  UserCog, Users, Heart, Search, ArrowRight, ArrowLeft,
  CheckCircle, User, Sparkles, TrendingUp, Filter, X
} from 'lucide-react';

const AdminAssignMatchNew = () => {
  const [step, setStep] = useState(1); // 1: Select User 1, 2: Filter & Select User 2, 3: Compare & Confirm
  const [users, setUsers] = useState([]);
  const [selectedUser1, setSelectedUser1] = useState(null);
  const [selectedUser2, setSelectedUser2] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchScore, setMatchScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    ageRange: [21, 45],
    heightRange: [150, 190],
    maritalStatus: [],
    religion: [],
    caste: [],
    education: [],
    occupation: [],
    city: []
  });

  const [availableFilters, setAvailableFilters] = useState({
    maritalStatuses: ['never_married', 'divorced', 'widowed'],
    religions: [],
    castes: [],
    educations: [],
    occupations: [],
    cities: []
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser1) {
      filterCompatibleUsers();
    }
  }, [selectedUser1, users, searchTerm, filters]);

  useEffect(() => {
    if (selectedUser1 && selectedUser2) {
      calculateMatchScore();
    }
  }, [selectedUser1, selectedUser2]);

  const fetchUsers = async () => {
    try {
      const usersResponse = await adminUserAPI.getApprovedUsers();

      // Merge user data with profiles
      const usersWithProfiles = usersResponse.data.users;

      setUsers(usersWithProfiles);

      // Extract unique filter values
      extractFilterOptions(usersWithProfiles);

      setLoading(false);
    } catch (error) {
      showError('Failed to fetch users');
      setLoading(false);
    }
  };

  const extractFilterOptions = (usersList) => {
    const religions = [...new Set(usersList.map(u => u.religion).filter(Boolean))];
    const castes = [...new Set(usersList.map(u => u.caste).filter(Boolean))];
    const educations = [...new Set(usersList.map(u => u.education).filter(Boolean))];
    const occupations = [...new Set(usersList.map(u => u.occupation).filter(Boolean))];
    const cities = [...new Set(usersList.map(u => u.city).filter(Boolean))];

    setAvailableFilters({
      maritalStatuses: ['never_married', 'divorced', 'widowed'],
      religions,
      castes,
      educations,
      occupations,
      cities
    });
  };

  const filterCompatibleUsers = () => {
    if (!selectedUser1) {
      setFilteredUsers(users);
      return;
    }

    let compatible = users.filter(user => {
      // Opposite gender only
      if (selectedUser1.gender === 'male') {
        if (user.gender !== 'female') return false;
      } else if (selectedUser1.gender === 'female') {
        if (user.gender !== 'male') return false;
      }

      // Not the same user
      if (user.id === selectedUser1.id) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          user.first_name?.toLowerCase().includes(searchLower) ||
          user.last_name?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Age range filter
      if (user.age < filters.ageRange[0] || user.age > filters.ageRange[1]) return false;

      // Height range filter (if height data available)
      if (user.height && (user.height < filters.heightRange[0] || user.height > filters.heightRange[1])) return false;

      // Marital status filter
      if (filters.maritalStatus.length > 0 && !filters.maritalStatus.includes(user.marital_status)) return false;

      // Religion filter
      if (filters.religion.length > 0 && !filters.religion.includes(user.religion)) return false;

      // Caste filter
      if (filters.caste.length > 0 && !filters.caste.includes(user.caste)) return false;

      // Education filter
      if (filters.education.length > 0 && !filters.education.includes(user.education)) return false;

      // Occupation filter
      if (filters.occupation.length > 0 && !filters.occupation.includes(user.occupation)) return false;

      // City filter
      if (filters.city.length > 0 && !filters.city.includes(user.city)) return false;

      return true;
    });

    setFilteredUsers(compatible);
  };

  const calculateMatchScore = () => {
    if (!selectedUser1 || !selectedUser2) return;

    let score = 0;
    let totalCriteria = 0;

    // Age compatibility (15 points)
    totalCriteria += 15;
    const ageDiff = Math.abs(selectedUser1.age - selectedUser2.age);
    if (ageDiff <= 2) score += 15;
    else if (ageDiff <= 5) score += 10;
    else if (ageDiff <= 8) score += 5;

    // Religion match (20 points)
    totalCriteria += 20;
    if (selectedUser1.religion === selectedUser2.religion) score += 20;

    // Caste match (10 points)
    totalCriteria += 10;
    if (selectedUser1.caste === selectedUser2.caste) score += 10;

    // Education level (15 points)
    totalCriteria += 15;
    if (selectedUser1.education === selectedUser2.education) score += 15;
    else if (selectedUser1.education && selectedUser2.education) score += 7;

    // Occupation compatibility (10 points)
    totalCriteria += 10;
    if (selectedUser1.occupation === selectedUser2.occupation) score += 5;
    if (selectedUser1.occupation && selectedUser2.occupation) score += 5;

    // Location proximity (15 points)
    totalCriteria += 15;
    if (selectedUser1.city === selectedUser2.city) score += 15;
    else if (selectedUser1.state === selectedUser2.state) score += 10;

    // Marital status compatibility (10 points)
    totalCriteria += 10;
    if (selectedUser1.marital_status === selectedUser2.marital_status) score += 10;
    else if (selectedUser1.marital_status === 'never_married' || selectedUser2.marital_status === 'never_married') score += 5;

    // Mother tongue (5 points)
    totalCriteria += 5;
    if (selectedUser1.mother_tongue === selectedUser2.mother_tongue) score += 5;

    const finalScore = Math.round((score / totalCriteria) * 100);
    setMatchScore(finalScore);
  };

  const handleSelectUser1 = (user) => {
    setSelectedUser1(user);
    setStep(2);
  };

  const handleSelectUser2 = (user) => {
    setSelectedUser2(user);
    setStep(3);
  };

  const handleCreateMatch = async () => {
    try {
      await adminMatchAPI.createMatch({
        user1_id: selectedUser1.id,
        user2_id: selectedUser2.id,
        match_score: matchScore
      });

      showSuccess('Match created successfully!');
      resetFlow();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to create match');
    }
  };

  const resetFlow = () => {
    setSelectedUser1(null);
    setSelectedUser2(null);
    setStep(1);
    setMatchScore(0);
    setSearchTerm('');
    setFilters({
      ageRange: [21, 45],
      heightRange: [150, 190],
      maritalStatus: [],
      religion: [],
      caste: [],
      education: [],
      occupation: [],
      city: []
    });
  };

  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  const UserProfileCard = ({ user, compact = false }) => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-4">
        {user.profile_picture ? (
          <img
            src={user.profile_picture}
            alt={`${user.first_name} ${user.last_name}`}
            className="h-16 w-16 flex-shrink-0 rounded-full object-cover border-2 border-primary/20"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=80&background=00D26A&color=fff`;
            }}
          />
        ) : (
          <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold text-2xl">
            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {user.first_name} {user.middle_name || ''} {user.last_name}
          </h3>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Age:</span>
            <span className="ml-2 font-medium">{user.age} years</span>
          </div>
          <div>
            <span className="text-gray-500">Gender:</span>
            <span className="ml-2 font-medium capitalize">{user.gender}</span>
          </div>
          <div>
            <span className="text-gray-500">Phone:</span>
            <span className="ml-2 font-medium">{user.phone}</span>
          </div>
          <div>
            <span className="text-gray-500">Height:</span>
            <span className="ml-2 font-medium">{user.height || 'N/A'} cm</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Religion:</span>
            <span className="ml-2 font-medium">{user.religion || 'N/A'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Caste:</span>
            <span className="ml-2 font-medium">{user.caste || 'N/A'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Education:</span>
            <span className="ml-2 font-medium">{user.education || 'N/A'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Occupation:</span>
            <span className="ml-2 font-medium">{user.occupation || 'N/A'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Location:</span>
            <span className="ml-2 font-medium">{user.city}, {user.state}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Marital Status:</span>
            <span className="ml-2 font-medium capitalize">{user.marital_status?.replace('_', ' ') || 'N/A'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Mother Tongue:</span>
            <span className="ml-2 font-medium">{user.mother_tongue || 'N/A'}</span>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading users...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <UserCog className="text-primary" size={32} />
              Smart Match Assignment
            </h1>
            <p className="text-gray-600 mt-1">AI-powered profile matching with compatibility scoring</p>
          </div>
          {step > 1 && (
            <button
              onClick={resetFlow}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <X size={18} />
              Start Over
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-medium">Select First User</span>
            </div>

            <ArrowRight className={step >= 2 ? 'text-primary' : 'text-gray-300'} size={24} />

            <div className={`flex items-center gap-3 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-medium">Filter & Select Match</span>
            </div>

            <ArrowRight className={step >= 3 ? 'text-primary' : 'text-gray-300'} size={24} />

            <div className={`flex items-center gap-3 ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="font-medium">Compare & Confirm</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select User 1 */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Select First User</h2>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
              {users.filter(u => {
                if (!searchTerm) return true;
                const search = searchTerm.toLowerCase();
                return u.first_name?.toLowerCase().includes(search) ||
                       u.last_name?.toLowerCase().includes(search) ||
                       u.phone?.toLowerCase().includes(search)
              }).map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser1(user)}
                  className="cursor-pointer transition-all p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="h-12 w-12 flex-shrink-0 rounded-full object-cover border-2 border-primary/20"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=60&background=00D26A&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 flex-shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {user.age} yrs
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                          {user.gender}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Filter & Select User 2 */}
        {step === 2 && selectedUser1 && (
          <>
            {/* Selected User 1 Display */}
            <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-xl p-6 border border-primary/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Selected User</h3>
              <UserProfileCard user={selectedUser1} compact />
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Step 2: Filter Compatible {selectedUser1.gender === 'male' ? 'Females' : 'Males'}
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Filter size={18} />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg mb-6">
                  {/* Age Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="18"
                        max="60"
                        value={filters.ageRange[0]}
                        onChange={(e) => setFilters({...filters, ageRange: [parseInt(e.target.value), filters.ageRange[1]]})}
                        className="w-20 px-2 py-1 border rounded"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        min="18"
                        max="60"
                        value={filters.ageRange[1]}
                        onChange={(e) => setFilters({...filters, ageRange: [filters.ageRange[0], parseInt(e.target.value)]})}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </div>
                  </div>

                  {/* Height Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height Range: {filters.heightRange[0]} - {filters.heightRange[1]} cm
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="140"
                        max="210"
                        value={filters.heightRange[0]}
                        onChange={(e) => setFilters({...filters, heightRange: [parseInt(e.target.value), filters.heightRange[1]]})}
                        className="w-20 px-2 py-1 border rounded"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        min="140"
                        max="210"
                        value={filters.heightRange[1]}
                        onChange={(e) => setFilters({...filters, heightRange: [filters.heightRange[0], parseInt(e.target.value)]})}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </div>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <div className="space-y-2">
                      {availableFilters.maritalStatuses.map(status => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.maritalStatus.includes(status)}
                            onChange={() => toggleFilter('maritalStatus', status)}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Religion */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableFilters.religions.map(religion => (
                        <label key={religion} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.religion.includes(religion)}
                            onChange={() => toggleFilter('religion', religion)}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{religion}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Caste */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Caste</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableFilters.castes.map(caste => (
                        <label key={caste} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.caste.includes(caste)}
                            onChange={() => toggleFilter('caste', caste)}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{caste}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableFilters.cities.map(city => (
                        <label key={city} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.city.includes(city)}
                            onChange={() => toggleFilter('city', city)}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{city}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search compatible profiles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* User List */}
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Found {filteredUsers.length} compatible {selectedUser1.gender === 'male' ? 'female' : 'male'} profiles
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser2(user)}
                      className="cursor-pointer transition-all p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="h-12 w-12 flex-shrink-0 rounded-full object-cover border-2 border-pink-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&size=60&background=EC4899&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-pink-500 text-white flex items-center justify-center font-semibold">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Age:</span>
                          <span className="ml-1 font-medium">{user.age}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Height:</span>
                          <span className="ml-1 font-medium">{user.height || 'N/A'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-1 font-medium">{user.city}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Religion:</span>
                          <span className="ml-1 font-medium">{user.religion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Compare & Confirm */}
        {step === 3 && selectedUser1 && selectedUser2 && (
          <>
            {/* Match Score Display */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles size={32} />
                <h2 className="text-3xl font-bold">Match Score</h2>
              </div>
              <div className="text-7xl font-bold mb-2">{matchScore}%</div>
              <p className="text-xl">{getScoreLabel(matchScore)}</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <TrendingUp size={20} />
                <span>AI-Powered Compatibility Analysis</span>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Profile Comparison</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <User size={20} />
                    User 1
                  </h3>
                  <UserProfileCard user={selectedUser1} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-pink-600 mb-4 flex items-center gap-2">
                    <User size={20} />
                    User 2
                  </h3>
                  <UserProfileCard user={selectedUser2} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Choose Different Match
                </button>
                <button
                  onClick={handleCreateMatch}
                  className="px-8 py-3 btn-primary flex items-center gap-2"
                >
                  <Heart size={18} />
                  Create This Match
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAssignMatchNew;
