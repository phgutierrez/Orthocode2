import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { PrivatePackage } from '@/types/package';

async function fetchPrivatePackages(userId: string) {
  const { data, error } = await supabase
    .from('private_packages')
    .select('id, name, description, surgeon_value, anesthetist_value, assistant_value, created_at, updated_at, private_package_procedures(procedure_code), private_package_opmes(opme_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((pkg: any) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    procedureIds: pkg.private_package_procedures?.map((p: any) => p.procedure_code) || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opmeIds: pkg.private_package_opmes?.map((o: any) => o.opme_id) || [],
    surgeonValue: pkg.surgeon_value ?? 0,
    anesthetistValue: pkg.anesthetist_value ?? 0,
    assistantValue: pkg.assistant_value ?? 0,
    createdAt: pkg.created_at,
    updatedAt: pkg.updated_at,
  })) as PrivatePackage[];
}

export function usePrivatePackages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['private-packages', user?.id];

  const { data, isLoading } = useQuery<PrivatePackage[]>({
    queryKey,
    queryFn: () => fetchPrivatePackages(user!.id),
    enabled: Boolean(user?.id),
  });

  const addMutation = useMutation({
    mutationFn: async (payload: Omit<PrivatePackage, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: pkgData, error: pkgError } = await supabase
        .from('private_packages')
        .insert([
          {
            user_id: user!.id,
            name: payload.name,
            description: payload.description ?? null,
            surgeon_value: payload.surgeonValue ?? 0,
            anesthetist_value: payload.anesthetistValue ?? 0,
            assistant_value: payload.assistantValue ?? 0,
          },
        ])
        .select()
        .single();

      if (pkgError) throw pkgError;

      if (payload.procedureIds && payload.procedureIds.length > 0) {
        const { error: procError } = await supabase
          .from('private_package_procedures')
          .insert(
            payload.procedureIds.map((code) => ({
              private_package_id: pkgData.id,
              procedure_code: code,
            }))
          );

        if (procError) {
          console.error('Erro ao adicionar procedimentos ao pacote particular:', procError);
        }
      }

      if (payload.opmeIds && payload.opmeIds.length > 0) {
        const { error: opmeError } = await supabase
          .from('private_package_opmes')
          .insert(
            payload.opmeIds.map((opmeId) => ({
              private_package_id: pkgData.id,
              opme_id: opmeId,
            }))
          );

        if (opmeError) {
          console.error('Erro ao adicionar OPMEs ao pacote particular:', opmeError);
        }
      }

      return {
        id: pkgData.id,
        name: pkgData.name,
        description: pkgData.description ?? payload.description ?? undefined,
        procedureIds: payload.procedureIds || [],
        opmeIds: payload.opmeIds || [],
        surgeonValue: pkgData.surgeon_value ?? payload.surgeonValue ?? 0,
        anesthetistValue: pkgData.anesthetist_value ?? payload.anesthetistValue ?? 0,
        assistantValue: pkgData.assistant_value ?? payload.assistantValue ?? 0,
        createdAt: pkgData.created_at,
        updatedAt: pkgData.updated_at,
      } as PrivatePackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<PrivatePackage, 'id' | 'createdAt'>> }) => {
      const updateData: {
        name?: string;
        description?: string | null;
        surgeon_value?: number;
        anesthetist_value?: number;
        assistant_value?: number;
        updated_at: string;
      } = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description ?? null;
      if (data.surgeonValue !== undefined) updateData.surgeon_value = data.surgeonValue;
      if (data.anesthetistValue !== undefined) updateData.anesthetist_value = data.anesthetistValue;
      if (data.assistantValue !== undefined) updateData.assistant_value = data.assistantValue;

      const { error: updateError } = await supabase
        .from('private_packages')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user!.id);

      if (updateError) throw updateError;

      if (data.procedureIds) {
        await supabase.from('private_package_procedures').delete().eq('private_package_id', id);

        if (data.procedureIds.length > 0) {
          const { error: procError } = await supabase
            .from('private_package_procedures')
            .insert(
              data.procedureIds.map((code) => ({
                private_package_id: id,
                procedure_code: code,
              }))
            );

          if (procError) {
            console.error('Erro ao atualizar procedimentos do pacote particular:', procError);
          }
        }
      }

      if (data.opmeIds) {
        await supabase.from('private_package_opmes').delete().eq('private_package_id', id);

        if (data.opmeIds.length > 0) {
          const { error: opmeError } = await supabase
            .from('private_package_opmes')
            .insert(
              data.opmeIds.map((opmeId) => ({
                private_package_id: id,
                opme_id: opmeId,
              }))
            );

          if (opmeError) {
            console.error('Erro ao atualizar OPMEs do pacote particular:', opmeError);
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
        .from('private_packages')
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
    async (payload: Omit<PrivatePackage, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) return null;
      return addMutation.mutateAsync(payload);
    },
    [addMutation, user?.id]
  );

  const updatePackage = useCallback(
    async (id: string, data: Partial<Omit<PrivatePackage, 'id' | 'createdAt'>>) => {
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
