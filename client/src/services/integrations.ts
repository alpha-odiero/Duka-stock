import { api } from '@/lib/api';
import type { ApiIntegration } from '@/types';

export interface IntegrationInput {
  provider: string;
  label: string;
  description?: string | null;
  credential?: string | null;
  config?: Record<string, unknown> | null;
}

export const integrationService = {
  async list(): Promise<ApiIntegration[]> {
    const res = await api.get('/integrations');
    return res.data.data.integrations;
  },
  async connect(input: IntegrationInput): Promise<ApiIntegration> {
    const res = await api.post('/integrations', input);
    return res.data.data.integration;
  },
  async update(id: string, input: Partial<IntegrationInput>): Promise<ApiIntegration> {
    const res = await api.patch(`/integrations/${id}`, input);
    return res.data.data.integration;
  },
  async disconnect(id: string): Promise<ApiIntegration> {
    const res = await api.post(`/integrations/${id}/disconnect`);
    return res.data.data.integration;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/integrations/${id}`);
  },
};
