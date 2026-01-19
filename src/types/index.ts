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
  template: 'salesforce' | 'microsoft' | 'confluence' | 'custom';
}

export type RecordingStatus = 'idle' | 'recording' | 'paused';
