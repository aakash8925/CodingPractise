import api from '@/lib/api';
import { Submission } from '@/types';

export interface SubmissionPayload {
  taskId: number;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  draft: boolean;
}

export interface GradePayload {
  marks: number;
  feedback: string;
}

export const submissionService = {
  submit: async (payload: SubmissionPayload): Promise<Submission> => {
    const { data } = await api.post('/submissions', payload);
    return data;
  },

  getMySubmission: async (taskId: number): Promise<Submission> => {
    const { data } = await api.get(`/submissions/task/${taskId}/my`);
    return data;
  },

  getByTask: async (taskId: number): Promise<Submission[]> => {
    const { data } = await api.get(`/submissions/task/${taskId}`);
    return data;
  },

  getById: async (id: number): Promise<Submission> => {
    const { data } = await api.get(`/submissions/${id}`);
    return data;
  },

  grade: async (id: number, payload: GradePayload): Promise<Submission> => {
    const { data } = await api.post(`/submissions/${id}/grade`, payload);
    return data;
  },

  getAll: async (): Promise<Submission[]> => {
    const { data } = await api.get('/submissions/all');
    return data;
  }
};
