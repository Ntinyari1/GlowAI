declare module '@/hooks/useAuth' {
  interface User {
    username: string;
    email: string;
    token: string;
  }

  export function useAuth(): {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    token: string;
  };
}
