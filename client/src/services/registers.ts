import { api } from '@/lib/api';
import type { Register, RegisterStatus } from '@/types';

export interface CreateRegisterInput {
  name: string;
  status?: RegisterStatus;
  assignedUserId?: string | null;
}

export interface UpdateRegisterInput {
  name?: string;
  status?: RegisterStatus;
  assignedUserId?: string | null;
}

export const registerService = {
  async list(): Promise<Register[]> {
    const res = await api.get('/registers');
    return res.data.data.registers;
  },
  async create(input: CreateRegisterInput): Promise<Register> {
    const res = await api.post('/registers', input);
    return res.data.data.register;
  },
  async update(id: string, input: UpdateRegisterInput): Promise<Register> {
    const res = await api.patch(`/registers/${id}`, input);
    return res.data.data.register;
  },
};
