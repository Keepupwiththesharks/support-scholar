import { Play, Pause, Square, Clock, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RecordingStatus } from '@/types';
import { useState } from 'react';

interface RecordingControlsProps {
  status: RecordingStatus;
  elapsedTime: number;
  onStart: (ticketId?: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onAddNote: (note: string) => void;
}

const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const RecordingControls = ({
  status,
  elapsedTime,
  onStart,
  onPause,
  onResume,
  onStop,
  onAddNote,
}: RecordingControlsProps) => {
  const [ticketId, setTicketId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleStart = () => {
    onStart(ticketId || undefined);
    setTicketId('');
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote(noteText);
      setNoteText('');
      setShowNoteInput(false);
    }
  };

  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Clock className="w-10 h-10 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Ready to capture</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Input
            placeholder="Ticket ID (optional)"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="text-center"
          />
          <Button variant="gradient" size="xl" onClick={handleStart} className="w-full">
            <Play className="w-5 h-5" />
            Start Recording
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      <div className="flex flex-col items-center gap-2">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          status === 'recording' 
            ? 'bg-destructive shadow-recording animate-pulse-recording' 
            : 'bg-warning'
        }`}>
          <span className="text-2xl font-mono font-bold text-primary-foreground">
            {formatTime(elapsedTime)}
          </span>
        </div>
        <p className="text-sm font-medium">
          {status === 'recording' ? (
            <span className="text-destructive flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-recording" />
              Recording
            </span>
          ) : (
            <span className="text-warning">Paused</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {status === 'recording' ? (
          <Button variant="outline" size="icon-lg" onClick={onPause}>
            <Pause className="w-5 h-5" />
          </Button>
        ) : (
          <Button variant="gradient" size="icon-lg" onClick={onResume}>
            <Play className="w-5 h-5" />
          </Button>
        )}
        
        <Button variant="destructive" size="lg" onClick={onStop}>
          <Square className="w-4 h-4" />
          Stop
        </Button>

        <Button 
          variant="secondary" 
          size="icon-lg" 
          onClick={() => setShowNoteInput(!showNoteInput)}
        >
          <MessageSquarePlus className="w-5 h-5" />
        </Button>
      </div>

      {showNoteInput && (
        <div className="flex gap-2 w-full max-w-md animate-slide-up">
          <Input
            placeholder="Add a note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            autoFocus
          />
          <Button onClick={handleAddNote}>Add</Button>
        </div>
      )}
    </div>
  );
};
