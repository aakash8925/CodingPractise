export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Classroom {
  id: number;
  name: string;
  teacher: User;
  createdAt: string;
  studentCount: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  classroomId: number;
  classroomName: string;
  createdBy: User;
  deadline: string;
  createdAt: string;
}

export type SubmissionStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'LATE';

export interface Submission {
  id: number;
  taskId: number;
  taskTitle: string;
  student: User;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  status: SubmissionStatus;
  marks?: number;
  feedback?: string;
  submittedAt?: string;
  updatedAt: string;
}
