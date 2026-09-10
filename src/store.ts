import { Mentor, Student, Course, Assignment, AppUser } from './types';

const KEYS = {
  MENTORS: 'vox_mentors',
  STUDENTS: 'vox_students',
  COURSES: 'vox_courses',
  ASSIGNMENTS: 'vox_assignments',
  CURRENT_USER: 'vox_current_user',
  SMS_CODES: 'vox_sms_codes',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ===== AUTH =====
export function getCurrentUser(): AppUser | null {
  return get<AppUser | null>(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: AppUser | null) {
  if (user) set(KEYS.CURRENT_USER, user);
  else localStorage.removeItem(KEYS.CURRENT_USER);
}

// ===== MENTORS =====
export function getMentors(): Mentor[] {
  return get<Mentor[]>(KEYS.MENTORS, []);
}

export function findMentorByPhone(phone: string): Mentor | undefined {
  return getMentors().find(m => m.phone === phone);
}

export function registerMentor(data: Omit<Mentor, 'id' | 'classCode' | 'createdAt'>): { ok: boolean; error?: string; mentor?: Mentor } {
  const mentors = getMentors();
  if (mentors.find(m => m.phone === data.phone)) {
    return { ok: false, error: 'Этот телефон уже зарегистрирован' };
  }
  const mentor: Mentor = {
    ...data,
    id: generateId(),
    classCode: generateClassCode(),
    createdAt: new Date().toISOString(),
  };
  mentors.push(mentor);
  set(KEYS.MENTORS, mentors);
  return { ok: true, mentor };
}

export function loginMentor(phone: string, password: string): { ok: boolean; error?: string; mentor?: Mentor } {
  const mentor = findMentorByPhone(phone);
  if (!mentor) return { ok: false, error: 'Пользователь не найден' };
  if (mentor.password !== password) return { ok: false, error: 'Неверный пароль' };
  return { ok: true, mentor };
}

// ===== SMS =====
export function sendSmsCode(phone: string): string {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const codes = get<Record<string, { code: string; expires: number }>>(KEYS.SMS_CODES, {});
  codes[phone] = { code, expires: Date.now() + 5 * 60 * 1000 };
  set(KEYS.SMS_CODES, codes);
  return code; // In real app this goes via SMS API
}

export function verifySmsCode(phone: string, code: string): boolean {
  const codes = get<Record<string, { code: string; expires: number }>>(KEYS.SMS_CODES, {});
  const entry = codes[phone];
  if (!entry) return false;
  if (Date.now() > entry.expires) return false;
  return entry.code === code;
}

export function resetPassword(phone: string, newPassword: string): { ok: boolean; error?: string } {
  const mentors = getMentors();
  const idx = mentors.findIndex(m => m.phone === phone);
  if (idx === -1) return { ok: false, error: 'Телефон не найден' };
  mentors[idx].password = newPassword;
  set(KEYS.MENTORS, mentors);
  return { ok: true };
}

// ===== STUDENTS =====
export function getStudents(): Student[] {
  return get<Student[]>(KEYS.STUDENTS, []);
}

export function getStudentsByClass(classCode: string): Student[] {
  return getStudents().filter(s => s.classCode === classCode);
}

export function findMentorByClassCode(classCode: string): Mentor | undefined {
  return getMentors().find(m => m.classCode === classCode.toUpperCase());
}

export function registerStudent(classCode: string, lastName: string, password: string, parentFullName: string, parentPhone: string): { ok: boolean; error?: string; student?: Student } {
  const mentor = findMentorByClassCode(classCode);
  if (!mentor) return { ok: false, error: 'Класс с таким кодом не найден' };

  const students = getStudentsByClass(classCode);
  const sameLastName = students.filter(s => s.lastName.toLowerCase() === lastName.toLowerCase());
  const loginName = sameLastName.length > 0
    ? `${lastName}${sameLastName.length + 1}`
    : lastName;

  if (students.find(s => s.loginName === loginName)) {
    return { ok: false, error: 'Такой логин уже существует' };
  }

  const allStudents = getStudents();
  const student: Student = {
    id: generateId(),
    classCode: classCode.toUpperCase(),
    lastName,
    loginName,
    password,
    parentFullName,
    parentPhone,
    createdAt: new Date().toISOString(),
    attendance: [],
    grades: [],
    rating: 0,
  };
  allStudents.push(student);
  set(KEYS.STUDENTS, allStudents);
  return { ok: true, student };
}

export function loginStudent(loginName: string, password: string): { ok: boolean; error?: string; student?: Student } {
  const student = getStudents().find(s => s.loginName.toLowerCase() === loginName.toLowerCase());
  if (!student) return { ok: false, error: 'Ученик не найден' };
  if (student.password !== password) return { ok: false, error: 'Неверный пароль' };
  return { ok: true, student };
}

export function updateStudent(student: Student) {
  const all = getStudents();
  const idx = all.findIndex(s => s.id === student.id);
  if (idx !== -1) {
    all[idx] = student;
    set(KEYS.STUDENTS, all);
  }
}

// ===== COURSES =====
export function getCourses(): Course[] {
  return get<Course[]>(KEYS.COURSES, []);
}

export function getCoursesByMentor(mentorId: string): Course[] {
  return getCourses().filter(c => c.mentorId === mentorId);
}

export function saveCourse(course: Course) {
  const courses = getCourses();
  const idx = courses.findIndex(c => c.id === course.id);
  if (idx !== -1) courses[idx] = course;
  else courses.push(course);
  set(KEYS.COURSES, courses);
}

export function deleteCourse(courseId: string) {
  const courses = getCourses().filter(c => c.id !== courseId);
  set(KEYS.COURSES, courses);
}

// ===== ASSIGNMENTS =====
export function getAssignments(): Assignment[] {
  return get<Assignment[]>(KEYS.ASSIGNMENTS, []);
}

export function getAssignmentsByMentor(mentorId: string): Assignment[] {
  return getAssignments().filter(a => a.mentorId === mentorId);
}

export function getAssignmentsForStudent(studentId: string, classCode: string): Assignment[] {
  return getAssignments().filter(a =>
    (a.targetType === 'group' && a.targetIds.includes(classCode)) ||
    (a.targetType === 'student' && a.targetIds.includes(studentId))
  );
}

export function saveAssignment(assignment: Assignment) {
  const assignments = getAssignments();
  const idx = assignments.findIndex(a => a.id === assignment.id);
  if (idx !== -1) assignments[idx] = assignment;
  else assignments.push(assignment);
  set(KEYS.ASSIGNMENTS, assignments);
}

export function deleteAssignment(id: string) {
  set(KEYS.ASSIGNMENTS, getAssignments().filter(a => a.id !== id));
}

// ===== ATTENDANCE =====
export function markAttendance(studentId: string, date: string, present: boolean, note?: string) {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return;
  const existing = student.attendance.findIndex(a => a.date === date);
  if (existing !== -1) {
    student.attendance[existing] = { date, present, note };
  } else {
    student.attendance.push({ date, present, note });
  }
  set(KEYS.STUDENTS, students);
}

export function addGrade(studentId: string, courseName: string, grade: number, comment?: string) {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return;
  student.grades.push({
    date: new Date().toISOString().split('T')[0],
    courseName,
    grade,
    comment,
  });
  // Recalculate rating
  const allGrades = student.grades.map(g => g.grade);
  student.rating = allGrades.length > 0
    ? Math.round((allGrades.reduce((a, b) => a + b, 0) / allGrades.length) * 10) / 10
    : 0;
  set(KEYS.STUDENTS, students);
}

export function getStudentRating(studentId: string): number {
  const student = getStudents().find(s => s.id === studentId);
  return student?.rating ?? 0;
}
