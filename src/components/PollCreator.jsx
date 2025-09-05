import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import pollService from '../services/pollService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { PlusIcon, XIcon, ClockIcon, HelpCircleIcon } from 'lucide-react';

const PollCreator = ({ isOpen, onClose, onPollCreated, teamId }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState(['', '']);
  const [newOption, setNewOption] = useState('');

  // Initialize form with react-hook-form
  const form = useForm({
    defaultValues: {
      question: '',
      allowMultiple: false,
      expirationHours: '24'
    }
  });

  // Reset form when modal opens/closes
  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setOptions(['', '']);
      setNewOption('');
      onClose();
    }
  };

  // Add new option to the list
  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  // Remove option from the list
  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // Update existing option
  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Handle form submission
  const handleSubmit = async (data) => {
    if (!user?.$id || !teamId) {
      form.setError('root', { message: 'User or team information is missing' });
      return;
    }

    // Validate options
    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      form.setError('root', { message: 'At least 2 options are required' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate expiration time
      const expirationHours = parseInt(data.expirationHours);
      const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();

      const pollData = {
        question: data.question.trim(),
        options: validOptions,
        allowMultiple: data.allowMultiple,
        expiresAt
      };

      console.log('Creating poll with data:', pollData);
      const newPoll = await pollService.createPoll(teamId, user.$id, pollData);

      // Notify parent component
      if (onPollCreated) {
        onPollCreated(newPoll);
      }

      // Reset form and close modal
      handleClose();
    } catch (error) {
      console.error('Error creating poll:', error);
      form.setError('root', { message: error.message || 'Failed to create poll' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-card border border-dark-primary/10 bg-[#1E2B29]"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-dark-primary/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <HelpCircleIcon className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Create Team Poll
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
            type="button"
          >
            <XIcon className="w-6 h-6" />
          </Button>
        </DialogHeader>

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
              {/* General Error */}
              {form.formState.errors.root && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl" role="alert">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-300">{form.formState.errors.root.message}</p>
                  </div>
                </div>
              )}

              {/* Question Field */}
              <FormField
                control={form.control}
                name="question"
                rules={{ 
                  required: "Poll question is required",
                  maxLength: { value: 200, message: "Question must be 200 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-white">
                      <HelpCircleIcon className="w-4 h-4 mr-2 text-purple-400" />
                      Poll Question
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder="What would you like to ask your team?"
                        className="text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-purple-500/50 focus:ring-purple-500 focus:border-purple-500 h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Poll Options */}
              <div className="space-y-4">
                <FormLabel className="flex items-center text-white">
                  <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Poll Options (minimum 2)
                </FormLabel>

                <Card className="bg-background-sidebar border-dark-primary/30">
                  <CardContent className="p-4 space-y-3">
                    {/* Existing Options */}
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {index + 1}
                        </Badge>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          disabled={isSubmitting}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 text-white placeholder-dark-tertiary bg-background border-dark-primary/30 hover:border-purple-500/50 focus:ring-purple-500 focus:border-purple-500"
                          maxLength={100}
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index)}
                            disabled={isSubmitting}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            aria-label={`Remove option ${index + 1}`}
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    {/* Add New Option */}
                    {options.length < 10 && (
                      <div className="flex items-center gap-2 pt-2 border-t border-dark-primary/20">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          <PlusIcon className="w-3 h-3" />
                        </Badge>
                        <Input
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addOption();
                            }
                          }}
                          disabled={isSubmitting}
                          placeholder="Add another option..."
                          className="flex-1 text-white placeholder-dark-tertiary bg-background border-dark-primary/30 hover:border-purple-500/50 focus:ring-purple-500 focus:border-purple-500"
                          maxLength={100}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          disabled={isSubmitting || !newOption.trim() || options.includes(newOption.trim())}
                          className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 border-primary/30 hover:bg-primary/20"
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Poll Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Allow Multiple Selection */}
                <FormField
                  control={form.control}
                  name="allowMultiple"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Selection Type
                      </FormLabel>
                      <Select
                        value={field.value ? 'multiple' : 'single'}
                        onValueChange={(value) => field.onChange(value === 'multiple')}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="text-white bg-background-sidebar border-dark-primary/30 hover:border-purple-500/50 focus:ring-purple-500 focus:border-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Choice</SelectItem>
                          <SelectItem value="multiple">Multiple Choice</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expiration Time */}
                <FormField
                  control={form.control}
                  name="expirationHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <ClockIcon className="w-4 h-4 mr-2 text-purple-400" />
                        Expires In
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="text-white bg-background-sidebar border-dark-primary/30 hover:border-purple-500/50 focus:ring-purple-500 focus:border-purple-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Hour</SelectItem>
                          <SelectItem value="4">4 Hours</SelectItem>
                          <SelectItem value="12">12 Hours</SelectItem>
                          <SelectItem value="24">1 Day</SelectItem>
                          <SelectItem value="72">3 Days</SelectItem>
                          <SelectItem value="168">1 Week</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:space-x-3 sm:gap-0 p-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-semibold min-h-[48px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting || options.filter(opt => opt.trim()).length < 2}
            className="px-6 py-3 text-sm font-semibold min-h-[48px] bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            aria-describedby={isSubmitting ? "submit-status" : undefined}
          >
            {isSubmitting ? (
              <>
                <span className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2 text-white" aria-hidden="true"></div>
                  Creating Poll...
                </span>
                <span id="submit-status" className="sr-only">Creating poll, please wait</span>
              </>
            ) : (
              'Create Poll'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PollCreator;