import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

const BreadcrumbNavigation = ({ hackathon = null, className = '', alwaysShow = false }) => {
  const breadcrumbs = useBreadcrumbs(hackathon);

  // Don't render if there's only one breadcrumb (Home) or no breadcrumbs, unless alwaysShow is true
  if (!alwaysShow && breadcrumbs.length <= 1) {
    return null;
  }

  // Don't render if no breadcrumbs at all
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isConsole = crumb.label === 'Console';
          
          return (
            <div key={crumb.href} className="flex items-center">
              <BreadcrumbItem>
                {isLast || crumb.isActive ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    {isConsole && <Terminal className="w-4 h-4" />}
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={crumb.href}
                      className="hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      {isConsole && <Terminal className="w-4 h-4" />}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNavigation;