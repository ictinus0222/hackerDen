import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import SubmissionBuilder from '@/components/SubmissionBuilder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const SubmissionPage = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { team, loading: teamLoading } = useTeam();
  const [submission, setSubmission] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Check if user has a team
  useEffect(() => {
    if (!teamLoading && !team) {
      toast.error('You need to be part of a team to create a submission');
      navigate(`/hackathon/${hackathonId}/dashboard`);
    }
  }, [team, teamLoading, hackathonId, navigate]);

  const handleSubmissionCreated = (newSubmission) => {
    setSubmission(newSubmission);
    toast.success('Submission created! You can now fill in the details.');
  };

  const handleSubmissionUpdated = (updatedSubmission) => {
    setSubmission(updatedSubmission);
  };

  const handleBackToDashboard = () => {
    navigate(`/hackathon/${hackathonId}/dashboard`);
  };

  if (!user || teamLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>No Team Found</CardTitle>
            <CardDescription>
              You need to be part of a team to create a submission for this hackathon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleBackToDashboard}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Judge Submission</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{team.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <SubmissionBuilder
          teamId={team.$id}
          onSubmissionCreated={handleSubmissionCreated}
          onSubmissionUpdated={handleSubmissionUpdated}
        />
      </div>
    </div>
  );
};

export default SubmissionPage;