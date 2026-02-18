q   aimport { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { supabase } from '@/lib/supabase';
import type { Notification } from './useNotifications';
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

const mockNotificationsData = [
    {
        id: 'notif-1',
        user_id: 'test-user-123',
        type: 'package_shared',
        data: {
            from_user_name: 'John Doe',
            package_type: 'standard',
            package_name: 'Test Package',
            package_id: 'pkg-1',
        },
        read: false,
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 'notif-2',
        user_id: 'test-user-123',
        type: 'package_shared',
        data: {
            from_user_name: 'Jane Smith',
            package_type: 'private',
            package_name: 'Private Package',
        },
        read: true,
        created_at: '2024-01-02T00:00:00Z',
    },
];

const expectedNotifications: Notification[] = [
    {
        id: 'notif-1',
        userId: 'test-user-123',
        type: 'package_shared',
        data: {
            from_user_name: 'John Doe',
            package_type: 'standard',
            package_name: 'Test Package',
            package_id: 'pkg-1',
        },
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'notif-2',
        userId: 'test-user-123',
        type: 'package_shared',
        data: {
            from_user_name: 'Jane Smith',
            package_type: 'private',
            package_name: 'Private Package',
        },
        read: true,
        createdAt: '2024-01-02T00:00:00Z',
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

describe('useNotifications', () => {
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

    it('should fetch notifications successfully', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({
            data: mockNotificationsData,
            error: null,
        });

        vi.mocked(supabase.from).mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
        } as any);

        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper(),
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.notifications).toEqual(expectedNotifications);
        expect(supabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should calculate unread count correctly', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({
            data: mockNotificationsData,
            error: null,
        });

        vi.mocked(supabase.from).mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
        } as any);

        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Only notif-1 is unread
        expect(result.current.unreadCount).toBe(1);
    });

    it('should mark notification as read', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({
            data: mockNotificationsData,
            error: null,
        });
        const mockUpdate = vi.fn().mockReturnThis();

        vi.mocked(supabase.from).mockImplementation((table) => {
            if (table === 'notifications') {
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
            return {} as any;
        });

        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await result.current.markAsRead('notif-1');

        expect(mockUpdate).toHaveBeenCalledWith({ read: true });
    });

    it('should delete notification', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({
            data: mockNotificationsData,
            error: null,
        });
        const mockDelete = vi.fn().mockReturnThis();

        vi.mocked(supabase.from).mockImplementation((table) => {
            if (table === 'notifications') {
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

        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await result.current.deleteNotification('notif-1');

        expect(mockDelete).toHaveBeenCalled();
    });

    it('should not perform actions when user is not authenticated', async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
            login: vi.fn(),
            signup: vi.fn(),
            logout: vi.fn(),
        });

        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper(),
        });

        // These should not throw and should do nothing
        await result.current.markAsRead('notif-1');
        await result.current.deleteNotification('notif-1');

        // Since no user is authenticated, the initial query shouldn't run
        expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should handle empty notifications', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({
            data: [],
            error: null,
        });

        vi.mocked(supabase.from).mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
        } as any);

        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.notifications).toEqual([]);
        expect(result.current.unreadCount).toBe(0);
    });

    it('should provide refetch function', async () => {
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockResolvedValue({
            data: mockNotificationsData,
            error: null,
        });

        vi.mocked(supabase.from).mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
        } as any);

        const { result } = renderHook(() => useNotifications(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.refetch).toBeDefined();
        expect(typeof result.current.refetch).toBe('function');
    });
});
