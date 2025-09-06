import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import submissionService from '@/services/submissionService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, Save, ExternalLink, AlertCircle, CheckCircle2, Copy, Eye } from 'lucide-react';
import SubmissionPreview from '@/components/SubmissionPreview';

const SubmissionBuilder = ({ teamId, hackathonId, onSubmissionCreated, onSubmissionUpdated }) => {
  const { user } = useAuth();
  const { team } = useTeam();
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [newTechItem, setNewTechItem] = useState('');
  const [completionStats, setCompletionStats] = useState({ completeness: 0, validation: null });
  const [teamData, setTeamData] = useState(null);
  const [hackathonEnded, setHackathonEnded] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      techStack: [],
      challenges: '',
      accomplishments: '',
      futureWork: '',
      demoUrl: '',
      repositoryUrl: ''
    }
  });

  // Watch form values for auto-save
  const watchedValues = form.watch();

  // Load existing submission or create new one
  useEffect(() => {
    const loadSubmission = async () => {
      if (!teamId) return;

      setIsLoading(true);
      try {
        const existingSubmission = await submissionService.getTeamSubmission(teamId, hackathonId);
        
        if (existingSubmission) {
          setSubmission(existingSubmission);
          // Populate form with existing data
          form.reset({
            title: existingSubmission.title || '',
            description: existingSubmission.description || '',
            techStack: existingSubmission.techStack || [],
            challenges: existingSubmission.challenges || '',
            accomplishments: existingSubmission.accomplishments || '',
            futureWork: existingSubmission.futureWork || '',
            demoUrl: existingSubmission.demoUrl || '',
            repositoryUrl: existingSubmission.repositoryUrl || ''
          });

          // Get team data for preview
          if (existingSubmission.teamData) {
            setTeamData(existingSubmission.teamData);
          }
        } else {
          // Create new submission
          const newSubmission = await submissionService.createSubmission(teamId, {
            title: team?.name ? `${team.name} - Hackathon Project` : 'Hackathon Project'
          }, hackathonId);
          setSubmission(newSubmission);
          form.setValue('title', newSubmission.title);
          
          if (onSubmissionCreated) {
            onSubmissionCreated(newSubmission);
          }
        }

        // Check submission stats including hackathon end status
        const stats = await submissionService.getSubmissionStats(teamId);
        setHackathonEnded(stats.hackathonEnded);
      } catch (error) {
        console.error('Error loading submission:', error);
        toast.error('Failed to load submission');
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmission();
  }, [teamId, team?.name, form, onSubmissionCreated]);

  // Auto-save functionality
  const autoSave = useCallback(async (formData) => {
    if (!submission || submission.isFinalized) return;

    setAutoSaveStatus('saving');
    try {
      await submissionService.autoSave(submission.$id, formData);
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  }, [submission]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!submission || isLoading) return;

    const timeoutId = setTimeout(() => {
      autoSave(watchedValues);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [
    autoSave,
    submission,
    isLoading,
    watchedValues.title,
    watchedValues.description,
    JSON.stringify(watchedValues.techStack || []),
    watchedValues.challenges,
    watchedValues.accomplishments,
    watchedValues.futureWork,
    watchedValues.demoUrl,
    watchedValues.repositoryUrl
  ]);

  // Update completion stats when form values change
  useEffect(() => {
    if (!submission) return;

    const validation = submissionService.validateSubmission(watchedValues);
    setCompletionStats({
      completeness: Math.round(((8 - validation.missing.required.length - validation.missing.recommended.length) / 8) * 100),
      validation
    });
  }, [
    submission,
    watchedValues.title,
    watchedValues.description,
    JSON.stringify(watchedValues.techStack || []),
    watchedValues.challenges,
    watchedValues.accomplishments,
    watchedValues.futureWork,
    watchedValues.demoUrl,
    watchedValues.repositoryUrl
  ]);

  // Add tech stack item
  const addTechItem = () => {
    const currentTech = form.getValues('techStack');
    if (newTechItem.trim() && !currentTech.includes(newTechItem.trim())) {
      form.setValue('techStack', [...currentTech, newTechItem.trim()]);
      setNewTechItem('');
    }
  };

  // Remove tech stack item
  const removeTechItem = (itemToRemove) => {
    const currentTech = form.getValues('techStack');
    form.setValue('techStack', currentTech.filter(item => item !== itemToRemove));
  };

  // Manual save
  const handleSave = async (data) => {
    if (!submission) return;

    setIsSaving(true);
    try {
      const updatedSubmission = await submissionService.updateSubmission(submission.$id, data);
      setSubmission(updatedSubmission);
      setAutoSaveStatus('saved');
      toast.success('Submission saved successfully');
      
      if (onSubmissionUpdated) {
        onSubmissionUpdated(updatedSubmission);
      }
    } catch (error) {
      console.error('Error saving submission:', error);
      toast.error('Failed to save submission');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy public URL
  const copyPublicUrl = async () => {
    if (!submission?.publicUrl) return;

    try {
      await navigator.clipboard.writeText(submission.publicUrl);
      toast.success('Public URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  // Finalize submission
  const handleFinalize = async () => {
    if (!submission || !completionStats.validation?.isValid) return;

    try {
      const finalizedSubmission = await submissionService.finalizeSubmission(submission.$id);
      setSubmission(finalizedSubmission);
      toast.success('Submission finalized! No further edits allowed.');
    } catch (error) {
      console.error('Error finalizing submission:', error);
      toast.error('Failed to finalize submission');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading submission...</span>
        </CardContent>
      </Card>
    );
  }

  if (!submission) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <span className="ml-2 text-muted-foreground">Failed to load submission</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Judge Submission</CardTitle>
              <CardDescription>
                Create a comprehensive submission for judges to evaluate your hackathon project
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              {/* Preview Button */}
              <SubmissionPreview
                submission={submission}
                formData={watchedValues}
                teamData={teamData}
                trigger={
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                }
              />

              {/* Auto-save status */}
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Saved</span>
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-destructive" />
                    <span>Save failed</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion Progress</span>
              <span className="font-medium">{completionStats.completeness}%</span>
            </div>
            <Progress value={completionStats.completeness} className="h-2" />
          </div>

          {/* Public URL */}
          {submission.publicUrl && (
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Public URL:</span>
              <code className="flex-1 text-sm bg-background px-2 py-1 rounded">
                {submission.publicUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyPublicUrl}
                className="h-8"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Finalized status */}
          {submission.isFinalized && (
            <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-300">
                This submission has been finalized and cannot be edited.
              </span>
            </div>
          )}

          {/* Hackathon ended warning */}
          {hackathonEnded && !submission.isFinalized && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">
                The hackathon has ended. Submissions can no longer be edited.
              </span>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Form Card */}
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
              {/* Project Title */}
              <FormField
                control={form.control}
                name="title"
                rules={{ 
                  required: "Project title is required",
                  maxLength: { value: 100, message: "Title must be 100 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Project Title</FormLabel>
                    <FormDescription>
                      Give your project a compelling name that captures its essence
                    </FormDescription>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={submission.isFinalized || hackathonEnded}
                        placeholder="Enter your project title..."
                        className="text-base min-h-[44px] touch-manipulation"
                        style={{ fontSize: '16px' }} // Prevent iOS zoom
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Project Description */}
              <FormField
                control={form.control}
                name="description"
                rules={{ 
                  required: "Project description is required",
                  minLength: { value: 50, message: "Description should be at least 50 characters" },
                  maxLength: { value: 2000, message: "Description must be 2000 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Project Description</FormLabel>
                    <FormDescription>
                      Describe what your project does, its purpose, and key features
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={submission.isFinalized || hackathonEnded}
                        rows={6}
                        placeholder="Provide a comprehensive description of your project..."
                        className="resize-none touch-manipulation"
                        style={{ fontSize: '16px' }} // Prevent iOS zoom
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Tech Stack */}
              <FormField
                control={form.control}
                name="techStack"
                rules={{ 
                  validate: (value) => value.length > 0 || "At least one technology is required"
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Technology Stack</FormLabel>
                    <FormDescription>
                      List the technologies, frameworks, and tools used in your project
                    </FormDescription>
                    
                    {/* Tech input - Mobile Optimized */}
                    {!submission.isFinalized && !hackathonEnded && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={newTechItem}
                          onChange={(e) => setNewTechItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTechItem();
                            }
                          }}
                          placeholder="Add technology (e.g., React, Node.js, MongoDB)"
                          className="flex-1 min-h-[44px] touch-manipulation"
                          style={{ fontSize: '16px' }} // Prevent iOS zoom
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addTechItem}
                          disabled={!newTechItem.trim()}
                          className="min-h-[44px] touch-manipulation sm:w-auto w-full"
                        >
                          Add
                        </Button>
                      </div>
                    )}

                    {/* Tech display */}
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {field.value.map((tech, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="px-3 py-1 text-sm"
                          >
                            {tech}
                            {!submission.isFinalized && !hackathonEnded && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTechItem(tech)}
                                className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground min-h-[24px] min-w-[24px] touch-manipulation"
                              >
                                ×
                              </Button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Challenges */}
              <FormField
                control={form.control}
                name="challenges"
                rules={{ 
                  maxLength: { value: 1000, message: "Challenges section must be 1000 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Challenges Faced</FormLabel>
                    <FormDescription>
                      Describe the main challenges you encountered and how you overcame them
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={submission.isFinalized || hackathonEnded}
                        rows={4}
                        placeholder="What obstacles did you face during development?"
                        className="resize-none touch-manipulation"
                        style={{ fontSize: '16px' }} // Prevent iOS zoom
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Accomplishments */}
              <FormField
                control={form.control}
                name="accomplishments"
                rules={{ 
                  maxLength: { value: 1000, message: "Accomplishments section must be 1000 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Key Accomplishments</FormLabel>
                    <FormDescription>
                      Highlight what you're most proud of and what you achieved
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={submission.isFinalized || hackathonEnded}
                        rows={4}
                        placeholder="What are you most proud of accomplishing?"
                        className="resize-none touch-manipulation"
                        style={{ fontSize: '16px' }} // Prevent iOS zoom
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Future Work */}
              <FormField
                control={form.control}
                name="futureWork"
                rules={{ 
                  maxLength: { value: 1000, message: "Future work section must be 1000 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Future Plans</FormLabel>
                    <FormDescription>
                      What would you like to add or improve if you had more time?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={submission.isFinalized || hackathonEnded}
                        rows={4}
                        placeholder="What features or improvements would you add next?"
                        className="resize-none touch-manipulation"
                        style={{ fontSize: '16px' }} // Prevent iOS zoom
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="demoUrl"
                  rules={{ 
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Please enter a valid URL starting with http:// or https://"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Demo URL</FormLabel>
                      <FormDescription>
                        Link to your live demo or deployed application
                      </FormDescription>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={submission.isFinalized || hackathonEnded}
                          placeholder="https://your-demo.com"
                          type="url"
                          className="min-h-[44px] touch-manipulation"
                          style={{ fontSize: '16px' }} // Prevent iOS zoom
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repositoryUrl"
                  rules={{ 
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Please enter a valid URL starting with http:// or https://"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Repository URL</FormLabel>
                      <FormDescription>
                        Link to your source code repository
                      </FormDescription>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={submission.isFinalized || hackathonEnded}
                          placeholder="https://github.com/username/repo"
                          type="url"
                          className="min-h-[44px] touch-manipulation"
                          style={{ fontSize: '16px' }} // Prevent iOS zoom
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons - Mobile Optimized */}
              {!submission.isFinalized && !hackathonEnded && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none min-h-[48px] touch-manipulation"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  {completionStats.validation?.isValid && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFinalize}
                      className="flex-1 sm:flex-none min-h-[48px] touch-manipulation"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Finalize Submission
                    </Button>
                  )}
                </div>
              )}

              {/* Validation Messages */}
              {completionStats.validation && (
                <div className="space-y-3 pt-4 border-t">
                  {completionStats.validation.missing.required.length > 0 && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">Required fields missing:</span>
                      </div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {completionStats.validation.missing.required.map((field) => (
                          <li key={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {completionStats.validation.missing.recommended.length > 0 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">Recommended fields:</span>
                      </div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {completionStats.validation.missing.recommended.map((field) => (
                          <li key={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionBuilder;