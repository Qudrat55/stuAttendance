export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gradeAssigned?: string; // For teachers
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  grade: string;
  section: string;
  rollNo: string;
  contact: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE'
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO Date string YYYY-MM-DD
  timestamp: string;
  status: AttendanceStatus;
  markedBy: string;
}

export interface Grade {
  id: string;
  name: string; // e.g., "Grade 10"
  subjects: string[];
}