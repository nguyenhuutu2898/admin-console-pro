import { mockApi } from './mock-api';
import { Advertisement, PageResp, Paging, Search, AdFilter } from '../types';

// Combine all query parameters
type AdsQuery = Paging & Search & AdFilter;

export const adsApi = {
  // GET /ads
  getAds: async (params: AdsQuery = {}): Promise<PageResp<Advertisement>> => {
    return await mockApi.getAds(params);
  },

  // POST /ads
  createAd: async (data: Omit<Advertisement, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'targetBranchNames'>): Promise<Advertisement> => {
    return await mockApi.createAd(data);
  },

  // GET /ads/:id
  getAd: async (id: string): Promise<Advertisement> => {
    const ads = await mockApi.getAds({});
    const ad = ads.items.find(a => a.id === id);
    if (!ad) throw new Error('Advertisement not found');
    return ad;
  },

  // PUT /ads/:id
  updateAd: async (id: string, data: Partial<Advertisement>): Promise<Advertisement> => {
    return await mockApi.updateAd(id, data);
  },

  // DELETE /ads/:id
  deleteAd: async (id: string): Promise<void> => {
    await mockApi.deleteAd(id);
  },
};
