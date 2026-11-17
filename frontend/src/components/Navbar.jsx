import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import { 
  CalendarCheck, 
  LogOut, 
  User, 
  ShieldCheck, 
  Briefcase, 
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, loginAsDemo } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = async () => {
    const targetRole = user?.role === 'manager' ? 'employee' : 'manager';
    const result = await loginAsDemo(targetRole);
    if (result?.success) {
      navigate(`/${targetRole}/dashboard`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <Link 
                to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                    LeaveEase
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider -mt-1">
                    Leave Management
                  </span>
                </div>
              </Link>

              {user?.role && (
                <span className={`hidden sm:inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  user.role === 'manager' 
                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {user.role === 'manager' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" /> Manager Portal
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-3.5 h-3.5" /> Employee Portal
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Top Right Corner: Profile & Actions */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Quick switch role button for fast testing */}
                <button
                  onClick={handleSwitchRole}
                  title="Toggle between Employee and Manager view"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Switch to {user.role === 'manager' ? 'Employee' : 'Manager'}</span>
                </button>

                {/* Profile Trigger Button in Top Right Corner */}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer group text-left"
                  title="View Profile Details"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>

                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                      {user.name || 'User Profile'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {user.department || 'General'} · <span className="capitalize">{user.role}</span>
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-y-0.5 hidden sm:block" />
                </button>

                {/* Quick Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200 cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Top Right Corner Profile Section Dropdown/Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </>
  );
};

export default Navbar;
