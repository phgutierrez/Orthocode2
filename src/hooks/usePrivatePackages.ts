import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { PrivatePackage } from '@/types/package';

export function usePrivatePackages() {
  const { user, loading: authLoading } = useAuth();
  const [packages, setPackages] = useState<PrivatePackage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const fetchPackages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('private_packages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar pacotes particulares:', error);
          return;
        }

        const packagesWithDetails = await Promise.all(
          (data || []).map(async (pkg) => {
            const { data: procedures, error: procError } = await supabase
              .from('private_package_procedures')
              .select('procedure_code')
              .eq('private_package_id', pkg.id);

            if (procError) {
              console.error('Erro ao carregar procedimentos do pacote particular:', procError);
            }

            const { data: opmes, error: opmeError } = await supabase
              .from('private_package_opmes')
              .select('opme_id')
              .eq('private_package_id', pkg.id);

            if (opmeError) {
              console.error('Erro ao carregar OPMEs do pacote particular:', opmeError);
            }

            return {
              id: pkg.id,
              name: pkg.name,
              description: pkg.description ?? undefined,
              procedureIds: procedures?.map((p) => p.procedure_code) || [],
              opmeIds: opmes?.map((o) => o.opme_id) || [],
              surgeonValue: pkg.surgeon_value ?? 0,
              anesthetistValue: pkg.anesthetist_value ?? 0,
              assistantValue: pkg.assistant_value ?? 0,
              createdAt: pkg.created_at,
              updatedAt: pkg.updated_at,
            };
          })
        );

        setPackages(packagesWithDetails);
      } catch (error) {
        console.error('Erro ao carregar pacotes particulares:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [user?.id, authLoading]);

  const addPackage = useCallback(
    async (data: Omit<PrivatePackage, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) return null;

      try {
        const { data: pkgData, error: pkgError } = await supabase
          .from('private_packages')
          .insert([
            {
              user_id: user.id,
              name: data.name,
              description: data.description ?? null,
              surgeon_value: data.surgeonValue ?? 0,
              anesthetist_value: data.anesthetistValue ?? 0,
              assistant_value: data.assistantValue ?? 0,
            },
          ])
          .select()
          .single();

        if (pkgError) {
          console.error('Erro ao criar pacote particular:', pkgError);
          throw pkgError;
        }

        if (data.procedureIds && data.procedureIds.length > 0) {
          const { error: procError } = await supabase
            .from('private_package_procedures')
            .insert(
              data.procedureIds.map((code) => ({
                private_package_id: pkgData.id,
                procedure_code: code,
              }))
            );

          if (procError) {
            console.error('Erro ao adicionar procedimentos ao pacote particular:', procError);
          }
        }

        if (data.opmeIds && data.opmeIds.length > 0) {
          const { error: opmeError } = await supabase
            .from('private_package_opmes')
            .insert(
              data.opmeIds.map((opmeId) => ({
                private_package_id: pkgData.id,
                opme_id: opmeId,
              }))
            );

          if (opmeError) {
            console.error('Erro ao adicionar OPMEs ao pacote particular:', opmeError);
          }
        }

        const newPackage: PrivatePackage = {
          id: pkgData.id,
          name: pkgData.name,
          description: pkgData.description ?? data.description ?? undefined,
          procedureIds: data.procedureIds || [],
          opmeIds: data.opmeIds || [],
          surgeonValue: pkgData.surgeon_value ?? data.surgeonValue ?? 0,
          anesthetistValue: pkgData.anesthetist_value ?? data.anesthetistValue ?? 0,
          assistantValue: pkgData.assistant_value ?? data.assistantValue ?? 0,
          createdAt: pkgData.created_at,
          updatedAt: pkgData.updated_at,
        };

        setPackages((prev) => [newPackage, ...prev]);
        return newPackage;
      } catch (error) {
        console.error('Erro ao criar pacote particular:', error);
        throw error;
      }
    },
    [user?.id]
  );

  const updatePackage = useCallback(
    async (id: string, data: Partial<Omit<PrivatePackage, 'id' | 'createdAt'>>) => {
      if (!user?.id) return;

      try {
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
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Erro ao atualizar pacote particular:', updateError);
          throw updateError;
        }

        if (data.procedureIds) {
          await supabase
            .from('private_package_procedures')
            .delete()
            .eq('private_package_id', id);

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
          await supabase
            .from('private_package_opmes')
            .delete()
            .eq('private_package_id', id);

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

        setPackages((prev) =>
          prev.map((pkg) =>
            pkg.id === id
              ? {
                  ...pkg,
                  ...(data.name !== undefined ? { name: data.name } : {}),
                  ...(data.description !== undefined ? { description: data.description ?? undefined } : {}),
                  ...(data.procedureIds ? { procedureIds: data.procedureIds } : {}),
                  ...(data.opmeIds ? { opmeIds: data.opmeIds } : {}),
                  ...(data.surgeonValue !== undefined ? { surgeonValue: data.surgeonValue } : {}),
                  ...(data.anesthetistValue !== undefined ? { anesthetistValue: data.anesthetistValue } : {}),
                  ...(data.assistantValue !== undefined ? { assistantValue: data.assistantValue } : {}),
                  updatedAt: new Date().toISOString(),
                }
              : pkg
          )
        );
      } catch (error) {
        console.error('Erro ao atualizar pacote particular:', error);
        throw error;
      }
    },
    [user?.id]
  );

  const deletePackage = useCallback(
    async (id: string) => {
      if (!user?.id) return;

      try {
        const { error } = await supabase
          .from('private_packages')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao deletar pacote particular:', error);
          return;
        }

        setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      } catch (error) {
        console.error('Erro ao deletar pacote particular:', error);
      }
    },
    [user?.id]
  );

  const byId = useMemo(() => {
    return Object.fromEntries(packages.map((pkg) => [pkg.id, pkg]));
  }, [packages]);

  return {
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    byId,
    loading,
  };
}
