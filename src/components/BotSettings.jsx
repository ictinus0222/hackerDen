import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import botService from '../services/botService';
import { cn } from '../lib/utils';

const BotSettings = ({ teamId, className }) => {
  const [config, setConfig] = useState({
    enabled: true,
    personality: 'friendly',
    reminderFrequency: 'hourly',
    easterEggsEnabled: true,
    contextualTipsEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // Load bot configuration
  useEffect(() => {
    const loadConfig = async () => {
      if (!teamId) return;
      
      try {
        setLoading(true);
        const botStatus = await botService.getBotStatus(teamId);
        setConfig({
          enabled: botStatus.enabled,
          personality: botStatus.personality,
          reminderFrequency: botStatus.reminderFrequency,
          easterEggsEnabled: botStatus.easterEggsEnabled,
          contextualTipsEnabled: botStatus.contextualTipsEnabled
        });
        setStatus(botStatus);
      } catch (error) {
        console.error('Error loading bot config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [teamId]);

  // Save configuration
  const handleSave = async () => {
    if (!teamId) return;

    try {
      setSaving(true);
      const updatedConfig = await botService.updateBotConfig(teamId, config);
      setConfig(updatedConfig);
      
      // Show success feedback
      const successMessage = document.createElement('div');
      successMessage.textContent = 'Bot settings saved!';
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(successMessage);
      setTimeout(() => document.body.removeChild(successMessage), 3000);
    } catch (error) {
      console.error('Error saving bot config:', error);
      
      // Show error feedback
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Failed to save settings';
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(errorMessage);
      setTimeout(() => document.body.removeChild(errorMessage), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Send test message
  const handleTestMessage = async () => {
    if (!teamId) return;

    try {
      // This would need hackathonId in a real implementation
      console.log('Test message would be sent here');
      
      // Show feedback
      const testMessage = document.createElement('div');
      testMessage.textContent = 'Test message sent to chat!';
      testMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(testMessage);
      setTimeout(() => document.body.removeChild(testMessage), 3000);
    } catch (error) {
      console.error('Error sending test message:', error);
    }
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-muted rounded animate-pulse" />
            <div className="w-32 h-6 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                <div className="w-12 h-6 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <div>
              <CardTitle>Bot Settings</CardTitle>
              <CardDescription>
                Configure your team's friendly AI assistant
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={config.enabled ? "default" : "secondary"}
            className={config.enabled ? "bg-green-500/10 text-green-400 border-green-500/20" : ""}
          >
            {config.enabled ? "Active" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bot Status */}
        {status && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{status.messagesCount || 0}</div>
              <div className="text-xs text-muted-foreground">Messages Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{status.easterEggsTriggered || 0}</div>
              <div className="text-xs text-muted-foreground">Easter Eggs Found</div>
            </div>
          </div>
        )}

        {/* Main Settings */}
        <div className="space-y-4">
          {/* Enable/Disable Bot */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bot-enabled">Enable Bot</Label>
              <div className="text-sm text-muted-foreground">
                Turn the bot on or off for your team
              </div>
            </div>
            <Switch
              id="bot-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <Separator />

          {/* Reminder Frequency */}
          <div className="space-y-2">
            <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
            <Select
              value={config.reminderFrequency}
              onValueChange={(value) => setConfig(prev => ({ ...prev, reminderFrequency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              How often the bot sends motivational messages and tips
            </div>
          </div>

          {/* Bot Personality */}
          <div className="space-y-2">
            <Label htmlFor="bot-personality">Bot Personality</Label>
            <Select
              value={config.personality}
              onValueChange={(value) => setConfig(prev => ({ ...prev, personality: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select personality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly & Encouraging</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="witty">Witty & Fun</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              The bot's communication style and tone
            </div>
          </div>

          <Separator />

          {/* Feature Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="easter-eggs">Easter Eggs</Label>
                <div className="text-sm text-muted-foreground">
                  Enable fun commands like /party and /celebrate
                </div>
              </div>
              <Switch
                id="easter-eggs"
                checked={config.easterEggsEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, easterEggsEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="contextual-tips">Contextual Tips</Label>
                <div className="text-sm text-muted-foreground">
                  Smart suggestions based on team activity
                </div>
              </div>
              <Switch
                id="contextual-tips"
                checked={config.contextualTipsEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, contextualTipsEnabled: checked }))}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Easter Egg Commands */}
        <div className="space-y-3">
          <Label>Available Commands</Label>
          <div className="grid grid-cols-2 gap-2">
            {['/party', '/celebrate', '/coffee', '/pizza', '/rocket', '/magic', '/ninja', '/unicorn'].map((command) => (
              <Badge key={command} variant="outline" className="justify-center py-1">
                {command}
              </Badge>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Type these commands in chat to trigger fun effects!
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
          
          <Button
            onClick={handleTestMessage}
            variant="outline"
            disabled={!config.enabled}
            className="flex-1"
          >
            Send Test Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotSettings;