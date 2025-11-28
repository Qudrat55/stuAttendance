import React, { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { storage } from '../services/storage';
import { generateAttendanceReport } from '../services/gemini';

const Reports: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const students = storage.getStudents();
  const attendance = storage.getAttendance();

  const handleGenerateAIReport = async () => {
    setLoading(true);
    const result = await generateAttendanceReport(students, attendance);
    setAiAnalysis(result);
    setLoading(false);
  };

  const calculateStats = (studentId: string) => {
    const records = attendance.filter(a => a.studentId === studentId);
    return {
        total: records.length,
        present: records.filter(a => a.status === 'PRESENT').length,
        absent: records.filter(a => a.status === 'ABSENT').length,
        late: records.filter(a => a.status === 'LATE').length
    };
  };

  const exportToCSV = () => {
      let csv = 'Student ID, Name, Grade, Total Days, Present, Absent, Late\n';
      students.forEach(s => {
          const stats = calculateStats(s.id);
          csv += `${s.id}, ${s.name}, ${s.grade}, ${stats.total}, ${stats.present}, ${stats.absent}, ${stats.late}\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Reports</h1>
        <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={20} />
          <span>Export Excel/CSV</span>
        </button>
      </div>

      {/* AI Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
              <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="text-yellow-300" /> AI Insights
                  </h2>
                  <p className="text-indigo-100 mt-1 text-sm">Get AI-powered analysis of attendance trends and risk factors.</p>
              </div>
              <button 
                onClick={handleGenerateAIReport}
                disabled={loading}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 disabled:opacity-50"
              >
                  {loading ? 'Analyzing...' : 'Generate Analysis'}
              </button>
          </div>
          
          {aiAnalysis && (
              <div className="mt-6 bg-white/10 p-4 rounded-lg backdrop-blur-sm animate-fade-in">
                  <p className="whitespace-pre-line leading-relaxed">{aiAnalysis}</p>
              </div>
          )}
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3 text-center">Total Days</th>
                <th className="px-6 py-3 text-center text-green-600">Present</th>
                <th className="px-6 py-3 text-center text-red-600">Absent</th>
                <th className="px-6 py-3 text-center text-yellow-600">Late</th>
                <th className="px-6 py-3 text-center">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map(student => {
                  const stats = calculateStats(student.id);
                  const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-200">
                        <td className="px-6 py-4 font-medium">
                            <div>{student.name}</div>
                            <div className="text-xs text-gray-400">{student.id}</div>
                        </td>
                        <td className="px-6 py-4">{student.grade}</td>
                        <td className="px-6 py-4 text-center font-bold">{stats.total}</td>
                        <td className="px-6 py-4 text-center text-green-600 font-medium">{stats.present}</td>
                        <td className="px-6 py-4 text-center text-red-600 font-medium">{stats.absent}</td>
                        <td className="px-6 py-4 text-center text-yellow-600 font-medium">{stats.late}</td>
                        <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                percentage >= 75 ? 'bg-green-100 text-green-800' : 
                                percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                            }`}>
                                {percentage}%
                            </span>
                        </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;