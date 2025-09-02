import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { useBreadcrumbs } from '../useBreadcrumbs';

// Mock react-router-dom hooks
const mockUseLocation = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
    useParams: () => mockUseParams()
  };
});

// Mock useTeam hook
vi.mock('../useTeam', () => ({
  useTeam: vi.fn(() => ({ team: null }))
}));

const wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('useBreadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only Home breadcrumb for console route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/console' });
    mockUseParams.mockReturnValue({});

    const { result } = renderHook(() => useBreadcrumbs(), { wrapper });

    expect(result.current).toEqual([
      { label: 'Home', href: '/console', isActive: true }
    ]);
  });

  it('generates breadcrumbs for hackathon dashboard route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/hackathon/123/dashboard' });
    mockUseParams.mockReturnValue({ hackathonId: '123' });

    const hackathon = { name: 'Test Hackathon' };
    const { result } = renderHook(() => useBreadcrumbs(hackathon), { wrapper });

    expect(result.current).toEqual([
      { label: 'Home', href: '/console', isActive: false },
      { label: 'Test Hackathon', href: '/hackathon/123/dashboard', isActive: true }
    ]);
  });

  it('generates breadcrumbs for hackathon tasks route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/hackathon/123/tasks' });
    mockUseParams.mockReturnValue({ hackathonId: '123' });

    const hackathon = { name: 'Test Hackathon' };
    const { result } = renderHook(() => useBreadcrumbs(hackathon), { wrapper });

    expect(result.current).toEqual([
      { label: 'Home', href: '/console', isActive: false },
      { label: 'Test Hackathon', href: '/hackathon/123/dashboard', isActive: false },
      { label: 'Tasks', href: '/hackathon/123/tasks', isActive: true }
    ]);
  });

  it('generates breadcrumbs for create hackathon route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/create-hackathon' });
    mockUseParams.mockReturnValue({});

    const { result } = renderHook(() => useBreadcrumbs(), { wrapper });

    expect(result.current).toEqual([
      { label: 'Home', href: '/console', isActive: false },
      { label: 'Create Hackathon', href: '/create-hackathon', isActive: true }
    ]);
  });

  it('uses default hackathon name when hackathon object is not provided', () => {
    mockUseLocation.mockReturnValue({ pathname: '/hackathon/123/dashboard' });
    mockUseParams.mockReturnValue({ hackathonId: '123' });

    const { result } = renderHook(() => useBreadcrumbs(), { wrapper });

    expect(result.current).toEqual([
      { label: 'Home', href: '/console', isActive: false },
      { label: 'Hackathon', href: '/hackathon/123/dashboard', isActive: true }
    ]);
  });

  it('handles hackathon chat route correctly', () => {
    mockUseLocation.mockReturnValue({ pathname: '/hackathon/123/chat' });
    mockUseParams.mockReturnValue({ hackathonId: '123' });

    const hackathon = { name: 'Test Hackathon' };
    const { result } = renderHook(() => useBreadcrumbs(hackathon), { wrapper });

    expect(result.current).toEqual([
      { label: 'Home', href: '/console', isActive: false },
      { label: 'Test Hackathon', href: '/hackathon/123/dashboard', isActive: false },
      { label: 'Chat', href: '/hackathon/123/chat', isActive: true }
    ]);
  });
});