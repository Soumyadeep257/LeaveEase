import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveAPI, userAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  CalendarCheck,
  Building,
  Edit3,
  Calendar,
  MessageSquare,
  X,
  UserCheck,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

// Sample employees data for immediate testability and quota management
const INITIAL_DEMO_EMPLOYEES = [
  {
    _id: 'emp_001',
    name: 'Alex Morgan',
    email: 'alex@leaveease.com',
    department: 'Engineering',
    role: 'employee',
    leaveBalance: { casual: 8, sick: 6, earned: 14 },
    totalQuota: { casual: 12, sick: 10, earned: 18 },
  },
  {
    _id: 'emp_002',
    name: 'Liam Chen',
    email: 'liam.chen@leaveease.com',
    department: 'Engineering',
    role: 'employee',
    leaveBalance: { casual: 10, sick: 9, earned: 16 },
    totalQuota: { casual: 12, sick: 10, earned: 18 },
  },
  {
    _id: 'emp_003',
    name: 'Priya Sharma',
    email: 'priya.s@leaveease.com',
    department: 'Product & Design',
    role: 'employee',
    leaveBalance: { casual: 5, sick: 7, earned: 12 },
    totalQuota: { casual: 12, sick: 10, earned: 18 },
  },
  {
    _id: 'emp_004',
    name: 'David Miller',
    email: 'david.m@leaveease.com',
    department: 'Marketing',
    role: 'employee',
    leaveBalance: { casual: 9, sick: 8, earned: 15 },
    totalQuota: { casual: 12, sick: 10, earned: 18 },
  },
  {
    _id: 'emp_005',
    name: 'Emma Watson',
    email: 'emma.w@leaveease.com',
    department: 'Human Resources',
    role: 'employee',
    leaveBalance: { casual: 11, sick: 10, earned: 18 },
    totalQuota: { casual: 12, sick: 10, earned: 18 },
  },
];

// Sample team leave requests
const INITIAL_TEAM_LEAVES = [
  {
    _id: 'leave_101',
    employeeId: 'emp_001',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    leaveType: 'casual',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    totalDays: 3,
    reason: 'Family wedding ceremony and travel out of town',
    status: 'Pending',
    managerComment: '',
    appliedAt: '2026-11-14T10:30:00.000Z',
  },
  {
    _id: 'leave_102',
    employeeId: 'emp_002',
    employeeName: 'Liam Chen',
    department: 'Engineering',
    leaveType: 'sick',
    startDate: '2026-11-15',
    endDate: '2026-11-16',
    totalDays: 2,
    reason: 'Severe food poisoning and physician consult',
    status: 'Approved',
    managerComment: 'Approved. Get well soon Liam!',
    appliedAt: '2026-11-14T08:00:00.000Z',
  },
  {
    _id: 'leave_103',
    employeeId: 'emp_003',
    employeeName: 'Priya Sharma',
    department: 'Product & Design',
    leaveType: 'earned',
    startDate: '2026-11-25',
    endDate: '2026-11-29',
    totalDays: 5,
    reason: 'Taking planned vacation days with family',
    status: 'Pending',
    managerComment: '',
    appliedAt: '2026-11-13T16:45:00.000Z',
  },
  {
    _id: 'leave_104',
    employeeId: 'emp_004',
    employeeName: 'David Miller',
    department: 'Marketing',
    leaveType: 'casual',
    startDate: '2026-11-18',
    endDate: '2026-11-18',
    totalDays: 1,
    reason: 'Personal paperwork and license renewal at DMV',
    status: 'Pending',
    managerComment: '',
    appliedAt: '2026-11-14T11:10:00.000Z',
  },
];

const DEPARTMENTS = [
  'All Departments',
  'Engineering',
  'Product & Design',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
];

const ManagerDashboard = () => {
  const { user } = useAuth();

  // State
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'directory'
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertBanner, setAlertBanner] = useState(null);

  // Review Remarks Modal State
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState('Approve'); // 'Approve' or 'Reject'
  const [managerRemark, setManagerRemark] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Quota Adjustment Modal State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [quotaAdjustForm, setQuotaAdjustForm] = useState({
    casual: 0,
    sick: 0,
    earned: 0,
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      // 1. Load leaves
      try {
        const res = await leaveAPI.getAllLeaves();
        if (res.data && Array.isArray(res.data)) {
          setLeaves(res.data);
        } else {
          setLeaves(INITIAL_TEAM_LEAVES);
        }
      } catch {
        const localLeaves = localStorage.getItem('team_leaves_demo');
        setLeaves(localLeaves ? JSON.parse(localLeaves) : INITIAL_TEAM_LEAVES);
      }

      // 2. Load employees
      try {
        const userRes = await userAPI.getAllUsers();
        if (userRes.data && Array.isArray(userRes.data)) {
          setEmployees(userRes.data);
        } else {
          setEmployees(INITIAL_DEMO_EMPLOYEES);
        }
      } catch {
        const localEmps = localStorage.getItem('team_employees_demo');
        setEmployees(localEmps ? JSON.parse(localEmps) : INITIAL_DEMO_EMPLOYEES);
      }
    };

    loadData();
  }, []);

  const saveLeaves = (updated) => {
    setLeaves(updated);
    localStorage.setItem('team_leaves_demo', JSON.stringify(updated));
  };

  const saveEmployees = (updated) => {
    setEmployees(updated);
    localStorage.setItem('team_employees_demo', JSON.stringify(updated));
  };

  // Open Remark Modal
  const openActionModal = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setManagerRemark(type === 'Approve' ? 'Approved, have a great time-off!' : 'Unable to approve due to team bandwidth.');
  };

  // Check department overlap
  const getDepartmentOverlap = (targetLeave) => {
    if (!targetLeave) return [];
    const start = new Date(targetLeave.startDate);
    const end = new Date(targetLeave.endDate);

    return leaves.filter((l) => {
      if (l._id === targetLeave._id) return false;
      if (l.department !== targetLeave.department) return false;
      if (l.status !== 'Approved' && l.status !== 'Pending') return false;

      const lStart = new Date(l.startDate);
      const lEnd = new Date(l.endDate);
      return start <= lEnd && end >= lStart;
    });
  };

  // Finalize Approval or Rejection
  const handleFinalizeAction = async () => {
    if (!selectedLeave) return;

    setProcessingAction(true);
    const newStatus = actionType === 'Approve' ? 'Approved' : 'Rejected';

    try {
      await leaveAPI.updateLeaveStatus(selectedLeave._id, {
        status: newStatus,
        managerComment: managerRemark,
      });
    } catch {
      // Offline fallback
    }

    // Update leaves state
    const updatedLeaves = leaves.map((l) => {
      if (l._id === selectedLeave._id) {
        return {
          ...l,
          status: newStatus,
          managerComment: managerRemark,
        };
      }
      return l;
    });
    saveLeaves(updatedLeaves);

    // If Approved, deduct balance from employee record
    if (newStatus === 'Approved') {
      const updatedEmps = employees.map((emp) => {
        if (emp._id === selectedLeave.employeeId || emp.name === selectedLeave.employeeName) {
          const type = selectedLeave.leaveType;
          const currentBal = emp.leaveBalance[type] || 0;
          return {
            ...emp,
            leaveBalance: {
              ...emp.leaveBalance,
              [type]: Math.max(0, currentBal - selectedLeave.totalDays),
            },
          };
        }
        return emp;
      });
      saveEmployees(updatedEmps);
    }

    setProcessingAction(false);
    setSelectedLeave(null);
    setAlertBanner({
      type: newStatus === 'Approved' ? 'success' : 'warning',
      text: `Leave request for ${selectedLeave.employeeName} has been ${newStatus.toLowerCase()}.`,
    });
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // Open Quota Modal
  const openQuotaModal = (emp) => {
    setSelectedEmployee(emp);
    setQuotaAdjustForm({
      casual: emp.leaveBalance.casual,
      sick: emp.leaveBalance.sick,
      earned: emp.leaveBalance.earned,
    });
  };

  // Save adjusted quota
  const handleSaveQuota = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      await userAPI.updateUserQuota(selectedEmployee._id, quotaAdjustForm);
    } catch {
      // offline fallback
    }

    const updatedEmps = employees.map((emp) => {
      if (emp._id === selectedEmployee._id) {
        return {
          ...emp,
          leaveBalance: {
            casual: Number(quotaAdjustForm.casual),
            sick: Number(quotaAdjustForm.sick),
            earned: Number(quotaAdjustForm.earned),
          },
        };
      }
      return emp;
    });
    saveEmployees(updatedEmps);

    setSelectedEmployee(null);
    setAlertBanner({
      type: 'success',
      text: `Leave balances updated successfully for ${selectedEmployee.name}!`,
    });
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // Stats Calculations
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  
  // Today's leave check
  const todayStr = new Date().toISOString().split('T')[0];
  const onLeaveToday = leaves.filter((l) => {
    if (l.status !== 'Approved') return false;
    return l.startDate <= todayStr && l.endDate >= todayStr;
  });

  // Filtered requests
  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus =
      statusFilter === 'all' || l.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDept =
      departmentFilter === 'All Departments' || l.department === departmentFilter;
    const matchesSearch =
      (l.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.department || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesDept && matchesSearch;
  });

  const overlappingMembers = selectedLeave ? getDepartmentOverlap(selectedLeave) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg shadow-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-purple-100 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Manager & Admin Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Manager'}!
          </h1>
          <p className="text-purple-100 text-sm mt-1 max-w-2xl">
            Review team leave requests, analyze department scheduling overlaps, and manage employee leave quotas.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-white/10 p-1 rounded-xl self-start md:self-center border border-white/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-purple-100 hover:text-white'
            }`}
          >
            Leave Approvals ({pendingCount} pending)
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-white text-purple-900 shadow-md'
                : 'text-purple-100 hover:text-white'
            }`}
          >
            Employee Directory & Quotas
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-xs border ${
            alertBanner.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{alertBanner.text}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Requests Alert Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          {pendingCount > 0 && (
            <div className="absolute top-3 right-3 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Pending Review</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{pendingCount}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Action Needed
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">Requires manager decision</p>
        </div>

        {/* On Leave Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">On Leave Today</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{onLeaveToday.length}</span>
            <span className="text-xs font-semibold text-slate-600">employees</span>
          </div>
          <p className="text-xs text-slate-600 mt-2 truncate">
            {onLeaveToday.length > 0
              ? onLeaveToday.map((l) => l.employeeName).join(', ')
              : 'Full team available today'}
          </p>
        </div>

        {/* Approved Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Approved Leaves</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{approvedCount}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              This cycle
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">Deducted from employee balances</p>
        </div>

        {/* Total Team Members */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Team Size</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{employees.length}</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Active staff
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">Across {DEPARTMENTS.length - 1} departments</p>
        </div>

      </section>

      {/* Main Content Sections based on Active Tab */}
      {activeTab === 'requests' ? (
        
        /* TAB 1: ACTIONABLE APPROVAL QUEUE & ALL REQUESTS */
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Action Bar Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
                Actionable Approval Queue
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Review pending requests at the top, evaluate team overlaps, and record remarks
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employee, dept, reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
                />
              </div>

              {/* Department Dropdown */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700 font-medium"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Status Tabs */}
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
                    {tab} {tab === 'pending' && pendingCount > 0 && `(${pendingCount})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Leave Type</th>
                  <th className="py-3.5 px-6">Dates & Days</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Manager Remarks</th>
                  <th className="py-3.5 px-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <tr 
                      key={leave._id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        leave.status === 'Pending' ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Employee details */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">
                          {leave.employeeName || 'Employee'}
                        </div>
                        <span className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          {leave.department || 'Engineering'}
                        </span>
                      </td>

                      {/* Leave Type */}
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                          leave.leaveType === 'casual'
                            ? 'bg-indigo-50 text-indigo-700'
                            : leave.leaveType === 'sick'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {leave.leaveType}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800 text-xs flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4 text-slate-400" />
                          {leave.startDate?.split('T')[0]} to {leave.endDate?.split('T')[0]}
                        </div>
                        <span className="text-xs font-bold text-indigo-600 ml-5">
                          {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-6 max-w-xs text-xs text-slate-600 truncate" title={leave.reason}>
                        {leave.reason}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={leave.status} />
                      </td>

                      {/* Remarks */}
                      <td className="py-4 px-6 max-w-xs text-xs">
                        {leave.managerComment ? (
                          <div className="flex items-start gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200 italic text-slate-600">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            {leave.managerComment}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">No note attached</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right">
                        {leave.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openActionModal(leave, 'Approve')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal(leave, 'Reject')}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-600">Decided</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-600">
                      <div className="flex flex-col items-center justify-center">
                        <CalendarCheck className="w-10 h-10 text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No leave requests match your criteria</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Try changing the status tab, department filter, or search keywords
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      ) : (

        /* TAB 2: EMPLOYEE DIRECTORY & QUOTA MANAGEMENT */
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Employee Directory & Quota Management
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                View team balances, award bonus leaves, and adjust quotas per employee
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 self-start">
              {employees.length} Registered Employees
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-6">Employee Profile</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6 text-center">Casual Leave</th>
                  <th className="py-3.5 px-6 text-center">Sick Leave</th>
                  <th className="py-3.5 px-6 text-center">Earned Leave</th>
                  <th className="py-3.5 px-6 text-right">Quota Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                      <div className="text-xs text-slate-600">{emp.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Building className="w-3 h-3 text-slate-500" />
                        {emp.department}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                        {emp.leaveBalance?.casual ?? 0} days
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-100">
                        {emp.leaveBalance?.sick ?? 0} days
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                        {emp.leaveBalance?.earned ?? 0} days
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openQuotaModal(emp)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        Adjust Quota
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>
      )}

      {/* Review Remarks Modal (Approve / Reject) */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className={`px-6 py-5 text-white flex items-center justify-between ${
              actionType === 'Approve'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
                : 'bg-gradient-to-r from-rose-600 to-rose-700'
            }`}>
              <div className="flex items-center gap-2.5">
                {actionType === 'Approve' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                <div>
                  <h3 className="text-lg font-bold">
                    {actionType} Leave Request
                  </h3>
                  <p className="text-xs text-white/80">
                    Confirm manager decision and attach remark
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">{selectedLeave.employeeName}</span>
                  <span className="font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedLeave.department}
                  </span>
                </div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{selectedLeave.startDate?.split('T')[0]} to {selectedLeave.endDate?.split('T')[0]}</span>
                  <span className="font-bold text-indigo-700">({selectedLeave.totalDays} day{selectedLeave.totalDays > 1 ? 's' : ''})</span>
                </div>
                <div className="text-slate-700 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-600">Reason: </span>
                  {selectedLeave.reason}
                </div>
              </div>

              {/* Department Overlap Warning */}
              {overlappingMembers.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Team Coverage Warning: </span>
                    {overlappingMembers.length} other team member(s) in {selectedLeave.department} ({overlappingMembers.map(m => m.employeeName).join(', ')}) have overlapping leaves during this period.
                  </div>
                </div>
              )}

              {/* Remarks Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Manager Remark / Feedback
                </label>
                <textarea
                  rows="3"
                  value={managerRemark}
                  onChange={(e) => setManagerRemark(e.target.value)}
                  placeholder="e.g. Approved, enjoy your trip or Rejected due to sprint deadline..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
                <p className="text-[11px] text-slate-600 mt-1">
                  This note will be visible on the employee's dashboard tracker.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeAction}
                  disabled={processingAction}
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer ${
                    actionType === 'Approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {processingAction ? 'Updating...' : `Confirm ${actionType}`}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Adjust Quota Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-purple-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Adjust Leave Quota</h3>
                <p className="text-xs text-indigo-100">For {selectedEmployee.name}</p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuota} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Casual Leave Balance (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={quotaAdjustForm.casual}
                  onChange={(e) => setQuotaAdjustForm({ ...quotaAdjustForm, casual: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Sick Leave Balance (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={quotaAdjustForm.sick}
                  onChange={(e) => setQuotaAdjustForm({ ...quotaAdjustForm, sick: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Earned Leave Balance (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={quotaAdjustForm.earned}
                  onChange={(e) => setQuotaAdjustForm({ ...quotaAdjustForm, earned: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Quota Balances
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerDashboard;
