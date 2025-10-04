import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';
import { UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// Default user for testing
const defaultUser: User = {
  id: '1',
  username: 'admin',
  fullName: 'Nguyễn Văn Admin',
  email: 'admin@example.com',
  branchId: '1',
  branchName: 'Chi nhánh Hà Nội',
  role: UserRole.SUPER_ADMIN,
  permissions: ['all'],
  status: 'active',
  lastLogin: '2024-01-15T10:30:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: defaultUser, // Set default user for testing
      token: 'mock-token-123',
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      // đảm bảo dùng localStorage phía client (an toàn cho SSR nếu có)
      storage: createJSONStorage(() => localStorage),
      // optional: chỉ lưu 1 phần state
      // partialize: (s) => ({ token: s.token, user: s.user }),
      // Clear old data if version mismatch
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Clear old data and use default user
          return { user: defaultUser, token: 'mock-token-123' };
        }
        return persistedState;
      },
    }
  )
);
