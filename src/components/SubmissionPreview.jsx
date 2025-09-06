import { useState, useEffect, useMemo } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Eye, 
  ExternalLink, 
  Github, 
  Users, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Target,
  Award,
  TrendingUp,
  Zap,
  Clock
} from 'lucide-react';

const SubmissionPreview = ({ 
  submission, 
  formData, 
  teamData, 
  trigger,
  children 
}) => {

  // Use useMemo to create stable preview data and prevent infinite re-renders
  const previewDataMemo = useMemo(() => {
    if (!submission) return null;
    
    return {
      ...submission,
      // Override with form data if available
      title: formData?.title ?? submission.title,
      description: formData?.description ?? submission.description,
      techStack: formData?.techStack ?? submission.techStack,
      challenges: formData?.challenges ?? submission.challenges,
      accomplishments: formData?.accomplishments ?? submission.accomplishments,
      futureWork: formData?.futureWork ?? submission.futureWork,
      demoUrl: formData?.demoUrl ?? submission.demoUrl,
      repositoryUrl: formData?.repositoryUrl ?? submission.repositoryUrl,
      teamData: teamData || submission.teamData
    };
  }, [
    submission,
    formData?.title,
    formData?.description,
    JSON.stringify(formData?.techStack || []),
    formData?.challenges,
    formData?.accomplishments,
    formData?.futureWork,
    formData?.demoUrl,
    formData?.repositoryUrl,
    teamData
  ]);



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
    if (!name) return 'TM';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!previewDataMemo) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Submission Preview</SheetTitle>
            <SheetDescription>
              Loading preview...
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-xl">Submission Preview</SheetTitle>
          <SheetDescription>
            This is how judges will see your submission
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {previewDataMemo.title || 'Untitled Project'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{previewDataMemo.teamData?.teamName || 'Team'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {previewDataMemo.createdAt 
                      ? `Submitted ${formatDate(previewDataMemo.createdAt)}`
                      : 'Draft submission'
                    }
                  </span>
                </div>
                {previewDataMemo.isFinalized && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Finalized
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Action Links */}
            <div className="flex items-center space-x-3">
              {previewDataMemo.demoUrl && (
                <Button size="sm" variant="default" asChild>
                  <a 
                    href={previewDataMemo.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
              {previewDataMemo.repositoryUrl && (
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={previewDataMemo.repositoryUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Github className="h-3 w-3 mr-2" />
                    Source Code
                  </a>
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <FileText className="h-4 w-4 mr-2" />
                Project Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {previewDataMemo.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          {previewDataMemo.techStack && previewDataMemo.techStack.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Zap className="h-4 w-4 mr-2" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {previewDataMemo.techStack.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Challenges Faced */}
          {previewDataMemo.challenges && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Target className="h-4 w-4 mr-2" />
                  Challenges Faced
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {previewDataMemo.challenges}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Key Accomplishments */}
          {previewDataMemo.accomplishments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Award className="h-4 w-4 mr-2" />
                  Key Accomplishments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {previewDataMemo.accomplishments}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Future Plans */}
          {previewDataMemo.futureWork && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Future Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {previewDataMemo.futureWork}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Team Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <TrendingUp className="h-4 w-4 mr-2" />
                Project Progress
              </CardTitle>
              <CardDescription className="text-xs">
                Team activity and completion metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Tasks Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tasks Completed</span>
                  <span className="font-medium">
                    {previewDataMemo.teamData?.completedTasks || 0} / {previewDataMemo.teamData?.totalTasks || 0}
                  </span>
                </div>
                <Progress 
                  value={
                    previewDataMemo.teamData?.totalTasks > 0 
                      ? (previewDataMemo.teamData.completedTasks / previewDataMemo.teamData.totalTasks) * 100 
                      : 0
                  } 
                  className="h-1" 
                />
              </div>

              <Separator />

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-primary">
                    {previewDataMemo.teamData?.progress?.filesShared || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Files Shared</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-primary">
                    {previewDataMemo.teamData?.progress?.ideasImplemented || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Ideas Implemented</div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Submission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Clock className="h-4 w-4 mr-2" />
                Submission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {previewDataMemo.createdAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(previewDataMemo.createdAt)}</span>
                </div>
              )}
              
              {previewDataMemo.updatedAt && previewDataMemo.updatedAt !== previewDataMemo.createdAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDate(previewDataMemo.updatedAt)}</span>
                </div>
              )}

              {previewDataMemo.isFinalized && previewDataMemo.finalizedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Finalized</span>
                  <span>{formatDate(previewDataMemo.finalizedAt)}</span>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                <Badge 
                  variant={previewDataMemo.isFinalized ? "default" : "secondary"}
                  className={previewDataMemo.isFinalized ? "bg-green-500/10 text-green-700 dark:text-green-300" : ""}
                >
                  {previewDataMemo.isFinalized ? 'Final Submission' : 'Draft'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>This submission was created using HackerDen - A collaborative hackathon platform</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SubmissionPreview;