import { Globe, MessageSquare, Terminal, StickyNote, AppWindow } from 'lucide-react';
import { ActivityEvent } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

const getEventIcon = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'tab':
      return <Globe className="w-4 h-4" />;
    case 'message':
      return <MessageSquare className="w-4 h-4" />;
    case 'action':
      return <Terminal className="w-4 h-4" />;
    case 'note':
      return <StickyNote className="w-4 h-4" />;
    case 'app':
      return <AppWindow className="w-4 h-4" />;
    default:
      return <Globe className="w-4 h-4" />;
  }
};

const getEventColor = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'tab':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'message':
      return 'bg-success/10 text-success border-success/20';
    case 'action':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'note':
      return 'bg-accent/10 text-accent border-accent/20';
    case 'app':
      return 'bg-secondary text-secondary-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const ActivityTimeline = ({ events }: ActivityTimelineProps) => {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Globe className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">Activity will appear here as you work</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-4">
          {events.slice().reverse().map((event, index) => (
            <div 
              key={event.id} 
              className="flex gap-4 relative animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>
              
              <div className="flex-1 bg-card rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {event.source}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="font-medium mt-1 truncate">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
                  </div>
                </div>
                {event.url && (
                  <p className="text-xs text-primary mt-2 truncate font-mono">{event.url}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
