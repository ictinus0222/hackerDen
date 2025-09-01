import { MessageCircle, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Link } from 'react-router-dom';
import { useHackathonTeamMembers } from '../hooks/useHackathonTeamMembers';
import { cn } from '../lib/utils';

const ChatHeader = ({ hackathon, team, className }) => {
  const { members } = useHackathonTeamMembers();
  
  // Count online members (for now, we'll show total members as all are considered "online")
  const onlineCount = members?.length || 0;

  return (
    <div className={cn("border-b border-border bg-background/95 backdrop-blur-optimized px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3", className)}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/console"
                className="hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded transition-colors"
                aria-label="Go to console"
              >
                Console
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to={`/hackathon/${hackathon?.$id}`}
                className="hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded transition-colors"
                aria-label={`Go to ${hackathon?.title || 'Hackathon'} dashboard`}
              >
                {hackathon?.title || 'Hackathon'}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Chat
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Team Context Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
              {team?.teamName || 'Team Chat'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {hackathon?.title || 'Hackathon Event'}
            </p>
          </div>
        </div>
        
        {/* Online Member Count Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1 text-xs"
            aria-label={`${onlineCount} team members online`}
          >
            <Users className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">{onlineCount} online</span>
            <span className="sm:hidden">{onlineCount}</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;