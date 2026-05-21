import api from '@/lib/api';
import { Task } from '@/types';

export interface TaskRequestPayload {
  title: string;
  description: string;
  classroomId: number;
  deadline: string;
}

export const taskService = {
  create: async (payload: TaskRequestPayload): Promise<Task> => {
    const { data } = await api.post('/tasks', payload);
    return data;
  },

  getByClassroom: async (classroomId: number): Promise<Task[]> => {
    const { data } = await api.get(`/tasks/classroom/${classroomId}`);
    return data;
  },

  getById: async (taskId: number): Promise<Task> => {
    const { data } = await api.get(`/tasks/${taskId}`);
    return data;
  }
};
