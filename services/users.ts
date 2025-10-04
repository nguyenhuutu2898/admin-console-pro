import { mockApi } from './mock-api';
import { User, PageResp, Paging, Search, UserFilter } from '../types';

// Combine all query parameters
type UsersQuery = Paging & Search & UserFilter;

export const usersApi = {
  // GET /users
  getUsers: async (params: UsersQuery = {}): Promise<PageResp<User>> => {
    return await mockApi.getUsers(params);
  },

  // POST /users
  createUser: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    return await mockApi.createUser(data);
  },

  // GET /users/:id
  getUser: async (id: string): Promise<User> => {
    const users = await mockApi.getUsers({});
    const user = users.items.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  // PUT /users/:id
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    return await mockApi.updateUser(id, data);
  },

  // DELETE /users/:id
  deleteUser: async (id: string): Promise<void> => {
    await mockApi.deleteUser(id);
  },

  // POST /users/:id/reset-password
  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await mockApi.resetPassword(id, newPassword);
  },
};
