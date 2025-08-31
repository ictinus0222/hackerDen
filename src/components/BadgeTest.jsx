import { StatusBadge, PriorityBadge, TaskIdBadge, LabelBadge } from './ui/status-badge';
import { Card, CardHeader, CardContent } from './ui/card';

const BadgeTest = () => {
  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-xl font-bold text-foreground">Badge Component Test</h2>
        <p className="text-muted-foreground">Testing the new Shadcn Badge components for status and priority indicators</p>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Status Badges */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Status Badges</h3>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="todo" />
            <StatusBadge status="in_progress" />
            <StatusBadge status="blocked" />
            <StatusBadge status="done" />
            <StatusBadge status="unknown" />
          </div>
        </div>

        {/* Priority Badges */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Priority Badges</h3>
          <div className="flex flex-wrap gap-3">
            <PriorityBadge priority="high" />
            <PriorityBadge priority="medium" />
            <PriorityBadge priority="low" />
            <PriorityBadge priority="unknown" />
          </div>
        </div>

        {/* Priority Badges with Labels */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Priority Badges with Labels</h3>
          <div className="flex flex-wrap gap-3">
            <PriorityBadge priority="high" showLabel={true} />
            <PriorityBadge priority="medium" showLabel={true} />
            <PriorityBadge priority="low" showLabel={true} />
          </div>
        </div>

        {/* Task ID Badges */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Task ID Badges</h3>
          <div className="flex flex-wrap gap-3">
            <TaskIdBadge taskId="123456789abcdef" />
            <TaskIdBadge taskId="987654321fedcba" />
            <TaskIdBadge taskId="short" />
          </div>
        </div>

        {/* Label Badges */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Label Badges</h3>
          <div className="flex flex-wrap gap-3">
            <LabelBadge label="Frontend" />
            <LabelBadge label="Backend" />
            <LabelBadge label="Bug Fix" />
            <LabelBadge label="Feature" />
            <LabelBadge label="Documentation" />
          </div>
        </div>

        {/* Combined Example (like in TaskCard) */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Combined Example (TaskCard Style)</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <TaskIdBadge taskId="123456789abcdef" />
              <PriorityBadge priority="high" />
              <StatusBadge status="in_progress" />
              <LabelBadge label="Frontend" />
              <LabelBadge label="Urgent" />
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <TaskIdBadge taskId="987654321fedcba" />
              <PriorityBadge priority="low" />
              <StatusBadge status="done" />
              <LabelBadge label="Backend" />
              <LabelBadge label="API" />
            </div>
          </div>
        </div>

        {/* Accessibility Test */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Accessibility Features</h3>
          <p className="text-sm text-muted-foreground mb-3">
            All badges include proper ARIA labels and semantic markup for screen readers.
            Try using keyboard navigation and screen reader tools to test accessibility.
          </p>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="blocked" />
            <PriorityBadge priority="high" showLabel={true} />
            <TaskIdBadge taskId="accessibility-test" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeTest;