import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, Lock, Mail, User, Building, ShieldCheck, ArrowRight, AlertCircle, Briefcase } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering',
  'Product & Design',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Sales',
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    role: 'employee',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        if (result.user.role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-300 mb-4">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Join LeaveEase to simplify your team's leave workflows
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleRegister}>
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Full Name
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Sarah Connor"
                className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Work Email
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@company.com"
                className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Department
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building className="w-4 h-4" />
              </div>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-white"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                formData.role === 'employee'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={formData.role === 'employee'}
                  onChange={handleChange}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span className="text-xs">Employee</span>
              </label>

              <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                formData.role === 'manager'
                  ? 'border-purple-600 bg-purple-50/50 text-purple-900 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={formData.role === 'manager'}
                  onChange={handleChange}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span className="text-xs">Manager</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-200 transition-all duration-150 disabled:opacity-50 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
