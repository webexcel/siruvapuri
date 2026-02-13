import { useState, useEffect } from 'react';
import { adminMatchAPI } from '../utils/adminApi';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError, showConfirm } from '../utils/sweetalert';
import { Heart, Search, Filter, Trash2, Eye, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminMatches = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [matchesPerPage] = useState(10);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, searchTerm, filterStatus]);

  const fetchMatches = async () => {
    try {
      const response = await adminMatchAPI.getAllMatches();
      setMatches(response.data.matches);
      setLoading(false);
    } catch (error) {
      showError('Failed to fetch matches');
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = [...matches];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (match) =>
          match.user1_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.user2_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((match) => match.status === filterStatus);
    }

    setFilteredMatches(filtered);
  };

  const handleDeleteMatch = async (matchId, user1Name, user2Name) => {
    const result = await showConfirm(
      `Are you sure you want to delete the match between ${user1Name} and ${user2Name}?`,
      'Delete Match'
    );

    if (result.isConfirmed) {
      try {
        await adminMatchAPI.deleteMatch(matchId);
        showSuccess('Match deleted successfully');
        fetchMatches();
      } catch (error) {
        showError('Failed to delete match');
      }
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Pagination calculations
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstMatch, indexOfLastMatch);
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading matches...</div>
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
              <Heart className="text-primary" size={32} />
              Matches
            </h1>
            <p className="text-gray-600 mt-1">View and manage all user matches</p>
          </div>
          <div className="text-lg font-semibold text-gray-700">
            Total: {filteredMatches.length} matches
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{matches.length}</p>
              </div>
              <Heart className="text-pink-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {matches.filter((m) => m.status === 'accepted').length}
                </p>
              </div>
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {matches.filter((m) => m.status === 'pending').length}
                </p>
              </div>
              <Eye className="text-yellow-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Score (80+)</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {matches.filter((m) => m.match_score >= 80).length}
                </p>
              </div>
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
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

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matches Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User 1
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User 2
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMatches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No matches found
                    </td>
                  </tr>
                ) : (
                  currentMatches.map((match) => (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          {match.user1_picture ? (
                            <img
                              src={match.user1_picture}
                              alt={match.user1_name}
                              className="h-16 w-14 flex-shrink-0 rounded-lg object-cover border-2 border-primary shadow-md"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.user1_name || 'User')}&size=64&background=00D26A&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="h-16 w-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary to-green-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                              {match.user1_name?.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{match.user1_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          {match.user2_picture ? (
                            <img
                              src={match.user2_picture}
                              alt={match.user2_name}
                              className="h-16 w-14 flex-shrink-0 rounded-lg object-cover border-2 border-pink-400 shadow-md"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.user2_name || 'User')}&size=64&background=EC4899&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="h-16 w-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                              {match.user2_name?.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{match.user2_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold ${getMatchScoreColor(match.match_score)}`}>
                          <TrendingUp size={16} />
                          {match.match_score}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(match.status)}`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(match.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteMatch(match.id, match.user1_name, match.user2_name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Match"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredMatches.length > matchesPerPage && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstMatch + 1} to {Math.min(indexOfLastMatch, filteredMatches.length)} of {filteredMatches.length} matches
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMatches;
