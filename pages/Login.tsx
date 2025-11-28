import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, Lock, Mail, User as UserIcon, ChevronDown } from 'lucide-react';
import { storage } from '../services/storage';
import { User, UserRole } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@school.com');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [error, setError] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    setAvailableUsers(storage.getUsers());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = storage.login(email, role);
    if (user) {
      storage.setSession(user);
      navigate('/');
    } else {
      setError('Invalid credentials.');
    }
  };

  const handleQuickSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const userId = e.target.value;
      const user = availableUsers.find(u => u.id === userId);
      if (user) {
          setEmail(user.email);
          setRole(user.role);
          setError('');
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm text-white">
            <ScanLine size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">EduScan Pro</h1>
          <p className="text-indigo-200 text-sm">School Management System</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
            
            {/* Quick Select for Demo/Testing */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1 block">
                    Select User (Demo Mode)
                </label>
                <div className="relative">
                    <UserIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-400" size={16} />
                    <select 
                        className="w-full pl-8 pr-8 py-2 text-sm bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 rounded text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
                        onChange={handleQuickSelect}
                        defaultValue=""
                    >
                        <option value="" disabled>-- Choose an account to login --</option>
                        {availableUsers.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.role === UserRole.ADMIN ? '👑' : '👨‍🏫'} {u.name} ({u.role === UserRole.TEACHER ? u.gradeAssigned : 'Admin'})
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400" size={16} />
                </div>
            </div>

            <div className="relative flex items-center justify-center">
                 <div className="border-t border-gray-200 dark:border-gray-700 w-full absolute"></div>
                 <span className="bg-white dark:bg-gray-800 px-2 text-xs text-gray-400 relative z-10">OR LOGIN MANUALLY</span>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  role === UserRole.ADMIN ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setRole(UserRole.ADMIN)}
              >
                Admin
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  role === UserRole.TEACHER ? 'bg-white dark:bg-gray-600 shadow text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => {
                    setRole(UserRole.TEACHER);
                    // Don't auto-fill email here to encourage using the dropdown or typing
                }}
              >
                Teacher
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  placeholder="Email Address"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  defaultValue="password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  placeholder="Password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-500/30"
            >
              Login as {role === UserRole.ADMIN ? 'Admin' : 'Teacher'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;