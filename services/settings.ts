import { mockApi } from './mock-api';

export const settingsApi = {
  // GET /settings
  getSettings: async (): Promise<Record<string, any>> => {
    return await mockApi.getSettings();
  },

  // PUT /settings
  updateSettings: async (data: { key: string; value: unknown }[] | Record<string, any>): Promise<void> => {
    await mockApi.updateSettings(data);
  },
};
