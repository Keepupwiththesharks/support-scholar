import { Clock, Calendar, Tag, FileText, ChevronRight } from 'lucide-react';
import { RecordingSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SessionCardProps {
  session: RecordingSession;
  onGenerateArticle: (session: RecordingSession) => void;
}

const formatDuration = (start: Date, end?: Date): string => {
  const endTime = end || new Date();
  const diff = Math.floor((endTime.getTime() - start.getTime()) / 1000);
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return `${mins}m ${secs}s`;
};

export const SessionCard = ({ session, onGenerateArticle }: SessionCardProps) => {
  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{session.name}</h3>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {session.startTime.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDuration(session.startTime, session.endTime)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="font-mono text-xs">
              {session.events.length} events
            </Badge>
            {session.ticketId && (
              <Badge variant="outline" className="font-mono text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {session.ticketId}
              </Badge>
            )}
          </div>
        </div>

        <Button 
          variant="gradient" 
          size="sm"
          onClick={() => onGenerateArticle(session)}
          className="shrink-0"
        >
          <FileText className="w-4 h-4" />
          Generate Article
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
