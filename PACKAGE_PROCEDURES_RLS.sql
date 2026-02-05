-- Permitir que usuários vejam package_procedures de pacotes compartilhados
-- Execute este SQL no Supabase SQL Editor

CREATE POLICY "Users can view package_procedures of shared packages"
ON public.package_procedures FOR SELECT
TO authenticated
USING (
  package_id IN (
    SELECT package_id FROM public.shared_packages 
    WHERE to_user_id = auth.uid()
  )
);
