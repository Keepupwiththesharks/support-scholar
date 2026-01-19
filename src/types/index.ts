export interface ActivityEvent {
  id: string;
  timestamp: Date;
  type: 'tab' | 'app' | 'message' | 'action' | 'note';
  source: string;
  title: string;
  description: string;
  url?: string;
  screenshot?: string;
  metadata?: Record<string, unknown>;
  content?: {
    text?: string;
    code?: string;
    summary?: string;
    highlights?: string[];
    attachments?: string[];
  };
}

export interface RecordingSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  status: 'recording' | 'paused' | 'completed';
  events: ActivityEvent[];
  ticketId?: string;
  tags: string[];
}

export interface SavedArticle {
  id: string;
  title: string;
  summary: string;
  sections: { label: string; content: string | string[] }[];
  tags: string[];
  createdAt: Date;
  sessionId: string;
  templateType: string;
  templateLabel: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  steps: string[];
  relatedLinks: string[];
  tags: string[];
  createdAt: Date;
  sessionId: string;
  template: string;
}

export type RecordingStatus = 'idle' | 'recording' | 'paused';
