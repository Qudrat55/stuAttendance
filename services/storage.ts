import { User, Student, AttendanceRecord, Grade, UserRole, AttendanceStatus } from '../types';

const KEYS = {
  USERS: 'eduscan_users',
  STUDENTS: 'eduscan_students',
  ATTENDANCE: 'eduscan_attendance',
  GRADES: 'eduscan_grades',
  SESSION: 'eduscan_session'
};

// Helper to generate default grades
const getDefaultGrades = (): Grade[] => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `g${i + 1}`,
      name: `Grade ${i + 1}`,
      subjects: ['Math', 'Science', 'English', 'History']
    }));
};

// Seed Data
const seedData = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    const admin: User = { id: 'admin1', name: 'Super Admin', email: 'admin@school.com', role: UserRole.ADMIN };
    const teacher: User = { id: 'teacher1', name: 'John Doe', email: 'teacher@school.com', role: UserRole.TEACHER, gradeAssigned: 'Grade 10' };
    localStorage.setItem(KEYS.USERS, JSON.stringify([admin, teacher]));
  }
  
  // Robust check for grades: if key missing OR empty array
  const storedGrades = localStorage.getItem(KEYS.GRADES);
  if (!storedGrades || storedGrades === '[]') {
    localStorage.setItem(KEYS.GRADES, JSON.stringify(getDefaultGrades()));
  }

  if (!localStorage.getItem(KEYS.STUDENTS)) {
    const students: Student[] = [
      { id: 'ST-2024-001', name: 'Alice Smith', fatherName: 'Bob Smith', grade: 'Grade 10', section: 'A', rollNo: '101', contact: '555-0101' },
      { id: 'ST-2024-002', name: 'Charlie Brown', fatherName: 'David Brown', grade: 'Grade 10', section: 'A', rollNo: '102', contact: '555-0102' },
      { id: 'ST-2024-003', name: 'Eva Green', fatherName: 'Frank Green', grade: 'Grade 9', section: 'B', rollNo: '201', contact: '555-0103' },
    ];
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  }
};

seedData();

export const storage = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  saveUser: (user: User) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  deleteUser: (id: string) => {
    const users = storage.getUsers().filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  
  getStudents: (): Student[] => JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]'),
  saveStudent: (student: Student) => {
    const students = storage.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index >= 0) students[index] = student;
    else students.push(student);
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },
  deleteStudent: (id: string) => {
    const students = storage.getStudents().filter(s => s.id !== id);
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },

  getAttendance: (): AttendanceRecord[] => JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || '[]'),
  markAttendance: (record: AttendanceRecord) => {
    const records = storage.getAttendance();
    // Remove existing record for same day if exists (update)
    const filtered = records.filter(r => !(r.studentId === record.studentId && r.date === record.date));
    filtered.push(record);
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(filtered));
  },

  getGrades: (): Grade[] => {
      const stored = localStorage.getItem(KEYS.GRADES);
      let grades: Grade[] = stored ? JSON.parse(stored) : [];
      
      if (grades.length === 0) {
          // Fallback to ensure UI always has grades if none exist
          grades = getDefaultGrades();
          localStorage.setItem(KEYS.GRADES, JSON.stringify(grades));
      }
      return grades;
  },
  saveGrade: (grade: Grade) => {
    const grades = storage.getGrades();
    const index = grades.findIndex(g => g.id === grade.id);
    if (index >= 0) grades[index] = grade;
    else grades.push(grade);
    localStorage.setItem(KEYS.GRADES, JSON.stringify(grades));
  },
  deleteGrade: (id: string) => {
    const grades = storage.getGrades().filter(g => g.id !== id);
    localStorage.setItem(KEYS.GRADES, JSON.stringify(grades));
  },

  login: (email: string, role: UserRole): User | null => {
    const users = storage.getUsers();
    // In a real app, check password. Here just mocked.
    return users.find(u => u.email === email && u.role === role) || null;
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
  },

  setSession: (user: User) => localStorage.setItem(KEYS.SESSION, JSON.stringify(user)),
  logout: () => localStorage.removeItem(KEYS.SESSION)
};