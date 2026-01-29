import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { ProcedurePackage } from '@/types/package';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export function usePackages() {
  const { user } = useAuth();
  const PACKAGES_KEY = user ? `orthocode_packages_${user.id}` : 'orthocode_packages_guest';

  const [packages, setPackages] = useState<ProcedurePackage[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PACKAGES_KEY);
      if (stored) {
        setPackages(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  }, [PACKAGES_KEY]);

  const persist = useCallback((nextPackages: ProcedurePackage[]) => {
    try {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(nextPackages));
      setPackages(nextPackages);
    } catch (error) {
      console.error('Error saving packages:', error);
    }
  }, [PACKAGES_KEY]);

  const addPackage = useCallback((data: Omit<ProcedurePackage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPackage: ProcedurePackage = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    persist([newPackage, ...packages]);
    return newPackage;
  }, [packages, persist]);

  const updatePackage = useCallback((id: string, data: Partial<Omit<ProcedurePackage, 'id' | 'createdAt'>>) => {
    const next = packages.map((pkg) => {
      if (pkg.id !== id) return pkg;
      return {
        ...pkg,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    });
    persist(next);
  }, [packages, persist]);

  const deletePackage = useCallback((id: string) => {
    persist(packages.filter(pkg => pkg.id !== id));
  }, [packages, persist]);

  const byId = useMemo(() => {
    return Object.fromEntries(packages.map(pkg => [pkg.id, pkg]));
  }, [packages]);

  return {
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    byId,
  };
}
