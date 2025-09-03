import { useState } from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

import { teamService } from '../services/teamService';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Plus, Users, CheckSquare, AlertCircle } from 'lucide-react';

const TasksPage = () => {
  const { hackathonId } = useParams();
  // TODO: Authentication removed
  // // TODO: Authentication removed
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Get user's team for this hackathon
  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?.$id || !hackathonId) {
        setTeam(null);
        setLoading(false);
        return;
      }

      try {
        const userTeam = await teamService.getUserTeamForHackathon(user.$id, hackathonId);
        setTeam(userTeam);
      } catch (err) {
        console.error('Error fetching team:', err);
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [user?.$id, hackathonId]);

  const hasTeam = !!team;

  const handleTaskCreated = () => {
    // Task creation is handled by the modal and real-time updates
    // No need to manually refresh as the KanbanBoard uses real-time data
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Card className="bg-card text-card-foreground rounded-xl border shadow-sm">
          <CardContent className="p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading team information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasTeam) {
    return (
      <div className="space-y-6 p-6">
        <Card className="bg-card text-card-foreground rounded-xl border shadow-sm">
          <CardContent className="p-16 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Team Found</h3>
            <p className="text-muted-foreground mb-6">You need to join or create a team to manage tasks.</p>
            <div className="flex items-center justify-center space-x-3">
              <Button asChild>
                <a href="/create-team">
                  Create Team
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/join-team">
                  Join Team
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <ErrorBoundary>
        <div className="h-full flex flex-col space-y-6">
          {/* Page Header Card */}
          <Card className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
                      <CheckSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
                      <p className="text-muted-foreground">
                        Manage your team's tasks and track progress
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="flex items-center space-x-2"
                  size="lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Task</span>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Full-Screen Kanban Board */}
          <div className="flex-1 min-h-0">
            <KanbanBoard />
          </div>

          {/* Task Creation Modal */}
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onTaskCreated={handleTaskCreated}
          />
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default TasksPage;