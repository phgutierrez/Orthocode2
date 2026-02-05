-- SQL para executar no Supabase SQL Editor
-- Adiciona política para permitir que usuários autenticados vejam outros usuários

-- Verificar se RLS está habilitado na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem conflitar
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can only view themselves" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all users" ON public.users;

-- Criar política para permitir que usuários autenticados vejam todos os usuários
-- Isso é necessário para a funcionalidade de compartilhamento funcionar
CREATE POLICY "Authenticated users can view all users"
ON public.users FOR SELECT
TO authenticated
USING (true);
