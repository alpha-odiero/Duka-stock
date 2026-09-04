import { api } from '@/lib/api';
import type { Register, Shop, User } from '@/types';

export interface AuthData {
  user: User;
  shop?: Shop | null;
  register?: Register | null;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  shopName: string;
  shopLocation?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthData> {
    const res = await api.post('/auth/register', input);
    return res.data.data;
  },

  async login(input: LoginInput): Promise<AuthData> {
    const res = await api.post('/auth/login', input);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async me(): Promise<AuthData> {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  async updateProfile(input: { fullName: string; phone?: string }): Promise<User> {
    const res = await api.patch('/auth/profile', input);
    return res.data.data.user;
  },

  async changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.patch('/auth/password', input);
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/auth/account');
  },
};
