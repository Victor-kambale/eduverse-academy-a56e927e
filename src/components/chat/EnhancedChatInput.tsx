import { useState, useRef } from 'react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Image, 
  File, 
  Camera,
  Mic,
  Gift,
  Sticker,
  X,
  StopCircle,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface EnhancedChatInputProps {
  onSendMessage: (message: string, attachments?: any[]) => void;
  disabled?: boolean;
  enableEmoji?: boolean;
  enableAttachments?: boolean;
  enableVoice?: boolean;
  enableGifts?: boolean;
  enableStickers?: boolean;
}

const emojiCategories = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘'],
  'Gestures': ['👍', '👎', '👏', '🙌', '🤝', '👋', '✋', '🤞', '✌️', '🤟', '🤙', '👌', '🙏', '💪', '🎉'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💗', '💖', '💝', '💘', '💕', '💞', '💓'],
  'Objects': ['🎁', '🎂', '🎉', '🎊', '🏆', '🎯', '📚', '💼', '📧', '💻', '📱', '⭐', '🌟', '💡', '🔥']
};

const stickers = [
  { id: 'congrats', emoji: '🎉', label: 'Congratulations!' },
  { id: 'thanks', emoji: '🙏', label: 'Thank you!' },
  { id: 'love', emoji: '❤️', label: 'Love it!' },
  { id: 'fire', emoji: '🔥', label: 'Amazing!' },
  { id: 'star', emoji: '⭐', label: 'Great job!' },
  { id: 'party', emoji: '🥳', label: 'Party time!' },
  { id: 'trophy', emoji: '🏆', label: 'Winner!' },
  { id: 'rocket', emoji: '🚀', label: 'To the moon!' },
];

const giftOptions = [
  { id: 'flower', emoji: '🌹', label: 'Rose', value: 5 },
  { id: 'heart', emoji: '💖', label: 'Heart', value: 10 },
  { id: 'star', emoji: '⭐', label: 'Star', value: 15 },
  { id: 'diamond', emoji: '💎', label: 'Diamond', value: 25 },
  { id: 'crown', emoji: '👑', label: 'Crown', value: 50 },
  { id: 'rocket', emoji: '🚀', label: 'Rocket', value: 100 },
];

export function EnhancedChatInput({
  onSendMessage,
  disabled = false,
  enableEmoji = true,
  enableAttachments = true,
  enableVoice = true,
  enableGifts = true,
  enableStickers = true
}: EnhancedChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    onSendMessage(message, attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
      toast.success(`${files.length} ${type}(s) attached`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleStickerClick = (sticker: typeof stickers[0]) => {
    onSendMessage(`[Sticker: ${sticker.label}] ${sticker.emoji}`);
  };

  const handleGiftClick = (gift: typeof giftOptions[0]) => {
    toast.success(`Gift sent: ${gift.label} (${gift.value} coins)`);
    onSendMessage(`[Gift: ${gift.label}] ${gift.emoji}`);
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      toast.info('Recording started...');
    } catch (error) {
      toast.error('Could not start recording');
    }
  };

  const stopRecording = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    setIsRecording(false);
    toast.success(`Voice message recorded (${recordingTime}s)`);
    onSendMessage(`[Voice Message: ${recordingTime}s] 🎤`);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t p-4 space-y-3">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {attachments.map((file, index) => (
            <div key={index} className="relative group bg-muted rounded-lg p-2 pr-8">
              <span className="text-sm truncate max-w-[150px] block">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-600 font-medium">Recording... {formatTime(recordingTime)}</span>
          <Button size="sm" variant="destructive" onClick={stopRecording}>
            <StopCircle className="h-4 w-4 mr-1" />
            Stop
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Attachments Menu */}
        {enableAttachments && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled}>
                <Paperclip className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Photos & Videos
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <File className="h-4 w-4 mr-2" />
                  Documents
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Emoji Picker */}
        {enableEmoji && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled}>
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category}>
                    <p className="text-xs font-medium text-muted-foreground mb-2">{category}</p>
                    <div className="grid grid-cols-8 gap-1">
                      {emojis.map((emoji, i) => (
                        <button
                          key={i}
                          onClick={() => handleEmojiClick(emoji)}
                          className="text-xl hover:bg-muted rounded p-1 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Stickers */}
        {enableStickers && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled}>
                <Sticker className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <p className="text-sm font-medium mb-3">Stickers</p>
              <div className="grid grid-cols-4 gap-2">
                {stickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => handleStickerClick(sticker)}
                    className="text-3xl hover:bg-muted rounded-lg p-2 transition-colors flex flex-col items-center"
                    title={sticker.label}
                  >
                    {sticker.emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Gifts */}
        {enableGifts && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled}>
                <Gift className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3">
              <p className="text-sm font-medium mb-3">Send a Gift</p>
              <div className="grid grid-cols-3 gap-2">
                {giftOptions.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => handleGiftClick(gift)}
                    className="hover:bg-muted rounded-lg p-3 transition-colors flex flex-col items-center gap-1"
                  >
                    <span className="text-3xl">{gift.emoji}</span>
                    <span className="text-xs font-medium">{gift.label}</span>
                    <span className="text-xs text-amber-600">{gift.value} coins</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Voice Recording */}
        {enableVoice && (
          <Button
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            disabled={disabled}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        )}

        {/* Message Input */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={disabled || isRecording}
          className="flex-1"
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'file')}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'image')}
        accept="image/*,video/*"
      />
    </div>
  );
}
