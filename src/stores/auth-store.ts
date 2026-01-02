import { create } from 'zustand';
import { UserRole } from '@prisma/client';

interface AuthState {
  user: {
    id: string;
    email: string;
    role: UserRole;
  } | null;
  isLoading: boolean;
  
  // Actions
  setUser: (user: AuthState['user']) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  
  setUser: (user) => set({ user }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  logout: () => set({ user: null }),
}));

