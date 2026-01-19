import { Play, Pause, Square, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RecordingStatus } from '@/types';
import { useState } from 'react';
import { QuickCaptureButtons } from './QuickCaptureButtons';
import { ActivityCaptureModal } from './ActivityCaptureModal';
import { CaptureTabInput, CaptureCodeInput, CaptureNoteInput, CaptureMeetingInput } from '@/hooks/useRecording';

type CaptureType = 'tab' | 'code' | 'note' | 'meeting';

interface RecordingControlsProps {
  status: RecordingStatus;
  elapsedTime: number;
  onStart: (sessionName?: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCaptureTab: (input: CaptureTabInput) => Promise<void>;
  onCaptureCode: (input: CaptureCodeInput) => void;
  onCaptureNote: (input: CaptureNoteInput) => void;
  onCaptureMeeting: (input: CaptureMeetingInput) => void;
  onCaptureClipboard: () => Promise<void>;
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
  onCaptureTab,
  onCaptureCode,
  onCaptureNote,
  onCaptureMeeting,
  onCaptureClipboard,
}: RecordingControlsProps) => {
  const [sessionName, setSessionName] = useState('');
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [captureType, setCaptureType] = useState<CaptureType>('tab');

  const handleStart = () => {
    onStart(sessionName || undefined);
    setSessionName('');
  };

  const placeholderText = "Session name (e.g., 'React tutorial', 'Debug login')";

  const openCaptureModal = (type: CaptureType) => {
    setCaptureType(type);
    setShowCaptureModal(true);
  };

  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Clock className="w-10 h-10 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Ready to capture your workflow</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Input
            placeholder={placeholderText}
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="text-center"
          />
          <Button variant="gradient" size="xl" onClick={handleStart} className="w-full">
            <Play className="w-5 h-5" />
            Start Session
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
      </div>

      {/* Quick Capture Buttons */}
      <QuickCaptureButtons
        onCaptureTab={() => openCaptureModal('tab')}
        onCaptureCode={() => openCaptureModal('code')}
        onCaptureNote={() => openCaptureModal('note')}
        onCaptureMeeting={() => openCaptureModal('meeting')}
        onCaptureClipboard={onCaptureClipboard}
        disabled={status === 'paused'}
      />

      {/* Capture Modal */}
      <ActivityCaptureModal
        open={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        defaultType={captureType}
        onCaptureTab={onCaptureTab}
        onCaptureCode={onCaptureCode}
        onCaptureNote={onCaptureNote}
        onCaptureMeeting={onCaptureMeeting}
      />
    </div>
  );
};
