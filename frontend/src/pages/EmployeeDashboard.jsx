import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  Calendar, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  CalendarDays, 
  Info, 
  Trash2, 
  X,
  FileText,
  MessageSquare
} from 'lucide-react';

// Sample initial leave history for immediate preview & testability
const INITIAL_DEMO_LEAVES = [
  {
    _id: 'leave_1',
    leaveType: 'casual',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    totalDays: 3,
    reason: 'Family wedding ceremony and travel',
    status: 'Pending',
    managerComment: '',
    appliedAt: '2026-11-14T10:30:00.000Z',
  },
  {
    _id: 'leave_2',
    leaveType: 'sick',
    startDate: '2026-11-02',
    endDate: '2026-11-03',
    totalDays: 2,
    reason: 'Viral fever and prescribed medical rest',
    status: 'Approved',
    managerComment: 'Approved. Take rest and recover well!',
    appliedAt: '2026-11-01T08:15:00.000Z',
  },
  {
    _id: 'leave_3',
    leaveType: 'earned',
    startDate: '2026-10-15',
    endDate: '2026-10-18',
    totalDays: 4,
    reason: 'Annual vacation trip',
    status: 'Rejected',
    managerComment: 'Rejected due to critical sprint release deadline.',
    appliedAt: '2026-10-05T14:20:00.000Z',
  },
];

const EmployeeDashboard = () => {
  const { user, updateUser } = useAuth();

  // Leaves and UI state
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get current balances (with safe defaults)
  const balance = user?.leaveBalance || { casual: 8, sick: 6, earned: 14 };
  const quota = user?.totalQuota || { casual: 12, sick: 10, earned: 18 };

  // Today in YYYY-MM-DD for min date attribute
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch or initialize leaves
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await leaveAPI.getMyLeaves();
        if (res.data && Array.isArray(res.data)) {
          setLeaves(res.data);
        } else {
          setLeaves(INITIAL_DEMO_LEAVES);
        }
      } catch (err) {
        // Backend not yet reachable -> fallback to stored or initial demo data
        const saved = localStorage.getItem(`leaves_${user?._id || 'demo'}`);
        if (saved) {
          try {
            setLeaves(JSON.parse(saved));
          } catch {
            setLeaves(INITIAL_DEMO_LEAVES);
          }
        } else {
          setLeaves(INITIAL_DEMO_LEAVES);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [user?._id]);

  // Persist demo leaves to localStorage for realistic testing
  const saveLeavesLocally = (newLeaves) => {
    setLeaves(newLeaves);
    localStorage.setItem(`leaves_${user?._id || 'demo'}`, JSON.stringify(newLeaves));
  };

  // Calculate day difference when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end < start) {
        setCalculatedDays(0);
        setFormError('End Date cannot be earlier than Start Date');
        return;
      }

      // Inclusive days count
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setCalculatedDays(diffDays);

      // Check balance limit
      const currentAvailable = balance[formData.leaveType] ?? 0;
      if (diffDays > currentAvailable) {
        setFormError(
          `Requested ${diffDays} day(s) exceeds your available ${formData.leaveType} balance (${currentAvailable} day(s)).`
        );
      } else {
        // Check overlapping with existing pending/approved requests
        const isOverlapping = leaves.some((l) => {
          if (l.status === 'Rejected' || l.status === 'Cancelled') return false;
          const lStart = new Date(l.startDate);
          const lEnd = new Date(l.endDate);
          return start <= lEnd && end >= lStart;
        });

        if (isOverlapping) {
          setFormError('These dates overlap with an existing Pending or Approved leave request.');
        } else {
          setFormError('');
        }
      }
    } else {
      setCalculatedDays(0);
      setFormError('');
    }
  }, [formData.startDate, formData.endDate, formData.leaveType, balance, leaves]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Leave Request
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (formError || calculatedDays <= 0) return;

    setSubmitting(true);
    const newLeave = {
      _id: 'leave_' + Date.now(),
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays: calculatedDays,
      reason: formData.reason,
      status: 'Pending',
      managerComment: '',
      appliedAt: new Date().toISOString(),
    };

    try {
      await leaveAPI.applyLeave({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });
      // If backend works, refresh or append
      saveLeavesLocally([newLeave, ...leaves]);
    } catch (err) {
      // Backend offline -> demo mode local update
      saveLeavesLocally([newLeave, ...leaves]);
    } finally {
      setSubmitting(false);
      setIsModalOpen(false);
      setFormData({
        leaveType: 'casual',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setActionMessage({
        type: 'success',
        text: `Leave request for ${calculatedDays} day(s) submitted successfully!`,
      });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Cancel Pending Leave
  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to withdraw this leave request?')) return;

    try {
      await leaveAPI.cancelLeave(leaveId);
    } catch (err) {
      // Backend offline -> continue with client-side update
    }

    const updated = leaves.map((l) => (l._id === leaveId ? { ...l, status: 'Cancelled' } : l));
    saveLeavesLocally(updated);

    setActionMessage({
      type: 'info',
      text: 'Leave request has been withdrawn.',
    });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Filter and search
  const filteredLeaves = leaves.filter((leave) => {
    const matchesFilter =
      statusFilter === 'all' || leave.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      leave.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white p-6 sm:p-8 rounded-2xl shadow-lg shadow-indigo-100">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-indigo-100 mb-2">
            Employee Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Employee'}! 👋
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Track your leave balance, submit new time-off requests, and monitor manager review statuses in real-time.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-center flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95 text-sm font-bold rounded-xl shadow-md transition-all duration-150 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          Apply for Leave
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-xs border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Leave Balance Overview Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Leave Quota & Balances
          </h2>
          <span className="text-xs text-slate-500 font-medium">Annual Quota Cycle</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Casual Leave Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Casual Leave
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {quota.casual - balance.casual} used of {quota.casual}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-900">{balance.casual}</span>
              <span className="text-sm font-semibold text-slate-600">days left</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (balance.casual / quota.casual) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600 mt-3 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> For unexpected personal events & appointments
            </p>
          </div>

          {/* Sick Leave Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                Sick Leave
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {quota.sick - balance.sick} used of {quota.sick}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-900">{balance.sick}</span>
              <span className="text-sm font-semibold text-slate-600">days left</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (balance.sick / quota.sick) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600 mt-3 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> For medical rest, treatment, or health recovery
            </p>
          </div>

          {/* Earned Leave Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                Earned Leave
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {quota.earned - balance.earned} used of {quota.earned}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-900">{balance.earned}</span>
              <span className="text-sm font-semibold text-slate-600">days left</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (balance.earned / quota.earned) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600 mt-3 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> For planned holidays & extended vacations
            </p>
          </div>

        </div>
      </section>

      {/* Leave History & Status Tracker Table */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Leave History & Status Tracker
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Review past requests, check manager remarks, and cancel pending applications
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reason or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-6">Leave Type</th>
                <th className="py-3.5 px-6">Dates & Duration</th>
                <th className="py-3.5 px-6">Reason</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Manager Remarks</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold capitalize text-slate-800">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs ${
                        leave.leaveType === 'casual'
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : leave.leaveType === 'sick'
                          ? 'bg-rose-50 text-rose-700 font-bold'
                          : 'bg-emerald-50 text-emerald-700 font-bold'
                      }`}>
                        {leave.leaveType} Leave
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <span>
                          {leave.startDate?.split('T')[0]} to {leave.endDate?.split('T')[0]}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium ml-5">
                        {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-xs text-slate-600 text-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      {leave.managerComment ? (
                        <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="italic">{leave.managerComment}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No remarks yet</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {leave.status === 'Pending' ? (
                        <button
                          onClick={() => handleCancelLeave(leave._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                          title="Withdraw this request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600 font-medium">Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-600">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarDays className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">No leave requests found</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Try adjusting your search query or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Smart Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Apply for Leave</h3>
                <p className="text-xs text-indigo-100">Fill in details for manager review</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitLeave} className="p-6 space-y-4">
              
              {/* Leave Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Leave Type
                </label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="casual">Casual Leave ({balance.casual} days available)</option>
                  <option value="sick">Sick Leave ({balance.sick} days available)</option>
                  <option value="earned">Earned Leave ({balance.earned} days available)</option>
                </select>
              </div>

              {/* Date pickers (Start & End) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    min={todayStr}
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    min={formData.startDate || todayStr}
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Auto-calculated duration badge */}
              {calculatedDays > 0 && (
                <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                  <span className="text-slate-600 font-medium">Calculated Leave Duration:</span>
                  <span className="font-bold text-indigo-700 text-sm">
                    {calculatedDays} day{calculatedDays > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Reason for Absence
                </label>
                <textarea
                  name="reason"
                  rows="3"
                  required
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Provide brief details for your manager..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Form Validation Error Banner */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !!formError || calculatedDays <= 0}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeDashboard;
