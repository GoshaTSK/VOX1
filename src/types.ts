export type UserRole = 'mentor' | 'student';

export interface Mentor {
  id: string;
  fullName: string;
  organization: string;
  position: string;
  city: string;
  phone: string;
  password: string;
  classCode: string;
  createdAt: string;
}

export interface Student {
  id: string;
  classCode: string;
  lastName: string;
  loginName: string; // фамилия + цифра
  password: string;
  parentFullName: string;
  parentPhone: string;
  createdAt: string;
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  rating: number;
}

export interface AttendanceRecord {
  date: string;
  present: boolean;
  note?: string;
}

export interface GradeRecord {
  date: string;
  courseName: string;
  grade: number; // 1-5
  comment?: string;
}

export interface Course {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  level: string;
  duration: string;
  color: string;
  lessons: Lesson[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Assignment {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  courseName: string;
  targetIds: string[]; // student IDs or class code for group
  targetType: 'student' | 'group';
  deadline: string;
  createdAt: string;
  submissions: Submission[];
}

export interface Submission {
  studentId: string;
  submittedAt: string;
  content: string;
  grade?: number;
}

export interface AppUser {
  role: UserRole;
  id: string;
}
