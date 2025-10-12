/**
 * Mock Router
 * Phase 23: Testing & Quality Assurance System
 * 
 * Mock implementation of React Router for testing
 */

export function createMockRouter(initialRoute: string = '/') {
  let currentRoute = initialRoute;
  const listeners: ((location: any) => void)[] = [];

  return {
    navigate: (to: string, options?: any) => {
      currentRoute = to;
      const location = {
        pathname: to,
        search: '',
        hash: '',
        state: options?.state,
      };
      listeners.forEach(listener => listener(location));
    },
    location: () => ({
      pathname: currentRoute,
      search: '',
      hash: '',
      state: null,
    }),
    useNavigate: () => (to: string, options?: any) => {
      currentRoute = to;
    },
    useLocation: () => ({
      pathname: currentRoute,
      search: '',
      hash: '',
      state: null,
    }),
    useParams: () => ({}),
    subscribe: (listener: (location: any) => void) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
  };
}

export type MockRouter = ReturnType<typeof createMockRouter>;
