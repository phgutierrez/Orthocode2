import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'orthocode_users';
const CURRENT_USER_KEY = 'orthocode_current_user';

interface StoredUser extends User {
  password: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const currentUser = JSON.parse(stored);
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsers = (): StoredUser[] => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    
    if (!found) {
      throw new Error('Email ou senha inválidos');
    }

    const { password: _, ...userWithoutPassword } = found;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  };

  const signup = async (name: string, email: string, password: string) => {
    // Validar senha
    if (password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }
    if (!/[a-zA-Z]/.test(password)) {
      throw new Error('Senha deve conter pelo menos uma letra');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Senha deve conter pelo menos um número');
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      throw new Error('Este email já está registrado');
    }

    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
