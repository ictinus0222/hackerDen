import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import BreadcrumbNavigation from '../BreadcrumbNavigation';

// Mock the useBreadcrumbs hook
vi.mock('../../hooks/useBreadcrumbs', () => ({
  useBreadcrumbs: vi.fn()
}));

import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BreadcrumbNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when there is only one breadcrumb', () => {
    useBreadcrumbs.mockReturnValue([
      { label: 'Home', href: '/console', isActive: true }
    ]);

    const { container } = renderWithRouter(<BreadcrumbNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it('renders breadcrumbs when there are multiple items', () => {
    useBreadcrumbs.mockReturnValue([
      { label: 'Home', href: '/console', isActive: false },
      { label: 'Test Hackathon', href: '/hackathon/123/dashboard', isActive: false },
      { label: 'Tasks', href: '/hackathon/123/tasks', isActive: true }
    ]);

    renderWithRouter(<BreadcrumbNavigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Test Hackathon')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('renders active breadcrumb as non-clickable', () => {
    useBreadcrumbs.mockReturnValue([
      { label: 'Home', href: '/console', isActive: false },
      { label: 'Tasks', href: '/hackathon/123/tasks', isActive: true }
    ]);

    renderWithRouter(<BreadcrumbNavigation />);
    
    const homeLink = screen.getByText('Home').closest('a');
    const tasksSpan = screen.getByText('Tasks');
    
    expect(homeLink).toHaveAttribute('href', '/console');
    expect(tasksSpan.tagName).toBe('SPAN');
    expect(tasksSpan).toHaveAttribute('aria-current', 'page');
  });

  it('passes hackathon prop to useBreadcrumbs hook', () => {
    const mockHackathon = { name: 'Test Hackathon' };
    useBreadcrumbs.mockReturnValue([
      { label: 'Home', href: '/console', isActive: false },
      { label: 'Test Hackathon', href: '/hackathon/123/dashboard', isActive: true }
    ]);

    renderWithRouter(<BreadcrumbNavigation hackathon={mockHackathon} />);
    
    expect(useBreadcrumbs).toHaveBeenCalledWith(mockHackathon);
  });
});