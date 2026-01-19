import { useState } from 'react';
import { 
  Play, Pause, Square, Zap, Clock, ChevronUp, ChevronDown,
  Mic, MicOff, Camera, CameraOff, X, GripHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type RecordingStatus = 'idle' | 'recording' | 'paused';
type WidgetPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface FloatingWidgetProps {
  position?: WidgetPosition;
  onClose?: () => void;
  onOpenPopup?: () => void;
}

export const FloatingWidget = ({ 
  position = 'bottom-right',
  onClose,
  onOpenPopup 
}: FloatingWidgetProps) => {
  const [status, setStatus] = useState<RecordingStatus>('recording');
  const [isExpanded, setIsExpanded] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(847); // 14:07
  const [eventsCount, setEventsCount] = useState(23);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenOn, setIsScreenOn] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const positionClasses: Record<WidgetPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const handleToggleRecording = () => {
    if (status === 'idle') {
      setStatus('recording');
    } else if (status === 'recording') {
      setStatus('paused');
    } else {
      setStatus('recording');
    }
  };

  const handleStop = () => {
    setStatus('idle');
    setElapsedTime(0);
    setEventsCount(0);
  };

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300",
      positionClasses[position]
    )}>
      {/* Collapsed state - just a pill */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all hover:scale-105",
            status === 'recording' 
              ? "bg-red-500 text-white" 
              : status === 'paused'
              ? "bg-yellow-500 text-white"
              : "bg-primary text-primary-foreground"
          )}
        >
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === 'recording' ? "bg-white animate-pulse" : "bg-white/50"
          )} />
          <Zap className="w-4 h-4" />
          <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
        </button>
      ) : (
        /* Expanded widget */
        <div className={cn(
          "rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm border",
          status === 'recording' 
            ? "bg-gradient-to-br from-red-500/95 to-red-600/95 border-red-400/50" 
            : status === 'paused'
            ? "bg-gradient-to-br from-yellow-500/95 to-yellow-600/95 border-yellow-400/50"
            : "bg-background/95 border-border"
        )}>
          {/* Drag handle */}
          <div className="flex items-center justify-center py-1 cursor-move opacity-50 hover:opacity-100 transition-opacity">
            <GripHorizontal className={cn(
              "w-6 h-4",
              status !== 'idle' ? "text-white" : "text-muted-foreground"
            )} />
          </div>

          {/* Main content */}
          <div className="px-4 pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  status !== 'idle' ? "bg-white/20" : "bg-primary/10"
                )}>
                  <Zap className={cn(
                    "w-5 h-5",
                    status !== 'idle' ? "text-white" : "text-primary"
                  )} />
                </div>
                <div>
                  <h3 className={cn(
                    "font-bold text-sm",
                    status !== 'idle' ? "text-white" : "text-foreground"
                  )}>
                    Recap
                  </h3>
                  <p className={cn(
                    "text-xs",
                    status !== 'idle' ? "text-white/70" : "text-muted-foreground"
                  )}>
                    {status === 'recording' ? 'Recording active' : 
                     status === 'paused' ? 'Paused' : 'Ready'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    status !== 'idle' ? "text-white hover:bg-white/20" : "hover:bg-muted"
                  )}
                  onClick={() => setIsExpanded(false)}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    status !== 'idle' ? "text-white hover:bg-white/20" : "hover:bg-muted"
                  )}
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Timer & Stats */}
            <div className={cn(
              "rounded-xl p-3 mb-3",
              status !== 'idle' ? "bg-white/10" : "bg-muted"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className={cn(
                    "w-4 h-4",
                    status !== 'idle' ? "text-white" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-mono text-2xl font-bold",
                    status !== 'idle' ? "text-white" : "text-foreground"
                  )}>
                    {formatTime(elapsedTime)}
                  </span>
                </div>
                <Badge className={cn(
                  "font-mono",
                  status !== 'idle' 
                    ? "bg-white/20 text-white hover:bg-white/30" 
                    : "bg-primary/10 text-primary"
                )}>
                  {eventsCount} events
                </Badge>
              </div>

              {/* Recording indicator */}
              {status === 'recording' && (
                <div className="flex items-center gap-2 mt-2 text-white/80 text-xs">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Capturing from 3 tabs</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                className={cn(
                  "flex-1 h-10",
                  status === 'recording' 
                    ? "bg-white text-red-500 hover:bg-white/90" 
                    : status === 'paused'
                    ? "bg-white text-yellow-600 hover:bg-white/90"
                    : "bg-primary text-primary-foreground"
                )}
                onClick={handleToggleRecording}
              >
                {status === 'recording' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : status === 'paused' ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              
              {status !== 'idle' && (
                <Button
                  variant="outline"
                  className="h-10 border-white/30 text-white hover:bg-white/20"
                  onClick={handleStop}
                >
                  <Square className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Quick toggles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    status !== 'idle' 
                      ? isMicOn 
                        ? "bg-white/20 text-white" 
                        : "text-white/50 hover:bg-white/10"
                      : isMicOn
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsMicOn(!isMicOn)}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    status !== 'idle' 
                      ? isScreenOn 
                        ? "bg-white/20 text-white" 
                        : "text-white/50 hover:bg-white/10"
                      : isScreenOn
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsScreenOn(!isScreenOn)}
                >
                  {isScreenOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 text-xs",
                  status !== 'idle' ? "text-white/70 hover:text-white hover:bg-white/10" : ""
                )}
                onClick={onOpenPopup}
              >
                Open full panel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
