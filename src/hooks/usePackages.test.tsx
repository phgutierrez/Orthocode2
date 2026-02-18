import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePackages } from './usePackages';
import { supabase } from '@/lib/supabase';
import type { ProcedurePackage } from '@/types/package';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

// Mock Auth Context
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';

const mockPackagesData = [
    {
        id: 'pkg-1',
        name: 'Package 1',
        description: 'Test package 1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        package_procedures: [
            { procedure_code: 'PROC-001' },
            { procedure_code: 'PROC-002' },
        ],
    },
    {
        id: 'pkg-2',
        name: 'Package 2',
        description: null,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        package_procedures: [],
    },
];

const expectedPackages: ProcedurePackage[] = [
    {
        id: 'pkg-1',
        name: 'Package 1',
        description: 'Test package 1',
        procedureIds: ['PROC-001', 'PROC-002'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'pkg-2',
        name: 'Package 2',
        description: undefined,
        procedureIds: [],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
    },
];

const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
};

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

describe('usePackages', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({
            user: mockUser,
            loading: false,
            login: vi.fn(),
            signup: vi.fn(),
            logout: vi.fn(),
        });
    });

    it('should fetch packages successfully', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({
            data: mockPackagesData,
            error: null,
        });

        vi.mocked(supabase.from).mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
        } as any);

        const { result } = renderHook(() => usePackages(), {
            wrapper: createWrapper(),
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.packages).toEqual(expectedPackages);
        expect(supabase.from).toHaveBeenCalledWith('packages');
    });

    it('should handle loading state', () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockReturnValue(new Promise(() => { })); // Never resolves

        vi.mocked(supabase.from).mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
        } as any);

        const { result } = renderHook(() => usePackages(), {
            wrapper: createWrapper(),
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.packages).toEqual([]);
    });

    it('should compute byId mapping', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({
            data: mockPackagesData,
            error: null,
        });

        vi.mocked(supabase.from).mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
        } as any);

        const { result } = renderHook(() => usePackages(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.byId['pkg-1']).toEqual(expectedPackages[0]);
        expect(result.current.byId['pkg-2']).toEqual(expectedPackages[1]);
    });

    it('should add a package successfully', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });

        const mockInsert = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                    data: {
                        id: 'new-pkg',
                        name: 'New Package',
                        description: 'New description',
                        created_at: '2024-01-03T00:00:00Z',
                        updated_at: '2024-01-03T00:00:00Z',
                    },
                    error: null,
                }),
            }),
        });

        vi.mocked(supabase.from).mockImplementation((table) => {
            if (table === 'packages') {
                return {
                    select: mockSelect,
                    eq: mockEq,
                    order: mockOrder,
                    insert: mockInsert,
                } as any;
            }
            if (table === 'package_procedures') {
                return {
                    insert: vi.fn().mockResolvedValue({ error: null }),
                } as any;
            }
            return {} as any;
        });

        const { result } = renderHook(() => usePackages(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const newPackage = await result.current.addPackage({
            name: 'New Package',
            description: 'New description',
            procedureIds: ['PROC-003'],
        });

        expect(newPackage).toBeDefined();
        expect(newPackage?.name).toBe('New Package');
    });

    it('should not add package when user is not authenticated', async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
            login: vi.fn(),
            signup: vi.fn(),
            logout: vi.fn(),
        });

        const { result } = renderHook(() => usePackages(), {
            wrapper: createWrapper(),
        });

        const newPackage = await result.current.addPackage({
            name: 'New Package',
            description: 'New description',
            procedureIds: [],
        });

        expect(newPackage).toBeNull();
    });

    it('should update a package successfully', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({ data: mockPackagesData, error: null });
        const mockUpdate = vi.fn().mockReturnThis();
        const mockDelete = vi.fn().mockReturnThis();

        vi.mocked(supabase.from).mockImplementation((table) => {
            if (table === 'packages') {
                return {
                    select: mockSelect,
                    eq: mockEq,
                    order: mockOrder,
                    update: mockUpdate.mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                } as any;
            }
            if (table === 'package_procedures') {
                return {
                    delete: mockDelete.mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null }),
                    }),
                    insert: vi.fn().mockResolvedValue({ error: null }),
                } as any;
            }
            return {} as any;
        });

        const { result } = renderHook(() => usePackages(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await result.current.updatePackage('pkg-1', {
            name: 'Updated Package',
            procedureIds: ['PROC-004'],
        });

        expect(mockUpdate).toHaveBeenCalled();
    });

    it('should delete a package successfully', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({ data: mockPackagesData, error: null });
        const mockDelete = vi.fn().mockReturnThis();

        vi.mocked(supabase.from).mockImplementation((table) => {
            if (table === 'packages') {
                return {
                    select: mockSelect,
                    eq: mockEq,
                    order: mockOrder,
                    delete: mockDelete.mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({ error: null }),
                        }),
                    }),
                } as any;
            }
            return {} as any;
        });

        const { result } = renderHook(() => usePackages(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await result.current.deletePackage('pkg-1');

        expect(mockDelete).toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Failed to fetch'),
        });

        vi.mocked(supabase.from).mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
        } as any);

        const { result } = renderHook(() => usePackages(), {
            wrapper: createWrapper(),
        });

        // The hook should handle the error gracefully
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });
});
