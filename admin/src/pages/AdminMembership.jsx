import { useState, useEffect } from 'react';
import { adminUserAPI, adminMembershipAPI } from '../utils/adminApi';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError, showConfirm } from '../utils/sweetalert';
import { CreditCard, Users, TrendingUp, DollarSign, Edit, Trash2, Plus, Crown, X, Save } from 'lucide-react';

const AdminMembership = () => {
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalUnpaid: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_months: '',
    profile_views_limit: '',
    features: '',
    color: 'from-gray-400 to-gray-600'
  });

  const colorOptions = [
    { value: 'from-yellow-400 to-yellow-600', label: 'Gold' },
    { value: 'from-gray-300 to-gray-500', label: 'Silver' },
    { value: 'from-purple-400 to-purple-600', label: 'Purple' },
    { value: 'from-blue-400 to-blue-600', label: 'Blue' },
    { value: 'from-green-400 to-green-600', label: 'Green' },
    { value: 'from-red-400 to-red-600', label: 'Red' },
    { value: 'from-pink-400 to-pink-600', label: 'Pink' },
    { value: 'from-indigo-400 to-indigo-600', label: 'Indigo' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, plansRes] = await Promise.all([
        adminUserAPI.getAllUsers(),
        adminMembershipAPI.getPlans()
      ]);

      const users = usersRes.data.users;
      const paidUsers = users.filter(u => u.payment_status === 'paid').length;
      const unpaidUsers = users.filter(u => u.payment_status === 'unpaid').length;

      // Calculate revenue based on actual membership types
      let totalRevenue = 0;
      const plansData = plansRes.data.plans;
      users.forEach(user => {
        if (user.payment_status === 'paid' && user.membership_type) {
          const plan = plansData.find(p => p.name.toLowerCase() === user.membership_type.toLowerCase());
          if (plan) {
            totalRevenue += parseFloat(plan.price);
          }
        }
      });

      setStats({
        totalPaid: paidUsers,
        totalUnpaid: unpaidUsers,
        totalRevenue,
        monthlyRevenue: totalRevenue / 6
      });

      setPlans(plansData);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      showError('Failed to fetch membership data');
      setLoading(false);
    }
  };

  const handleTogglePlan = async (planId) => {
    setActionLoading(prev => ({ ...prev, [`toggle-${planId}`]: true }));
    try {
      await adminMembershipAPI.togglePlan(planId);
      await fetchData();
      showSuccess('Plan status updated successfully!');
    } catch (error) {
      showError('Failed to update plan status');
    } finally {
      setActionLoading(prev => ({ ...prev, [`toggle-${planId}`]: false }));
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    const confirmed = await showConfirm(
      `Delete the "${planName}" plan? This action cannot be undone.`,
      'Confirm Delete'
    );

    if (confirmed && confirmed.isConfirmed) {
      setActionLoading(prev => ({ ...prev, [`delete-${planId}`]: true }));
      try {
        await adminMembershipAPI.deletePlan(planId);
        await fetchData();
        showSuccess('Plan deleted successfully!');
      } catch (error) {
        console.error('Delete plan error:', error);
        showError(error.response?.data?.error || 'Failed to delete plan');
      } finally {
        setActionLoading(prev => ({ ...prev, [`delete-${planId}`]: false }));
      }
    }
  };

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price,
        duration_months: plan.duration_months,
        profile_views_limit: plan.profile_views_limit === null ? '' : plan.profile_views_limit,
        features: plan.features ? plan.features.join('\n') : '',
        color: plan.color || 'from-gray-400 to-gray-600'
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        price: '',
        duration_months: '',
        profile_views_limit: '',
        features: '',
        color: 'from-gray-400 to-gray-600'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      duration_months: '',
      profile_views_limit: '',
      features: '',
      color: 'from-gray-400 to-gray-600'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(prev => ({ ...prev, submit: true }));

    const featuresArray = formData.features
      .split('\n')
      .map(f => f.trim())
      .filter(f => f);

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      duration_months: parseInt(formData.duration_months),
      profile_views_limit: formData.profile_views_limit === '' ? null : parseInt(formData.profile_views_limit),
      features: featuresArray,
      color: formData.color
    };

    try {
      if (editingPlan) {
        await adminMembershipAPI.updatePlan(editingPlan.id, payload);
        showSuccess('Plan updated successfully!');
      } else {
        await adminMembershipAPI.createPlan(payload);
        showSuccess('Plan created successfully!');
      }
      closeModal();
      await fetchData();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to save plan');
    } finally {
      setActionLoading(prev => ({ ...prev, submit: false }));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
            <CreditCard className="text-primary" size={32} />
            Membership Management
          </h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and track revenue</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Members</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalPaid}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid Members</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalUnpaid}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Users className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              {/* <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="text-purple-600" size={24} />
              </div> */}
            </div>
          </div>

          {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">₹{Math.round(stats.monthlyRevenue).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </div> */}
        </div>

        {/* Membership Plans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Membership Plans</h2>
            <button
              onClick={() => openModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Add New Plan
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No membership plans found. Add your first plan!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl overflow-hidden ${
                    plan.is_active ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <Crown size={32} />
                    </div>
                    <div className="text-4xl font-bold mb-2">₹{parseFloat(plan.price).toLocaleString()}</div>
                    <p className="text-sm opacity-90">{plan.duration_months} Months</p>
                  </div>

                  {/* Features */}
                  <div className="bg-white p-6 border-x border-b border-gray-200">
                    <ul className="space-y-3 mb-6">
                      {(plan.features || []).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePlan(plan.id)}
                        disabled={actionLoading[`toggle-${plan.id}`]}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${
                          plan.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {actionLoading[`toggle-${plan.id}`] ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                        ) : (
                          plan.is_active ? 'Deactivate' : 'Activate'
                        )}
                      </button>
                      <button
                        onClick={() => openModal(plan)}
                        className="px-4 py-2 rounded-lg font-medium text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        disabled={actionLoading[`delete-${plan.id}`]}
                        className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoading[`delete-${plan.id}`] ? (
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Active Badge */}
                  {plan.is_active && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-green-600">
                        Active
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="e.g., Gold, Platinum"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    min="0"
                    placeholder="2999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months) *</label>
                  <input
                    type="number"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    min="1"
                    placeholder="3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Views Limit</label>
                <input
                  type="number"
                  value={formData.profile_views_limit}
                  onChange={(e) => setFormData({ ...formData, profile_views_limit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                  placeholder="Leave empty for unlimited"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited profile views</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {colorOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <div className={`mt-2 h-8 rounded-lg bg-gradient-to-r ${formData.color}`}></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="View 50 Profiles&#10;Send 25 Interests&#10;Chat Support"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.submit}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading.submit ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingPlan ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMembership;
