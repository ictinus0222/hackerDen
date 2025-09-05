import { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import ReactionButton from './ReactionButton';
import ReactionPicker from './ReactionPicker';
import ReactionDisplay from './ReactionDisplay';
import { useReactions } from '../hooks/useReactions';

const ReactionDemo = () => {
  const [demoTargetId] = useState('demo-message-123');
  const [demoTaskId] = useState('demo-task-456');
  const teamId = 'demo-team';

  const { reactions: messageReactions } = useReactions(demoTargetId, 'message');
  const { reactions: taskReactions } = useReactions(demoTaskId, 'task');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Reaction System Demo</h2>
          <p className="text-muted-foreground">
            Test the reaction and emoji system components
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Message Reactions Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Message Reactions</h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="mb-3">
                <p className="text-sm">Sample message content here...</p>
              </div>
              <ReactionButton
                targetId={demoTargetId}
                targetType="message"
                teamId={teamId}
                showAddButton={true}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Message has {messageReactions?.length || 0} reaction types
            </div>
          </div>

          {/* Task Reactions Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Task Reactions</h3>
            <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-l-primary">
              <div className="mb-3">
                <h4 className="font-medium">Sample Task Title</h4>
                <p className="text-sm text-muted-foreground">Task description goes here...</p>
              </div>
              <ReactionButton
                targetId={demoTaskId}
                targetType="task"
                teamId={teamId}
                showAddButton={true}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Task has {taskReactions?.length || 0} reaction types
            </div>
          </div>

          {/* Standalone Components Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Standalone Components</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <h4 className="font-medium">Reaction Picker</h4>
                </CardHeader>
                <CardContent>
                  <ReactionPicker
                    targetId="standalone-demo"
                    targetType="message"
                    teamId={teamId}
                    onReactionAdd={(reaction) => {
                      console.log('Reaction added:', reaction);
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="font-medium">Reaction Display</h4>
                </CardHeader>
                <CardContent>
                  <ReactionDisplay
                    targetId="standalone-demo"
                    targetType="message"
                    onReactionUpdate={(update) => {
                      console.log('Reaction updated:', update);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              How to Test
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Click the smile icon to open the emoji picker</li>
              <li>• Browse different emoji categories (Popular, People, Gestures, Objects)</li>
              <li>• Click on any emoji to add a reaction</li>
              <li>• Click on existing reactions to toggle them on/off</li>
              <li>• Try uploading custom emoji in the Custom tab</li>
              <li>• Search for specific emoji using the search box</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReactionDemo;