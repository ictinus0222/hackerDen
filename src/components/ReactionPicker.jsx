import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Smile, Upload, X } from 'lucide-react';
import { reactionService } from '../services/reactionService';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const ReactionPicker = ({ 
  targetId, 
  targetType, 
  onReactionAdd, 
  teamId,
  className,
  trigger,
  disabled = false
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [customEmoji, setCustomEmoji] = useState([]);
  const [uploadingEmoji, setUploadingEmoji] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const touchStartRef = useRef(null);

  // Popular emoji categories
  const emojiCategories = {
    popular: reactionService.getPopularEmoji(),
    people: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    gestures: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    objects: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💫', '✨', '🔥', '💡', '💎', '🚀', '⚡', '💥', '💢', '💯'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✅', '❌', '⭕', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣']
  };

  // Load custom emoji on component mount
  useEffect(() => {
    if (teamId && isOpen) {
      loadCustomEmoji();
    }
  }, [teamId, isOpen]);

  const loadCustomEmoji = async () => {
    try {
      const emoji = await reactionService.getTeamCustomEmoji(teamId);
      setCustomEmoji(emoji);
    } catch (error) {
      console.error('Failed to load custom emoji:', error);
    }
  };

  const handleEmojiSelect = async (emoji, isCustom = false) => {
    if (!user?.$id || disabled) return;

    try {
      const reaction = await reactionService.addReaction(
        targetId,
        targetType,
        user.$id,
        emoji,
        isCustom
      );

      if (onReactionAdd) {
        onReactionAdd(reaction);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  // Handle quick tap for popular emoji
  const handleQuickTap = (emoji) => {
    if (isLongPress) return; // Don't trigger quick tap if it was a long press
    handleEmojiSelect(emoji);
  };

  // Handle long press to open picker
  const handleLongPressStart = (e) => {
    e.preventDefault();
    setIsLongPress(false);
    const timer = setTimeout(() => {
      setIsLongPress(true);
      setIsOpen(true);
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    // Reset long press flag after a short delay
    setTimeout(() => setIsLongPress(false), 100);
  };

  const handleCustomEmojiUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !teamId) return;

    setUploadingEmoji(true);
    try {
      const emojiName = file.name.split('.')[0];
      const customEmojiData = await reactionService.uploadCustomEmoji(teamId, file, emojiName);
      
      // Reload custom emoji list
      await loadCustomEmoji();
      
      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload custom emoji:', error);
      alert(error.message);
    } finally {
      setUploadingEmoji(false);
    }
  };

  // Filter emoji based on search query
  const filterEmoji = (emojiList) => {
    if (!searchQuery) return emojiList;
    return emojiList.filter(emoji => 
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Filter custom emoji based on search query
  const filterCustomEmoji = (emojiList) => {
    if (!searchQuery) return emojiList;
    return emojiList.filter(emoji => 
      emoji.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-10 w-10 p-0 hover:bg-muted min-h-[44px] min-w-[44px] touch-manipulation"
      disabled={disabled}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
    >
      <Smile className="h-5 w-5" />
    </Button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent 
        className={cn("w-80 p-0", className)}
        align="start"
        side="top"
      >
        <div className="p-3 border-b">
          <Input
            placeholder="Search emoji..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>

        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-10 p-0 m-2">
            <TabsTrigger value="popular" className="text-xs px-2 min-h-[40px] touch-manipulation">Popular</TabsTrigger>
            <TabsTrigger value="people" className="text-xs px-2 min-h-[40px] touch-manipulation">People</TabsTrigger>
            <TabsTrigger value="gestures" className="text-xs px-2 min-h-[40px] touch-manipulation">Gestures</TabsTrigger>
            <TabsTrigger value="objects" className="text-xs px-2 min-h-[40px] touch-manipulation">Objects</TabsTrigger>
            <TabsTrigger value="custom" className="text-xs px-2 min-h-[40px] touch-manipulation">Custom</TabsTrigger>
          </TabsList>

          {Object.entries(emojiCategories).map(([category, emojiList]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <ScrollArea className="h-48 p-2">
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {filterEmoji(emojiList).map((emoji, index) => (
                    <Button
                      key={`${emoji}-${index}`}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 text-lg hover:bg-muted min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 transition-transform"
                      onClick={() => handleEmojiSelect(emoji)}
                      title={emoji}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}

          <TabsContent value="custom" className="mt-0">
            <div className="p-2">
              <div className="flex items-center gap-2 mb-3">
                <label htmlFor="emoji-upload" className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full min-h-[44px] touch-manipulation"
                    disabled={uploadingEmoji}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingEmoji ? 'Uploading...' : 'Upload Emoji'}
                    </span>
                  </Button>
                </label>
                <input
                  id="emoji-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleCustomEmojiUpload}
                  className="hidden"
                  disabled={uploadingEmoji}
                />
              </div>

              <ScrollArea className="h-40">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filterCustomEmoji(customEmoji).map((emoji) => (
                    <Button
                      key={emoji.id}
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 p-0 hover:bg-muted relative group min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 transition-transform"
                      onClick={() => handleEmojiSelect(emoji.url, true)}
                      title={emoji.name}
                    >
                      <img
                        src={emoji.url}
                        alt={emoji.name}
                        className="h-8 w-8 object-contain"
                      />
                    </Button>
                  ))}
                </div>
                
                {customEmoji.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No custom emoji yet.
                    <br />
                    Upload some to get started!
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default ReactionPicker;