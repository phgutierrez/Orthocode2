import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário ao montar e escutar mudanças de sessão
  useEffect(() => {
    let isMounted = true;

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!isMounted) return;

        if (session?.user) {
          const name = session.user.user_metadata?.name || '';
          const email = session.user.email || '';

          // Definir usuário imediatamente
          if (isMounted) {
            setUser({
              id: session.user.id,
              email,
              name,
            });
          }

          // Buscar perfil do usuário
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && profile && isMounted) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
            });
          } else if (error?.code === 'PGRST116' && isMounted) {
            // Perfil não existe, criar
            await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email,
                name,
              });
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        // Sempre finalizar loading após processar sessão
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const name = data.user.user_metadata?.name || '';
        const email = data.user.email || '';

        // Definir usuário imediatamente
        setUser({
          id: data.user.id,
          email,
          name,
        });

        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
          });
        } else {
          await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email,
              name,
            });
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
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

      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        // Supabase retorna erro se email já existe
        if (error.message.includes('already registered')) {
          throw new Error('Este email já está registrado');
        }
        throw error;
      }

      if (data.user) {
        // Criar perfil do usuário na tabela 'users'
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name,
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
        }

        setUser({
          id: data.user.id,
          email: data.user.email,
          name,
        });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer logout');
    }
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
