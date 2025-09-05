import { useState, useEffect } from 'react';
import pollService from '../services/pollService';
import { taskService } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  BarChart3Icon, 
  UsersIcon, 
  TrophyIcon,
  DownloadIcon,
  PlusIcon,
  CheckCircleIcon
} from 'lucide-react';

const PollResults = ({ 
  poll, 
  pollResults, 
  onTaskCreated, 
  showExport = true, 
  showTaskConversion = true,
  compact = false 
}) => {
  const { user } = useAuth();
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle exporting poll results
  const handleExportResults = async (format = 'csv') => {
    if (!pollResults || isExporting) return;

    setIsExporting(true);

    try {
      // Use the enhanced export functionality from pollService
      const exportData = await pollService.exportPollResults(poll.$id, format);
      
      // Create and download file
      const blob = new Blob([exportData.content], { type: `${exportData.mimeType};charset=utf-8;` });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', exportData.filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting poll results:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle converting winning option to task
  const handleConvertToTask = async (winningOption) => {
    if (!user?.$id || isCreatingTask) return;

    setIsCreatingTask(true);

    try {
      // Get hackathon context for task creation and chat integration
      const hackathonId = poll.hackathonId || null;
      const creatorName = user.name || 'Team Member';
      
      // Use the enhanced convertPollToTask method with chat integration
      const newTask = await pollService.convertPollToTask(
        poll.$id,
        winningOption,
        hackathonId,
        user.$id,
        creatorName
      );

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(newTask, winningOption);
      }
    } catch (error) {
      console.error('Error converting poll to task:', error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  if (!pollResults) {
    return (
      <Card className="bg-background-sidebar border-dark-primary/30">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            No results available
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground flex items-center">
            <BarChart3Icon className="w-4 h-4 mr-2 text-purple-400" />
            Results
          </h4>
          <div className="flex items-center text-xs text-muted-foreground">
            <UsersIcon className="w-3 h-3 mr-1" />
            {pollResults.uniqueVoters} {pollResults.uniqueVoters === 1 ? 'vote' : 'votes'}
          </div>
        </div>

        <div className="space-y-2">
          {pollResults.results.map((result, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={`flex-1 ${
                  pollResults.winners.includes(result.option) 
                    ? 'text-green-400 font-medium' 
                    : 'text-foreground'
                }`}>
                  {result.option}
                  {pollResults.winners.includes(result.option) && (
                    <TrophyIcon className="w-3 h-3 ml-1 inline text-yellow-400" />
                  )}
                </span>
                <span className="text-muted-foreground text-xs">
                  {result.votes} ({result.percentage}%)
                </span>
              </div>
              <Progress 
                value={result.percentage} 
                className="h-1.5"
                style={{
                  '--progress-background': pollResults.winners.includes(result.option) 
                    ? 'rgb(34 197 94)' 
                    : 'rgb(147 51 234)'
                }}
              />
            </div>
          ))}
        </div>

        {/* Compact actions */}
        {(showExport || showTaskConversion) && pollResults.winners.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-dark-primary/20">
            {showExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportResults}
                disabled={isExporting}
                className="text-xs"
              >
                <DownloadIcon className="w-3 h-3 mr-1" />
                Export
              </Button>
            )}
            {showTaskConversion && pollResults.winners.length === 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConvertToTask(pollResults.winners[0])}
                disabled={isCreatingTask}
                className="text-xs"
              >
                <PlusIcon className="w-3 h-3 mr-1" />
                Create Task
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-background-sidebar border-dark-primary/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-3 flex-shrink-0">
              <BarChart3Icon className="w-4 h-4 text-white" />
            </div>
            Poll Results
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <UsersIcon className="w-4 h-4 mr-1" />
            {pollResults.uniqueVoters} {pollResults.uniqueVoters === 1 ? 'voter' : 'voters'}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Results breakdown */}
        <div className="space-y-4">
          {pollResults.results.map((result, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <span className={`text-sm font-medium ${
                    pollResults.winners.includes(result.option) 
                      ? 'text-green-400' 
                      : 'text-foreground'
                  }`}>
                    {result.option}
                  </span>
                  {pollResults.winners.includes(result.option) && (
                    <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">
                      <TrophyIcon className="w-3 h-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.votes} votes ({result.percentage}%)
                </div>
              </div>
              
              <Progress 
                value={result.percentage} 
                className="h-3"
                style={{
                  '--progress-background': pollResults.winners.includes(result.option) 
                    ? 'rgb(34 197 94)' 
                    : 'rgb(147 51 234)'
                }}
              />
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg border border-dark-primary/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{pollResults.totalVotes}</div>
            <div className="text-xs text-muted-foreground">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{pollResults.uniqueVoters}</div>
            <div className="text-xs text-muted-foreground">Unique Voters</div>
          </div>
        </div>

        {/* Actions */}
        {(showExport || showTaskConversion) && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-dark-primary/20">
            {showExport && (
              <Button
                variant="outline"
                onClick={handleExportResults}
                disabled={isExporting}
                className="flex-1"
              >
                {isExporting ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Export Results
                  </>
                )}
              </Button>
            )}

            {showTaskConversion && pollResults.winners.length > 0 && (
              <div className="flex-1 space-y-2">
                {pollResults.winners.length === 1 ? (
                  <Button
                    onClick={() => handleConvertToTask(pollResults.winners[0])}
                    disabled={isCreatingTask}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  >
                    {isCreatingTask ? (
                      <>
                        <div className="spinner w-4 h-4 mr-2" />
                        Creating Task...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create Task from Winner
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground text-center">
                      Multiple winners - choose one to create task:
                    </div>
                    {pollResults.winners.map((winner, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleConvertToTask(winner)}
                        disabled={isCreatingTask}
                        className="w-full text-sm"
                      >
                        <CheckCircleIcon className="w-3 h-3 mr-2" />
                        Create Task: "{winner}"
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PollResults;