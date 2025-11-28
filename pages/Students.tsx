import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Search, X } from 'lucide-react';
import { storage } from '../services/storage';
import { Student, UserRole } from '../types';
import { IDCard } from '../components/IDCard';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isIDModalOpen, setIsIDModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [grades, setGrades] = useState<string[]>([]);
  
  // User Context
  const currentUser = storage.getCurrentUser();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    grade: '',
    section: 'A'
  });

  useEffect(() => {
    refreshData();
    const allGrades = storage.getGrades().map(g => g.name);
    setGrades(allGrades);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update form default when modal opens or user context loads
  useEffect(() => {
    if (!isAdmin && currentUser?.gradeAssigned && isModalOpen) {
        setFormData(prev => ({ ...prev, grade: currentUser.gradeAssigned }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentUser?.gradeAssigned, isModalOpen]); // Fix: Use primitive dependency

  const refreshData = () => {
    const allStudents = storage.getStudents();
    if (isAdmin) {
      setStudents(allStudents);
    } else {
      // Filter for Teacher's grade
      if (currentUser?.gradeAssigned) {
          setStudents(allStudents.filter(s => s.grade === currentUser.gradeAssigned));
      } else {
          setStudents([]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Grade Check for Teachers
    let assignedGrade = formData.grade;
    if (!isAdmin && currentUser?.gradeAssigned) {
        assignedGrade = currentUser.gradeAssigned;
    }

    // Default fallback if still empty
    if (!assignedGrade) {
        // Try to pick first available grade or default
        assignedGrade = grades.length > 0 ? grades[0] : 'Grade 10';
    }

    const newStudent: Student = {
      id: formData.id || `ST-${Date.now()}`,
      name: formData.name || '',
      fatherName: formData.fatherName || '',
      grade: assignedGrade,
      section: formData.section || 'A',
      rollNo: formData.rollNo || '',
      contact: formData.contact || ''
    };
    storage.saveStudent(newStudent);
    setIsModalOpen(false);
    
    // Reset form but keep grade if teacher
    setFormData({ 
      grade: (!isAdmin && currentUser?.gradeAssigned) ? currentUser.gradeAssigned : (grades[0] || 'Grade 10'), 
      section: 'A',
      name: '',
      fatherName: '',
      rollNo: '',
      contact: ''
    }); 
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      storage.deleteStudent(id);
      refreshData();
    }
  };

  const handlePrintID = (student: Student) => {
    setSelectedStudent(student);
    setIsIDModalOpen(true);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student Management</h1>
           {!isAdmin && <p className="text-gray-500 text-sm">Managing: {currentUser?.gradeAssigned}</p>}
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Add Student</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3">Roll No</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-200">
                  <td className="px-6 py-4 font-medium">{student.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-xs text-gray-400">{student.fatherName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{student.grade} - {student.section}</td>
                  <td className="px-6 py-4">{student.rollNo}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handlePrintID(student)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Generate ID Card"
                    >
                      <Printer size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete Student"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Student</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                required
                placeholder="Full Name" 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                required
                placeholder="Father's Name" 
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.fatherName || ''}
                onChange={e => setFormData({...formData, fatherName: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <select 
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    value={formData.grade}
                    disabled={!isAdmin} // Lock for teachers
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                >
                    <option value="">Select Grade</option>
                    {grades.map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
                <input 
                    placeholder="Section" 
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.section || ''}
                    onChange={e => setFormData({...formData, section: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                    placeholder="Roll Number" 
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.rollNo || ''}
                    onChange={e => setFormData({...formData, rollNo: e.target.value})}
                />
                <input 
                    placeholder="Contact Info" 
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.contact || ''}
                    onChange={e => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-indigo-700">Save Student</button>
            </form>
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {isIDModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto print:p-0 print:static print:bg-white print:block">
          <div className="relative bg-transparent print:w-full print:h-full">
            <button 
                onClick={() => setIsIDModalOpen(false)} 
                className="absolute -top-12 right-0 text-white hover:text-gray-300 print:hidden flex items-center gap-2"
            >
                <X size={24} /> Close
            </button>
            
            <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-6 print:p-0 print:shadow-none">
                <div id="printable-id-card">
                    <IDCard student={selectedStudent} />
                </div>
                <button 
                    onClick={() => window.print()} 
                    className="bg-primary text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 print:hidden hover:bg-indigo-700"
                >
                    <Printer size={20} /> Print ID Card
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;