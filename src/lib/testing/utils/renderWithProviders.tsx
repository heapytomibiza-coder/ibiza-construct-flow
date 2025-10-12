/**
 * Render with Providers
 * Phase 23: Testing & Quality Assurance System
 * 
 * Testing utility to render components with all necessary providers
 */

import { render, RenderOptions as RTLRenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ReactElement, ReactNode } from 'react';
import { RenderOptions } from '../types';

function createTestQueryClient() {
  return new QueryClient({
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
}

interface TestProvidersProps {
  children: ReactNode;
  initialRoute?: string;
}

function TestProviders({ children, initialRoute = '/' }: TestProvidersProps) {
  const queryClient = createTestQueryClient();
  const Router = initialRoute ? MemoryRouter : BrowserRouter;
  const routerProps = initialRoute ? { initialEntries: [initialRoute] } : {};

  return (
    <QueryClientProvider client={queryClient}>
      <Router {...routerProps}>
        {children}
      </Router>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & Omit<RTLRenderOptions, 'wrapper'>
) {
  const { initialRoute, wrapper: CustomWrapper, ...renderOptions } = options || {};

  function Wrapper({ children }: { children: ReactNode }) {
    const content = (
      <TestProviders initialRoute={initialRoute}>
        {children}
      </TestProviders>
    );

    if (CustomWrapper) {
      return <CustomWrapper>{content}</CustomWrapper>;
    }

    return content;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: createTestQueryClient(),
  };
}
