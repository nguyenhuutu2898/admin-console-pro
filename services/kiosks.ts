import { mockApi } from './mock-api';
import { Kiosk, PageResp, Paging, Search, KioskFilter } from '../types';

// Combine all query parameters
type KiosksQuery = Paging & Search & KioskFilter;

export const kiosksApi = {
  // GET /kiosks
  getKiosks: async (params: KiosksQuery = {}): Promise<PageResp<Kiosk>> => {
    return await mockApi.getKiosks(params);
  },

  // POST /kiosks
  createKiosk: async (data: Omit<Kiosk, 'id'>): Promise<Kiosk> => {
    return await mockApi.createKiosk(data);
  },

  // GET /kiosks/:id
  getKiosk: async (id: string): Promise<Kiosk> => {
    const kiosks = await mockApi.getKiosks({});
    const kiosk = kiosks.items.find(k => k.id === id);
    if (!kiosk) throw new Error('Kiosk not found');
    return kiosk;
  },

  // PUT /kiosks/:id
  updateKiosk: async (id: string, data: Partial<Kiosk>): Promise<Kiosk> => {
    return await mockApi.updateKiosk(id, data);
  },

  // DELETE /kiosks/:id
  deleteKiosk: async (id: string): Promise<void> => {
    await mockApi.deleteKiosk(id);
  },

  // POST /kiosks/:id/connect-code
  generateConnectCode: async (id: string): Promise<{ code: string; expiresIn: number }> => {
    return await mockApi.generateConnectCode(id);
  },
};
