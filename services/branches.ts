import { mockApi } from './mock-api';
import { Branch, PageResp, Paging, Search, LocationFilter } from '../types';

// Combine all query parameters
type BranchesQuery = Paging & Search & LocationFilter;

export const branchesApi = {
  // GET /branches
  getBranches: async (params: BranchesQuery = {}): Promise<PageResp<Branch>> => {
    return await mockApi.getBranches(params);
  },

  // POST /branches
  createBranch: async (data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Branch> => {
    return await mockApi.createBranch(data);
  },

  // GET /branches/:id
  getBranch: async (id: string): Promise<Branch> => {
    const branches = await mockApi.getBranches({});
    const branch = branches.items.find(b => b.id === id);
    if (!branch) throw new Error('Branch not found');
    return branch;
  },

  // PUT /branches/:id
  updateBranch: async (id: string, data: Partial<Branch>): Promise<Branch> => {
    return await mockApi.updateBranch(id, data);
  },

  // DELETE /branches/:id
  deleteBranch: async (id: string): Promise<void> => {
    await mockApi.deleteBranch(id);
  },
};
