import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import submissionService from '@/services/submissionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ExternalLink, 
  Github, 
  Users, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Lightbulb,
  Target,
  Zap,
  Clock,
  Award,
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';

const PublicSubmissionPage = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSubmission = async () => {
      if (!submissionId) {
        setError('Invalid submission URL');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const submissionData = await submissionService.getPublicSubmission(submissionId);
        setSubmission(submissionData);
      } catch (error) {
        console.error('Error loading public submission:', error);
        setError('Submission not found or no longer available');
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmission();
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">Loading submission...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Submission Not Found</h2>
            <p className="text-muted-foreground">
              {error || 'The requested submission could not be found or is no longer available.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {submission.title}
              </h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{submission.teamData?.teamName || 'Team'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted {formatDate(submission.createdAt)}</span>
                </div>
                {submission.isFinalized && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Finalized
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Action Links */}
            <div className="flex items-center space-x-3">
              {submission.demoUrl && (
                <Button asChild variant="default">
                  <a 
                    href={submission.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
              {submission.repositoryUrl && (
                <Button asChild variant="outline">
                  <a 
                    href={submission.repositoryUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Source Code
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Project Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {submission.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Technology Stack */}
            {submission.techStack && submission.techStack.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {submission.techStack.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Challenges Faced */}
            {submission.challenges && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Challenges Faced
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {submission.challenges}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Key Accomplishments */}
            {submission.accomplishments && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Key Accomplishments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {submission.accomplishments}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Future Plans */}
            {submission.futureWork && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Future Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {submission.futureWork}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Project Progress
                </CardTitle>
                <CardDescription>
                  Team activity and completion metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tasks Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tasks Completed</span>
                    <span className="font-medium">
                      {submission.teamData?.completedTasks || 0} / {submission.teamData?.totalTasks || 0}
                    </span>
                  </div>
                  <Progress 
                    value={
                      submission.teamData?.totalTasks > 0 
                        ? (submission.teamData.completedTasks / submission.teamData.totalTasks) * 100 
                        : 0
                    } 
                    className="h-2" 
                  />
                </div>

                <Separator />

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {submission.teamData?.completedTasks || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Tasks Completed</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {submission.teamData?.totalTimeTaken || '0s'}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Submission Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(submission.createdAt)}</span>
                </div>
                
                {submission.updatedAt !== submission.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{formatDate(submission.updatedAt)}</span>
                  </div>
                )}

                {submission.isFinalized && submission.finalizedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Finalized</span>
                    <span>{formatDate(submission.finalizedAt)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge 
                    variant={submission.isFinalized ? "default" : "secondary"}
                    className={submission.isFinalized ? "bg-green-500/10 text-green-700 dark:text-green-300" : ""}
                  >
                    {submission.isFinalized ? 'Final Submission' : 'Draft'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/30 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>This submission was created using HackerDen - A collaborative hackathon platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSubmissionPage;