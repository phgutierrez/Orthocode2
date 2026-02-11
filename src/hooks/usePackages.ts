import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { ProcedurePackage } from '@/types/package';

async function fetchPackages(userId: string) {
  const { data, error } = await supabase
    .from('packages')
    .select('id, name, description, created_at, updated_at, package_procedures(procedure_code)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((pkg: any) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description ?? undefined,
    procedureIds: pkg.package_procedures?.map((p: any) => p.procedure_code) || [],
    createdAt: pkg.created_at,
    updatedAt: pkg.updated_at,
  })) as ProcedurePackage[];
}

export function usePackages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['packages', user?.id];

  const { data, isLoading } = useQuery<ProcedurePackage[]>({
    queryKey,
    queryFn: () => fetchPackages(user!.id),
    enabled: Boolean(user?.id),
  });

  const addMutation = useMutation({
    mutationFn: async (payload: Omit<ProcedurePackage, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: pkgData, error: pkgError } = await supabase
        .from('packages')
        .insert([
          {
            user_id: user!.id,
            name: payload.name,
            description: payload.description ?? null,
          },
        ])
        .select()
        .single();

      if (pkgError) throw pkgError;

      if (payload.procedureIds && payload.procedureIds.length > 0) {
        const { error: procError } = await supabase
          .from('package_procedures')
          .insert(
            payload.procedureIds.map((code) => ({
              package_id: pkgData.id,
              procedure_code: code,
            }))
          );

        if (procError) {
          console.error('Erro ao adicionar procedimentos ao pacote:', procError);
        }
      }

      return {
        id: pkgData.id,
        name: pkgData.name,
        description: pkgData.description ?? payload.description ?? undefined,
        procedureIds: payload.procedureIds || [],
        createdAt: pkgData.created_at,
        updatedAt: pkgData.updated_at,
      } as ProcedurePackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<ProcedurePackage, 'id' | 'createdAt'>> }) => {
      const updateData: { name?: string; description?: string; updated_at: string } = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;

      const { error: updateError } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user!.id);

      if (updateError) throw updateError;

      if (data.procedureIds) {
        await supabase.from('package_procedures').delete().eq('package_id', id);

        if (data.procedureIds.length > 0) {
          const { error: procError } = await supabase
            .from('package_procedures')
            .insert(
              data.procedureIds.map((code) => ({
                package_id: id,
                procedure_code: code,
              }))
            );

          if (procError) {
            console.error('Erro ao atualizar procedimentos do pacote:', procError);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const addPackage = useCallback(
    async (payload: Omit<ProcedurePackage, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) return null;
      return addMutation.mutateAsync(payload);
    },
    [addMutation, user?.id]
  );

  const updatePackage = useCallback(
    async (id: string, data: Partial<Omit<ProcedurePackage, 'id' | 'createdAt'>>) => {
      if (!user?.id) return;
      await updateMutation.mutateAsync({ id, data });
    },
    [updateMutation, user?.id]
  );

  const deletePackage = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation, user?.id]
  );

  const packages = data || [];
  const byId = useMemo(() => Object.fromEntries(packages.map((pkg) => [pkg.id, pkg])), [packages]);

  return {
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    byId,
    loading: isLoading,
  };
}
