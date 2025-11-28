import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Manage from './pages/Manage';
import Sidebar from './components/Sidebar';
import { storage } from './services/storage';
import { User, UserRole } from './types';
import { Moon, Sun, Bell } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = storage.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = storage.getCurrentUser();
    if (user?.role !== UserRole.ADMIN) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const user = storage.getCurrentUser();
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!user) return null;

  // Simple title mapping
  const titles: Record<string, string> = {
      '/': 'Dashboard',
      '/attendance': 'Attendance',
      '/students': 'Manage Students',
      '/reports': 'Reports & Analytics',
      '/manage': 'Admin Management'
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={user.role} />
      <div className="flex-1 ml-64 transition-all duration-200 flex flex-col h-screen overflow-hidden print:ml-0">
        
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center no-print">
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">
                {titles[location.pathname] || 'EduScan Pro'}
            </h2>
            <div className="flex items-center gap-4">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                    </div>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900 print:p-0 print:bg-white">
            {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute>
            <Layout>
              <Students />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute>
            <Layout>
              <Attendance />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/manage" element={
          <ProtectedRoute>
            <AdminRoute>
                <Layout>
                    <Manage />
                </Layout>
            </AdminRoute>
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;