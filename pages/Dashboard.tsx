import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import { storage } from '../services/storage';
import { UserRole } from '../types';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const user = storage.getCurrentUser();

  useEffect(() => {
    let students = storage.getStudents();
    let attendance = storage.getAttendance();
    const today = new Date().toISOString().split('T')[0];

    // FILTER: If user is a Teacher, only show data for their assigned grade
    if (user?.role === UserRole.TEACHER && user.gradeAssigned) {
        students = students.filter(s => s.grade === user.gradeAssigned);
        attendance = attendance.filter(a => {
            return students.some(s => s.id === a.studentId);
        });
    }
    
    const todayRecords = attendance.filter(a => a.date === today);

    setStats({
      totalStudents: students.length,
      presentToday: todayRecords.filter(a => a.status === 'PRESENT').length,
      lateToday: todayRecords.filter(a => a.status === 'LATE').length,
      absentToday: todayRecords.filter(a => a.status === 'ABSENT').length
    });

    // Prepare chart data (Last 5 days attendance)
    const last5Days = Array.from({length: 5}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const data = last5Days.map(date => {
        const records = attendance.filter(a => a.date === date);
        return {
            date: date.slice(5), // MM-DD
            Present: records.filter(a => a.status === 'PRESENT').length,
            Absent: records.filter(a => a.status === 'ABSENT').length
        };
    });
    setChartData(data);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.gradeAssigned]);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const pieData = [
    { name: 'Present', value: stats.presentToday },
    { name: 'Late', value: stats.lateToday },
    { name: 'Absent', value: stats.absentToday },
  ];

  const isTeacherWithNoStudents = user?.role === UserRole.TEACHER && stats.totalStudents === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Welcome back, {user?.name}
            {user?.role === UserRole.TEACHER && user.gradeAssigned && (
                <span className="text-sm font-normal bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                    {user.gradeAssigned}
                </span>
            )}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                {user?.role === UserRole.TEACHER && user.gradeAssigned 
                    ? "Here is your class performance overview."
                    : "Here's what's happening today across the school."}
            </p>
        </div>
      </div>

      {isTeacherWithNoStudents && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                  <h2 className="text-xl font-bold mb-2">Setup Your Class</h2>
                  <p className="opacity-90">You are assigned to <strong>{user?.gradeAssigned}</strong>, but there are no students yet.</p>
                  <p className="opacity-90 text-sm">Add students to start tracking attendance and generating ID cards.</p>
              </div>
              <Link to="/students" className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                  <Plus size={20} /> Add Students
              </Link>
          </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Present Today</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.presentToday}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Late Today</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.lateToday}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Absent Today</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.absentToday}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      {!isTeacherWithNoStudents && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Attendance Trends (Last 5 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} 
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="Present" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Today's Distribution</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;