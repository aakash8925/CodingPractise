import api from '@/lib/api';
import { Classroom, User } from '@/types';

export const classroomService = {
  create: async (name: string): Promise<Classroom> => {
    const { data } = await api.post('/classrooms', { name });
    return data;
  },

  getAll: async (): Promise<Classroom[]> => {
    const { data } = await api.get('/classrooms/all');
    return data;
  },

  getMyClassrooms: async (): Promise<Classroom[]> => {
    const { data } = await api.get('/classrooms');
    return data;
  },

  getById: async (id: number): Promise<Classroom> => {
    const { data } = await api.get(`/classrooms/${id}`);
    return data;
  },

  join: async (id: number): Promise<Classroom> => {
    const { data } = await api.post(`/classrooms/${id}/join`);
    return data;
  },

  getStudents: async (id: number): Promise<User[]> => {
    const { data } = await api.get(`/classrooms/${id}/students`);
    return data;
  }
};
