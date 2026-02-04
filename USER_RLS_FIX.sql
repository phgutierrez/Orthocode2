-- SQL para executar no Supabase SQL Editor
-- Adiciona política para permitir que usuários autenticados vejam outros usuários

-- Verificar se RLS está habilitado na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam todos os usuários
CREATE POLICY "Authenticated users can view all users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Se já existe uma política conflitante, remova primeiro com:
-- DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
-- DROP POLICY IF EXISTS "Users can only view themselves" ON public.users;
