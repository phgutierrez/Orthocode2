import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { ProcedurePackage } from '@/types/package';

export function usePackages() {
  const { user, loading: authLoading } = useAuth();
  const [packages, setPackages] = useState<ProcedurePackage[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar pacotes do Supabase ao montar
  useEffect(() => {
    if (authLoading || !user?.id) return;

    const fetchPackages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar pacotes:', error);
          return;
        }

        // Carregar procedimentos de cada pacote
        const packagesWithProcedures = await Promise.all(
          (data || []).map(async (pkg) => {
            const { data: procedures, error: procError } = await supabase
              .from('package_procedures')
              .select('procedure_code')
              .eq('package_id', pkg.id);

            if (procError) {
              console.error('Erro ao carregar procedimentos do pacote:', procError);
              return {
                id: pkg.id,
                name: pkg.name,
                description: pkg.description ?? undefined,
                procedureIds: [],
                createdAt: pkg.created_at,
                updatedAt: pkg.updated_at,
              };
            }

            return {
              id: pkg.id,
              name: pkg.name,
              description: pkg.description ?? undefined,
              procedureIds: procedures?.map(p => p.procedure_code) || [],
              createdAt: pkg.created_at,
              updatedAt: pkg.updated_at,
            };
          })
        );

        setPackages(packagesWithProcedures);
      } catch (error) {
        console.error('Erro ao carregar pacotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [user?.id, authLoading]);

  const addPackage = useCallback(async (data: Omit<ProcedurePackage, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return null;

    try {
      const { data: pkgData, error: pkgError } = await supabase
        .from('packages')
        .insert([
          {
            user_id: user.id,
            name: data.name,
            description: data.description ?? null,
          },
        ])
        .select()
        .single();

      if (pkgError) {
        console.error('Erro ao criar pacote:', pkgError);
        throw pkgError;
      }

      // Adicionar procedimentos
      if (data.procedureIds && data.procedureIds.length > 0) {
        const { error: procError } = await supabase
          .from('package_procedures')
          .insert(
            data.procedureIds.map(code => ({
              package_id: pkgData.id,
              procedure_code: code,
            }))
          );

        if (procError) {
          console.error('Erro ao adicionar procedimentos ao pacote:', procError);
        }
      }

      const newPackage: ProcedurePackage = {
        id: pkgData.id,
        name: pkgData.name,
        description: pkgData.description ?? data.description ?? undefined,
        procedureIds: data.procedureIds || [],
        createdAt: pkgData.created_at,
        updatedAt: pkgData.updated_at,
      };

      setPackages(prev => [newPackage, ...prev]);
      return newPackage;
    } catch (error) {
      console.error('Erro ao criar pacote:', error);
      throw error;
    }
  }, [user?.id]);

  const updatePackage = useCallback(async (id: string, data: Partial<Omit<ProcedurePackage, 'id' | 'createdAt'>>) => {
    if (!user?.id) return;

    try {
      const updateData: { name?: string; description?: string; updated_at: string } = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (data.description !== undefined) {
        updateData.description = data.description;
      }

      const { error: updateError } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar pacote:', updateError);
        throw updateError;
      }

      // Atualizar procedimentos se fornecidos
      if (data.procedureIds) {
        // Deletar procedimentos antigos
        await supabase
          .from('package_procedures')
          .delete()
          .eq('package_id', id);

        // Inserir novos procedimentos
        if (data.procedureIds.length > 0) {
          const { error: procError } = await supabase
            .from('package_procedures')
            .insert(
              data.procedureIds.map(code => ({
                package_id: id,
                procedure_code: code,
              }))
            );

          if (procError) {
            console.error('Erro ao atualizar procedimentos do pacote:', procError);
          }
        }
      }

      setPackages(prev =>
        prev.map(pkg =>
          pkg.id === id
            ? {
                ...pkg,
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.procedureIds ? { procedureIds: data.procedureIds } : {}),
                updatedAt: new Date().toISOString(),
              }
            : pkg
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error);
      throw error;
    }
  }, [user?.id]);

  const deletePackage = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar pacote:', error);
        return;
      }

      setPackages(prev => prev.filter(pkg => pkg.id !== id));
    } catch (error) {
      console.error('Erro ao deletar pacote:', error);
    }
  }, [user?.id]);

  const byId = useMemo(() => {
    return Object.fromEntries(packages.map(pkg => [pkg.id, pkg]));
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
