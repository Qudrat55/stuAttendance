import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, X, User, AlertCircle, Edit2, CheckCircle } from 'lucide-react';
import { storage } from '../services/storage';
import { User as UserType, UserRole, Grade } from '../types';

const Manage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'grades'>('teachers');
  const [users, setUsers] = useState<UserType[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  // Forms
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', gradeAssigned: '' });
  const [gradeForm, setGradeForm] = useState({ name: '', subjects: '' });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(storage.getUsers().filter(u => u.role === UserRole.TEACHER));
    const loadedGrades = storage.getGrades();
    // Sort grades naturally (Grade 1, Grade 2, Grade 10)
    loadedGrades.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    setGrades(loadedGrades);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Delete this teacher?')) {
      storage.deleteUser(id);
      refreshData();
    }
  };

  const handleDeleteGrade = (id: string) => {
    if (confirm('Delete this grade?')) {
      storage.deleteGrade(id);
      refreshData();
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setTeacherForm({ name: '', email: '', gradeAssigned: '' });
    setGradeForm({ name: '', subjects: '' });
    refreshData(); // Ensure grades are fresh
    setIsModalOpen(true);
  };

  const openEditUserModal = (user: UserType) => {
    setEditingUser(user);
    setTeacherForm({
        name: user.name,
        email: user.email,
        gradeAssigned: user.gradeAssigned || ''
    });
    refreshData(); // Ensure grades are fresh
    setIsModalOpen(true);
    setActiveTab('teachers'); // Ensure we are on the right tab
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserType = {
      id: editingUser ? editingUser.id : `T-${Date.now()}`,
      name: teacherForm.name,
      email: teacherForm.email,
      role: UserRole.TEACHER,
      gradeAssigned: teacherForm.gradeAssigned
    };
    storage.saveUser(newUser);
    setIsModalOpen(false);
    setTeacherForm({ name: '', email: '', gradeAssigned: '' });
    setEditingUser(null);
    refreshData();
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const newGrade: Grade = {
      id: `G-${Date.now()}`,
      name: gradeForm.name,
      subjects: gradeForm.subjects.split(',').map(s => s.trim())
    };
    storage.saveGrade(newGrade);
    setIsModalOpen(false);
    setGradeForm({ name: '', subjects: '' });
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Add {activeTab === 'teachers' ? 'Teacher' : 'Grade'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'teachers'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <User size={18} /> Teachers
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`px-6 py-3 font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'grades'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <BookOpen size={18} /> Grades
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {activeTab === 'teachers' ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Assigned Grade</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium dark:text-white">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.gradeAssigned ? (
                        <div className="flex items-center gap-2">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                              <CheckCircle size={14} />
                              {user.gradeAssigned}
                           </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800">
                                <AlertCircle size={14} />
                                Not Assigned
                            </span>
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditUserModal(user)}
                      className="text-blue-500 hover:text-blue-700 p-2 mr-1"
                      title="Edit Teacher"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove Teacher"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">No teachers found.</td></tr>}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-3">Grade Name</th>
                <th className="px-6 py-3">Subjects</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {grades.map(grade => (
                <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium dark:text-white">{grade.name}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    <div className="flex flex-wrap gap-1">
                      {grade.subjects.map(sub => (
                        <span key={sub} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteGrade(grade.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {grades.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-gray-500">No grades found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingUser ? 'Edit Teacher' : `Add ${activeTab === 'teachers' ? 'Teacher' : 'Grade'}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500" /></button>
            </div>
            
            {activeTab === 'teachers' ? (
              <form onSubmit={handleSaveTeacher} className="space-y-4">
                <input
                  required
                  placeholder="Full Name"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={teacherForm.name}
                  onChange={e => setTeacherForm({...teacherForm, name: e.target.value})}
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={teacherForm.email}
                  onChange={e => setTeacherForm({...teacherForm, email: e.target.value})}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Class/Grade (Required)</label>
                  <select
                      required
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={teacherForm.gradeAssigned}
                      onChange={e => setTeacherForm({...teacherForm, gradeAssigned: e.target.value})}
                  >
                      <option value="">-- Select Grade --</option>
                      {grades.map(g => (
                          <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                  </select>
                  {grades.length === 0 && (
                      <p className="text-yellow-600 text-xs mt-1">
                          No grades found. <button type="button" onClick={() => { setIsModalOpen(false); setActiveTab('grades'); }} className="underline font-bold">Create a Grade first</button>
                      </p>
                  )}
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                    {editingUser ? <Edit2 size={18} /> : <Plus size={18} />}
                    {editingUser ? 'Update Teacher' : 'Save Teacher'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSaveGrade} className="space-y-4">
                <input
                  required
                  placeholder="Grade Name (e.g. Grade 11)"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={gradeForm.name}
                  onChange={e => setGradeForm({...gradeForm, name: e.target.value})}
                />
                <input
                  required
                  placeholder="Subjects (comma separated)"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={gradeForm.subjects}
                  onChange={e => setGradeForm({...gradeForm, subjects: e.target.value})}
                />
                <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-indigo-700">Save Grade</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Manage;