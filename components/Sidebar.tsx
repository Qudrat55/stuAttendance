import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, BarChart3, LogOut, ScanLine, Settings } from 'lucide-react';
import { storage } from '../services/storage';
import { UserRole } from '../types';

interface SidebarProps {
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary text-white shadow-md'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col fixed left-0 top-0 transition-colors duration-200 no-print">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <ScanLine size={28} />
          <span>EduScan Pro</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/" className={navClass}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/attendance" className={navClass}>
          <UserCheck size={20} />
          <span>Attendance</span>
        </NavLink>

        {/* Visible to Both Admin and Teacher now */}
        <NavLink to="/students" className={navClass}>
          <Users size={20} />
          <span>Students</span>
        </NavLink>

        {userRole === UserRole.ADMIN && (
          <NavLink to="/manage" className={navClass}>
            <Settings size={20} />
            <span>Manage Staff</span>
          </NavLink>
        )}

        <NavLink to="/reports" className={navClass}>
          <BarChart3 size={20} />
          <span>Reports & AI</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;