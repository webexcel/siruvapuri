import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import SkeletonLoader from '../components/SkeletonLoader';
import { showSuccess, showError } from '../utils/sweetalert';
import { UserCog, Users, Heart, Search, Filter } from 'lucide-react';

const AdminAssignMatch = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser1, setSelectedUser1] = useState(null);
  const [selectedUser2, setSelectedUser2] = useState(null);
  const [matchScore, setMatchScore] = useState(75);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [existingMatches, setExistingMatches] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, genderFilter, selectedUser1, existingMatches]);

  const fetchData = async () => {
    try {
      const [usersRes, matchesRes] = await Promise.all([
        axios.get('/api/admin/users/approved', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/matches', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUsers(usersRes.data.users);
      setExistingMatches(matchesRes.data.matches || []);
      setLoading(false);
    } catch (error) {
      showError('Failed to fetch data');
      setLoading(false);
    }
  };

  // Check if two users already have a match
  const hasExistingMatch = (userId1, userId2) => {
    return existingMatches.some(match =>
      (match.user_id === userId1 && match.matched_user_id === userId2) ||
      (match.user_id === userId2 && match.matched_user_id === userId1)
    );
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter((user) => user.gender === genderFilter);
    }

    // If User 1 is selected, filter out users who already have a match with User 1
    if (selectedUser1) {
      filtered = filtered.filter(user => {
        // Don't show the selected user again
        if (user.id === selectedUser1.id) return false;

        // Don't show users who already have a match with selectedUser1
        return !hasExistingMatch(selectedUser1.id, user.id);
      });
    }

    setFilteredUsers(filtered);
  };

  const handleCreateMatch = async () => {
    if (!selectedUser1 || !selectedUser2) {
      showError('Please select both users');
      return;
    }

    if (selectedUser1.id === selectedUser2.id) {
      showError('Cannot match a user with themselves');
      return;
    }

    try {
      await axios.post(
        '/api/admin/matches/create',
        {
          user1_id: selectedUser1.id,
          user2_id: selectedUser2.id,
          match_score: matchScore
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showSuccess('Match created successfully!');
      setSelectedUser1(null);
      setSelectedUser2(null);
      setMatchScore(75);
      // Refresh data to update the list of existing matches
      fetchData();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to create match');
    }
  };

  const handleSelectUser = (user, position) => {
    if (position === 1) {
      setSelectedUser1(user);
    } else {
      setSelectedUser2(user);
    }
  };

  const UserCard = ({ user, position, isSelected, onSelect }) => (
    <div
      onClick={() => onSelect(user, position)}
      className={`cursor-pointer transition-all p-4 rounded-lg border-2 ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 hover:border-primary/50 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {user.first_name} {user.middle_name || ''} {user.last_name}
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
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-56 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-72"></div>
          </div>

          {/* Selected Users Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="h-32 bg-gray-100 rounded"></div>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="h-32 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Users Grid Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border-2 border-gray-200 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <UserCog className="text-primary" size={32} />
            Assign Match
          </h1>
          <p className="text-gray-600 mt-1">Manually create matches between users</p>
        </div>

        {/* Selected Users Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Selected Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User 1 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">User 1</h3>
              {selectedUser1 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 flex-shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                      {selectedUser1.first_name?.charAt(0)}{selectedUser1.last_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {selectedUser1.first_name} {selectedUser1.middle_name || ''} {selectedUser1.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{selectedUser1.phone}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {selectedUser1.age} years
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                      {selectedUser1.gender}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Users size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Select a user from the list below</p>
                </div>
              )}
            </div>

            {/* User 2 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">User 2</h3>
              {selectedUser2 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 flex-shrink-0 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xl">
                      {selectedUser2.first_name?.charAt(0)}{selectedUser2.last_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {selectedUser2.first_name} {selectedUser2.middle_name || ''} {selectedUser2.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{selectedUser2.phone}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {selectedUser2.age} years
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-pink-100 text-pink-700 capitalize">
                      {selectedUser2.gender}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Users size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Select a user from the list below</p>
                </div>
              )}
            </div>
          </div>

          {/* Match Score Slider */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match Score: {matchScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={matchScore}
              onChange={(e) => setMatchScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Create Match Button */}
          <button
            onClick={handleCreateMatch}
            disabled={!selectedUser1 || !selectedUser2}
            className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Heart size={18} />
            Create Match
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Gender Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Selection Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Available Users ({filteredUsers.length})
            </h2>
            <div className="text-sm text-gray-600">
              Click to select User 1, then User 2
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No approved users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  position={!selectedUser1 ? 1 : 2}
                  isSelected={selectedUser1?.id === user.id || selectedUser2?.id === user.id}
                  onSelect={handleSelectUser}
                />
              ))
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">How to Assign Matches:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Select the first user from the list below</li>
            <li>Select the second user from the list</li>
            <li>Adjust the match score using the slider (higher score = better match)</li>
            <li>Click "Create Match" to assign the match</li>
            <li>Both users will be able to see each other's profiles</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAssignMatch;
