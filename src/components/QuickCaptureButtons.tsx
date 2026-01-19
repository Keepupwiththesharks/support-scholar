import { Globe, Code, FileText, Users, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface QuickCaptureButtonsProps {
  onCaptureTab: () => void;
  onCaptureCode: () => void;
  onCaptureNote: () => void;
  onCaptureMeeting: () => void;
  onCaptureClipboard: () => Promise<void>;
  disabled?: boolean;
}

export const QuickCaptureButtons = ({
  onCaptureTab,
  onCaptureCode,
  onCaptureNote,
  onCaptureMeeting,
  onCaptureClipboard,
  disabled = false,
}: QuickCaptureButtonsProps) => {
  const handleClipboard = async () => {
    try {
      await onCaptureClipboard();
      toast.success('Captured from clipboard!');
    } catch {
      toast.error('Failed to read clipboard');
    }
  };

  const buttons = [
    { icon: Globe, label: 'Add Tab/URL', action: onCaptureTab, color: 'text-blue-500' },
    { icon: Code, label: 'Add Code', action: onCaptureCode, color: 'text-green-500' },
    { icon: FileText, label: 'Add Note', action: onCaptureNote, color: 'text-yellow-500' },
    { icon: Users, label: 'Add Meeting', action: onCaptureMeeting, color: 'text-purple-500' },
    { icon: Clipboard, label: 'Paste & Capture', action: handleClipboard, color: 'text-orange-500' },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-xl border">
        <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">Quick Add:</span>
        {buttons.map(({ icon: Icon, label, action, color }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={action}
                disabled={disabled}
                className={`h-9 w-9 hover:bg-background ${disabled ? 'opacity-50' : ''}`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
