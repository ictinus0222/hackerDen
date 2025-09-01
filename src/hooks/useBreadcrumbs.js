import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export const useBreadcrumbs = (hackathon = null) => {
  const location = useLocation();
  const params = useParams();

  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const crumbs = [];

    // Always start with Console
    crumbs.push({
      label: 'Console',
      href: '/console',
      isActive: false
    });

    // Handle different route patterns
    if (path === '/console' || path === '/') {
      crumbs[0].isActive = true;
      return crumbs;
    }

    // Handle hackathon routes
    if (segments[0] === 'hackathon' && params.hackathonId) {
      const hackathonName = hackathon?.name || 'Hackathon';
      
      crumbs.push({
        label: hackathonName,
        href: `/hackathon/${params.hackathonId}/dashboard`,
        isActive: false
      });

      // Handle nested hackathon routes
      if (segments.length > 2) {
        const subRoute = segments[2];
        
        // Don't add a separate breadcrumb for dashboard - it's the default hackathon view
        if (subRoute !== 'dashboard') {
          const routeLabels = {
            'tasks': 'Tasks',
            'whiteboard': 'Whiteboard',
            'vault': 'Vault'
          };

          const label = routeLabels[subRoute] || subRoute.charAt(0).toUpperCase() + subRoute.slice(1);
          crumbs.push({
            label,
            href: path,
            isActive: true
          });
        } else {
          // If we're at the dashboard, mark the hackathon as active
          crumbs[crumbs.length - 1].isActive = true;
        }
      } else {
        // If we're at the hackathon root, mark hackathon as active
        crumbs[crumbs.length - 1].isActive = true;
      }
    }
    // Handle create hackathon
    else if (path === '/create-hackathon') {
      crumbs.push({
        label: 'Create Hackathon',
        href: '/create-hackathon',
        isActive: true
      });
    }
    // Handle whiteboard (standalone)
    else if (path === '/whiteboard') {
      crumbs.push({
        label: 'Whiteboard',
        href: '/whiteboard',
        isActive: true
      });
    }

    // Handle other routes
    else {
      const routeLabels = {
        'console': 'Console',
        'dashboard': 'Dashboard',
        'tasks': 'Tasks',
        'card-test': 'Card Test'
      };

      segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1;
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const href = '/' + segments.slice(0, index + 1).join('/');

        crumbs.push({
          label,
          href,
          isActive: isLast
        });
      });
    }

    return crumbs;
  }, [location.pathname, params.hackathonId, hackathon]);

  return breadcrumbs;
};