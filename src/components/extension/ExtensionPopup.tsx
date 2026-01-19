import { useState } from 'react';
import { 
  Play, Pause, Square, Settings, Clock, Globe, FileText, 
  ChevronRight, Zap, BarChart3, User, LogOut, Minimize2,
  Maximize2, Eye, EyeOff, Bell, BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExtensionPopupProps {
  onOpenSettings?: () => void;
  onOpenDashboard?: () => void;
}

type RecordingStatus = 'idle' | 'recording' | 'paused';

interface TrackedTab {
  id: number;
  title: string;
  url: string;
  favicon: string;
  isTracking: boolean;
  eventsCount: number;
}

interface RecentActivity {
  id: string;
  type: 'tab' | 'action' | 'note' | 'app';
  title: string;
  source: string;
  timestamp: Date;
}

export const ExtensionPopup = ({ onOpenSettings, onOpenDashboard }: ExtensionPopupProps) => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [sessionName, setSessionName] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Mock data
  const [trackedTabs] = useState<TrackedTab[]>([
    { id: 1, title: 'React Documentation', url: 'react.dev', favicon: '⚛️', isTracking: true, eventsCount: 12 },
    { id: 2, title: 'GitHub - project', url: 'github.com', favicon: '🐙', isTracking: true, eventsCount: 8 },
    { id: 3, title: 'Stack Overflow', url: 'stackoverflow.com', favicon: '📚', isTracking: false, eventsCount: 0 },
    { id: 4, title: 'YouTube Tutorial', url: 'youtube.com', favicon: '▶️', isTracking: true, eventsCount: 5 },
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    { id: '1', type: 'tab', title: 'Opened React Hooks Guide', source: 'react.dev', timestamp: new Date() },
    { id: '2', type: 'action', title: 'Copied code snippet', source: 'GitHub', timestamp: new Date(Date.now() - 60000) },
    { id: '3', type: 'note', title: 'Bookmarked useEffect patterns', source: 'react.dev', timestamp: new Date(Date.now() - 120000) },
    { id: '4', type: 'app', title: 'Switched to VS Code', source: 'VS Code', timestamp: new Date(Date.now() - 180000) },
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setStatus('recording');
    setSessionName(`Session ${new Date().toLocaleTimeString()}`);
    // Simulate time passing
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      if (Math.random() > 0.7) setEventsCount(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  };

  const handlePauseRecording = () => {
    setStatus(status === 'paused' ? 'recording' : 'paused');
  };

  const handleStopRecording = () => {
    setStatus('idle');
    setElapsedTime(0);
    setEventsCount(0);
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'tab': return '🌐';
      case 'action': return '⚡';
      case 'note': return '📝';
      case 'app': return '💻';
    }
  };

  return (
    <div className="w-[360px] bg-background border rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Recap</h1>
              <p className="text-xs opacity-80">Activity Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              onClick={onOpenSettings}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Recording Status */}
        <div className={cn(
          "rounded-lg p-3 transition-all",
          status === 'recording' ? "bg-red-500/20" :
          status === 'paused' ? "bg-yellow-500/20" :
          "bg-white/10"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                status === 'recording' ? "bg-red-400 animate-pulse" :
                status === 'paused' ? "bg-yellow-400" :
                "bg-white/50"
              )} />
              <span className="font-medium text-sm">
                {status === 'idle' ? 'Ready to Record' :
                 status === 'recording' ? 'Recording...' : 'Paused'}
              </span>
            </div>
            {status !== 'idle' && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>

          {status !== 'idle' && (
            <div className="flex items-center gap-2 text-xs opacity-80">
              <span>{eventsCount} events captured</span>
              <span>•</span>
              <span>{sessionName}</span>
            </div>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Recording Controls */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-center gap-3">
              {status === 'idle' ? (
                <Button 
                  className="flex-1 h-12 text-lg gap-2" 
                  variant="gradient"
                  onClick={handleStartRecording}
                >
                  <Play className="w-5 h-5" />
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="h-12 w-12"
                    onClick={handlePauseRecording}
                  >
                    {status === 'paused' ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 h-12 gap-2"
                    onClick={handleStopRecording}
                  >
                    <Square className="w-5 h-5" />
                    Stop & Generate
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="tabs" className="flex-1">
            <TabsList className="w-full grid grid-cols-3 p-1 mx-4 mt-3" style={{ width: 'calc(100% - 32px)' }}>
              <TabsTrigger value="tabs" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Tabs ({trackedTabs.filter(t => t.isTracking).length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="quick" className="text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Quick
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tabs" className="mt-0 p-4">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {trackedTabs.map((tab) => (
                    <div 
                      key={tab.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                        tab.isTracking ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                      )}
                    >
                      <span className="text-lg">{tab.favicon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tab.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{tab.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {tab.isTracking && tab.eventsCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {tab.eventsCount}
                          </Badge>
                        )}
                        <Switch checked={tab.isTracking} />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="activity" className="mt-0 p-4">
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{activity.source}</span>
                          <span>•</span>
                          <span>{Math.floor((Date.now() - activity.timestamp.getTime()) / 60000)}m ago</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="quick" className="mt-0 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Auto-capture</span>
                  </div>
                  <Switch checked={autoCapture} onCheckedChange={setAutoCapture} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Notifications</span>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Storage used</span>
                    <span className="font-medium">2.4 MB / 50 MB</span>
                  </div>
                  <Progress value={4.8} className="h-2" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={onOpenDashboard}
            >
              <BarChart3 className="w-4 h-4" />
              Open Dashboard
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
