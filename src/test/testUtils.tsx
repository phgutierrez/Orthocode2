import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/AuthContext';
import type { User } from '@supabase/supabase-js';

// Mock user for testing
export const mockUser: User = {
    id: 'test-user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
};

// Create a mock AuthContext value
export const createMockAuthContext = (user: User | null = mockUser) => ({
    user,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    loading: false,
});

interface AllTheProvidersProps {
    children: ReactNode;
    user?: User | null;
}

// Wrapper component with all providers
function AllTheProviders({ children, user = mockUser }: AllTheProvidersProps) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });

    const authValue = createMockAuthContext(user);

    return (
        <AuthContext.Provider value={authValue}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </AuthContext.Provider>
    );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    user?: User | null;
}

// Custom render function with providers
export function renderWithProviders(
    ui: ReactElement,
    { user = mockUser, ...renderOptions }: CustomRenderOptions = {}
) {
    return render(ui, {
        wrapper: ({ children }) => (
            <AllTheProviders user={user}>{children}</AllTheProviders>
        ),
        ...renderOptions,
    });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };
