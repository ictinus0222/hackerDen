import { useState } from 'react';
import PollManager from './PollManager';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { VoteIcon, UsersIcon, ClockIcon } from 'lucide-react';

const PollDemo = () => {
  const [demoTeamId] = useState('demo-team-123');
  const [showDemo, setShowDemo] = useState(false);

  const demoFeatures = [
    {
      title: 'Poll Creation',
      description: 'Create custom polls with multiple options, expiration times, and single/multiple choice settings',
      icon: <VoteIcon className="w-5 h-5 text-purple-400" />
    },
    {
      title: 'Real-time Voting',
      description: 'Team members can vote in real-time with instant result updates and vote tracking',
      icon: <UsersIcon className="w-5 h-5 text-blue-400" />
    },
    {
      title: 'Quick Polls',
      description: 'Create instant yes/no polls for quick team decisions with one-click setup',
      icon: <ClockIcon className="w-5 h-5 text-green-400" />
    }
  ];

  if (showDemo) {
    return (
      <div className="space-y-6">
        <Card className="bg-background-sidebar border-dark-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <VoteIcon className="w-6 h-6 mr-3 text-purple-400" />
                Poll System Demo
              </CardTitle>
              <Button
                onClick={() => setShowDemo(false)}
                variant="outline"
                size="sm"
              >
                Back to Overview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                This is a demo of the poll system. In a real application, this would be connected to your team's data.
                You can create polls, vote on them, and see results in real-time.
              </p>
            </div>
          </CardContent>
        </Card>

        <PollManager teamId={demoTeamId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-background-sidebar border-dark-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center">
            <VoteIcon className="w-8 h-8 mr-3 text-purple-400" />
            In-App Polling System
            <Badge variant="secondary" className="ml-3 bg-purple-500/20 text-purple-300 border-purple-500/30">
              Task 6.1 Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-lg">
            A comprehensive polling system that enables teams to make decisions democratically through 
            real-time voting, with support for custom polls, quick yes/no decisions, and detailed results tracking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoFeatures.map((feature, index) => (
              <Card key={index} className="bg-background border-dark-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Implementation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-purple-300">✅ Completed Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• PollService with full CRUD operations</li>
                  <li>• Poll creation with validation</li>
                  <li>• Real-time voting system</li>
                  <li>• Results calculation and display</li>
                  <li>• Poll expiration management</li>
                  <li>• Quick yes/no polls</li>
                  <li>• Poll history and management</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-300">🔧 Technical Implementation:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Appwrite database integration</li>
                  <li>• shadcn/ui components</li>
                  <li>• React Hook Form validation</li>
                  <li>• Real-time subscriptions ready</li>
                  <li>• Mobile-responsive design</li>
                  <li>• Comprehensive error handling</li>
                  <li>• Unit and integration tests</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => setShowDemo(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3"
            >
              <VoteIcon className="w-5 h-5 mr-2" />
              Try Poll System Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PollDemo;