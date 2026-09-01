import { Student } from '../types';
import { INITIAL_STUDENTS } from '../data/initialData';

const STORAGE_KEY = 'student_performance_system_data_v1';
const ACTIVE_STUDENT_ID_KEY = 'student_performance_active_id_v1';
const USER_ROLE_KEY = 'student_performance_user_role_v1';

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored students, using initial data', e);
  }
  saveStudents(INITIAL_STUDENTS);
  return INITIAL_STUDENTS;
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage', e);
  }
}

export function getActiveStudentId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_STUDENT_ID_KEY);
    if (id) return id;
  } catch (e) {
    // ignore
  }
  return INITIAL_STUDENTS[0].id;
}

export function setActiveStudentId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_STUDENT_ID_KEY, id);
  } catch (e) {
    // ignore
  }
}

export function getUserRole(): 'student' | 'admin' | 'faculty' {
  try {
    const role = localStorage.getItem(USER_ROLE_KEY);
    if (role === 'student' || role === 'admin' || role === 'faculty') {
      return role;
    }
  } catch (e) {
    // ignore
  }
  return 'student';
}

export function setUserRole(role: 'student' | 'admin' | 'faculty'): void {
  try {
    localStorage.setItem(USER_ROLE_KEY, role);
  } catch (e) {
    // ignore
  }
}

export function resetToDefaultData(): Student[] {
  saveStudents(INITIAL_STUDENTS);
  setActiveStudentId(INITIAL_STUDENTS[0].id);
  return INITIAL_STUDENTS;
}

export const resetToInitialData = resetToDefaultData;
