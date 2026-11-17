import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Building, 
  Briefcase, 
  ShieldCheck, 
  Calendar, 
  LogOut, 
  ArrowRightLeft, 
  X, 
  CheckCircle2, 
  CreditCard,
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !user) return null;

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const handleSwitchRole = async () => {
    const targetRole = user?.role === 'manager' ? 'employee' : 'manager';
    const result = await loginAsDemo(targetRole);
    onClose();
    if (result?.success) {
      navigate(`/${targetRole}/dashboard`);
    }
  };

  const balance = user.leaveBalance || { casual: 8, sick: 6, earned: 14 };
  const quota = user.totalQuota || { casual: 12, sick: 10, earned: 18 };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Profile Card positioned at top-right corner */}
      <div 
        className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-4 duration-200 mt-12 sm:mt-14"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with gradient */}
        <div className="h-24 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 relative p-4 flex justify-between items-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            User Profile
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar & Main Info */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-inner">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active"></span>
            </div>

            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              user.role === 'manager'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}>
              {user.role === 'manager' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Manager
                </>
              ) : (
                <>
                  <Briefcase className="w-3.5 h-3.5" /> Employee
                </>
              )}
            </span>
          </div>

          {/* User Name & Email */}
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
              {user.name || 'Alex Morgan'}
            </h3>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user.email || 'user@leaveease.com'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mt-5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Department</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                {user.department || 'Engineering'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Employee ID</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Hash className="w-3.5 h-3.5 text-purple-500" />
                {user._id ? (user._id.length > 12 ? user._id.slice(0, 8) + '...' : user._id) : 'EMP-2026-01'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Employment Status</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active · Full Time
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">System Role</span>
              <span className="font-semibold text-slate-800 capitalize mt-0.5 block">
                {user.role}
              </span>
            </div>
          </div>

          {/* Quick Leave Balance Pill Summary */}
          <div className="mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Available Leave Quota
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-indigo-50/80 p-2 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block">Casual</span>
                <span className="text-base font-extrabold text-indigo-900">{balance.casual}</span>
                <span className="text-[9px] text-indigo-600/80 block">of {quota.casual} days</span>
              </div>
              <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-700 uppercase block">Sick</span>
                <span className="text-base font-extrabold text-rose-900">{balance.sick}</span>
                <span className="text-[9px] text-rose-600/80 block">of {quota.sick} days</span>
              </div>
              <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Earned</span>
                <span className="text-base font-extrabold text-emerald-900">{balance.earned}</span>
                <span className="text-[9px] text-emerald-600/80 block">of {quota.earned} days</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={handleSwitchRole}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
              Switch Demo View ({user.role === 'manager' ? 'Employee' : 'Manager'})
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
