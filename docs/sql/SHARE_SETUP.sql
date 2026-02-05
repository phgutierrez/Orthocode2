-- SQL para executar no Supabase SQL Editor

-- Tabela de compartilhamentos
CREATE TABLE IF NOT EXISTS public.shared_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending', -- pending, accepted, rejected
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL, -- package_share, etc
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS para shared_packages
ALTER TABLE public.shared_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares they sent or received"
ON public.shared_packages FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create shares"
ON public.shared_packages FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update shares they received"
ON public.shared_packages FOR UPDATE
USING (auth.uid() = to_user_id);

CREATE POLICY "Users can delete shares they sent"
ON public.shared_packages FOR DELETE
USING (auth.uid() = from_user_id);

-- RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications for others"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_shared_packages_to_user ON public.shared_packages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_packages_from_user ON public.shared_packages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
