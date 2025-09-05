import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import botService from '../services/botService';
import EasterEggEffects, { useEasterEggEffects } from './EasterEggEffects';
import CustomTooltip, { TaskCardTooltip, DeleteButtonTooltip, FileUploadTooltip, VoteButtonTooltip, BotTooltip } from './CustomTooltip';

/**
 * Demo component to showcase bot functionality
 * This component demonstrates all the bot features implemented in task 7.1
 */
const BotDemo = () => {
  const [testMessage, setTestMessage] = useState('');
  const [botResponse, setBotResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentEffect, triggerEffect, clearEffect } = useEasterEggEffects();

  // Test motivational message
  const testMotivationalMessage = async () => {
    setLoading(true);
    try {
      const message = botService.getRandomMessage(botService.constructor.BOT_MESSAGES.MOTIVATIONAL);
      setBotResponse({
        type: 'motivational',
        content: message,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error testing motivational message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test contextual tips
  const testContextualTips = async () => {
    setLoading(true);
    try {
      const mockActivity = {
        taskCount: 0,
        messageCount: 0,
        lastActivityHours: 5
      };
      const tips = await botService.getContextualTips(mockActivity);
      setBotResponse({
        type: 'tip',
        content: tips[0],
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error testing contextual tips:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test easter egg command
  const testEasterEgg = async (command) => {
    setLoading(true);
    try {
      const result = await botService.triggerEasterEgg(command, 'demo-team', 'demo-hackathon', 'Demo User');
      if (result.found) {
        setBotResponse({
          type: 'easter_egg',
          content: result.message,
          timestamp: new Date().toLocaleTimeString()
        });
        // Trigger visual effect
        if (result.effect) {
          triggerEffect(result.effect);
        }
      }
    } catch (error) {
      console.error('Error testing easter egg:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test message processing
  const testMessageProcessing = async () => {
    if (!testMessage.trim()) return;
    
    setLoading(true);
    try {
      const result = await botService.processMessageForEasterEggs(testMessage, 'demo-team', 'demo-hackathon', 'Demo User');
      if (result) {
        setBotResponse({
          type: result.type || 'easter_egg',
          content: result.found ? 'Easter egg found!' : result.message,
          timestamp: new Date().toLocaleTimeString()
        });
        if (result.effect) {
          triggerEffect(result.effect);
        }
      } else {
        setBotResponse({
          type: 'normal',
          content: 'No special command detected in your message.',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      console.error('Error testing message processing:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test witty tooltip
  const testWittyTooltip = () => {
    const tooltip = botService.getWittyTooltip('task_card');
    setBotResponse({
      type: 'tooltip',
      content: tooltip,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  // Test special date theme
  const testSpecialTheme = () => {
    const theme = botService.getSpecialDateTheme();
    setBotResponse({
      type: 'theme',
      content: theme ? `Special theme: ${theme.theme} - ${theme.message}` : 'No special theme for today',
      timestamp: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span>Bot System Demo</span>
          </CardTitle>
          <CardDescription>
            Test all the bot functionality implemented in task 7.1: Create system bot and contextual messaging
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Bot Response Display */}
          {botResponse && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    🤖 Bot
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{botResponse.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{botResponse.timestamp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Motivational Messages */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Motivational Messages</h3>
            <p className="text-sm text-muted-foreground">
              Test the bot's ability to send encouraging messages to keep teams motivated.
            </p>
            <Button onClick={testMotivationalMessage} disabled={loading}>
              Send Motivational Message
            </Button>
          </div>

          <Separator />

          {/* Contextual Tips */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Contextual Tips</h3>
            <p className="text-sm text-muted-foreground">
              Test smart suggestions based on team activity patterns.
            </p>
            <Button onClick={testContextualTips} disabled={loading}>
              Get Contextual Tip
            </Button>
          </div>

          <Separator />

          {/* Easter Egg Commands */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Easter Egg Commands</h3>
            <p className="text-sm text-muted-foreground">
              Test fun commands that trigger special effects and celebrations.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['/party', '/celebrate', '/coffee', '/pizza', '/rocket', '/magic', '/ninja', '/unicorn'].map((command) => (
                <Button
                  key={command}
                  variant="outline"
                  size="sm"
                  onClick={() => testEasterEgg(command)}
                  disabled={loading}
                  className="text-xs"
                >
                  {command}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Message Processing */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Message Processing</h3>
            <p className="text-sm text-muted-foreground">
              Test how the bot processes user messages for commands and help requests.
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Type a message (try '/party' or 'help bot')"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && testMessageProcessing()}
              />
              <Button onClick={testMessageProcessing} disabled={loading || !testMessage.trim()}>
                Process
              </Button>
            </div>
          </div>

          <Separator />

          {/* Witty Tooltips */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Witty Tooltips</h3>
            <p className="text-sm text-muted-foreground">
              Test enhanced tooltips with personality and pop-culture references.
            </p>
            <div className="flex flex-wrap gap-2">
              <TaskCardTooltip>
                <Button variant="outline" size="sm">Hover for Task Tooltip</Button>
              </TaskCardTooltip>
              <DeleteButtonTooltip>
                <Button variant="outline" size="sm">Hover for Delete Tooltip</Button>
              </DeleteButtonTooltip>
              <FileUploadTooltip>
                <Button variant="outline" size="sm">Hover for Upload Tooltip</Button>
              </FileUploadTooltip>
              <VoteButtonTooltip>
                <Button variant="outline" size="sm">Hover for Vote Tooltip</Button>
              </VoteButtonTooltip>
              <BotTooltip content="I'm your friendly AI assistant!">
                <Button variant="outline" size="sm">Hover for Bot Tooltip</Button>
              </BotTooltip>
            </div>
            <Button onClick={testWittyTooltip} disabled={loading} size="sm">
              Generate Random Tooltip
            </Button>
          </div>

          <Separator />

          {/* Special Date Themes */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Special Date Themes</h3>
            <p className="text-sm text-muted-foreground">
              Test themed decorations and messages for special dates.
            </p>
            <Button onClick={testSpecialTheme} disabled={loading}>
              Check Today's Theme
            </Button>
          </div>

          <Separator />

          {/* Bot Personality Examples */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Bot Personality</h3>
            <p className="text-sm text-muted-foreground">
              Examples of the bot's witty responses and helpful suggestions.
            </p>
            <div className="grid gap-3">
              <Card className="bg-emerald-50/5 border-emerald-500/20">
                <CardContent className="pt-4">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-2">
                    🤖 Motivational
                  </Badge>
                  <p className="text-sm">🚀 Keep up the great work! Your team is making awesome progress!</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50/5 border-blue-500/20">
                <CardContent className="pt-4">
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-2">
                    💡 Tip
                  </Badge>
                  <p className="text-sm">💡 Pro tip: Use drag and drop to reorganize your tasks efficiently!</p>
                </CardContent>
              </Card>
              <Card className="bg-pink-50/5 border-pink-500/20">
                <CardContent className="pt-4">
                  <Badge className="bg-pink-500/10 text-pink-400 border-pink-500/20 mb-2">
                    🎉 Easter Egg
                  </Badge>
                  <p className="text-sm">🎉🎊🥳 PARTY TIME! 🥳🎊🎉 Everyone dance! 💃🕺</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Easter Egg Effects */}
      <EasterEggEffects
        effect={currentEffect}
        onComplete={clearEffect}
      />
    </div>
  );
};

export default BotDemo;