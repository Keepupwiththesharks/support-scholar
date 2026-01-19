export type UserProfileType = 'student' | 'developer' | 'support' | 'researcher' | 'custom';

export interface RecordingPreferences {
  trackBrowserTabs: boolean;
  trackApplications: boolean;
  trackTerminal: boolean;
  trackMessaging: boolean;
  trackMeetings: boolean;
  trackDocuments: boolean;
  trackMedia: boolean;
  captureScreenshots: boolean;
  captureInterval: number; // seconds between auto-captures
}

export interface UserProfile {
  id: string;
  name: string;
  type: UserProfileType;
  icon: string;
  description: string;
  preferences: RecordingPreferences;
  outputTemplates: string[];
}

export const DEFAULT_PROFILES: Record<UserProfileType, Omit<UserProfile, 'id'>> = {
  student: {
    name: 'Student',
    type: 'student',
    icon: '📚',
    description: 'Optimized for studying, research, and note-taking',
    preferences: {
      trackBrowserTabs: true,
      trackApplications: true,
      trackTerminal: false,
      trackMessaging: false,
      trackMeetings: true,
      trackDocuments: true,
      trackMedia: true,
      captureScreenshots: true,
      captureInterval: 30,
    },
    outputTemplates: ['study-guide', 'flashcards', 'summary'],
  },
  developer: {
    name: 'Developer',
    type: 'developer',
    icon: '💻',
    description: 'Track coding sessions, debugging, and documentation',
    preferences: {
      trackBrowserTabs: true,
      trackApplications: true,
      trackTerminal: true,
      trackMessaging: true,
      trackMeetings: true,
      trackDocuments: true,
      trackMedia: false,
      captureScreenshots: true,
      captureInterval: 15,
    },
    outputTemplates: ['dev-docs', 'changelog', 'debug-log'],
  },
  support: {
    name: 'Support Engineer',
    type: 'support',
    icon: '🎧',
    description: 'Capture troubleshooting steps and customer interactions',
    preferences: {
      trackBrowserTabs: true,
      trackApplications: true,
      trackTerminal: true,
      trackMessaging: true,
      trackMeetings: true,
      trackDocuments: true,
      trackMedia: false,
      captureScreenshots: true,
      captureInterval: 10,
    },
    outputTemplates: ['knowledge-base', 'ticket-summary', 'runbook'],
  },
  researcher: {
    name: 'Researcher',
    type: 'researcher',
    icon: '🔬',
    description: 'Deep research sessions with comprehensive tracking',
    preferences: {
      trackBrowserTabs: true,
      trackApplications: true,
      trackTerminal: false,
      trackMessaging: false,
      trackMeetings: true,
      trackDocuments: true,
      trackMedia: true,
      captureScreenshots: true,
      captureInterval: 20,
    },
    outputTemplates: ['research-notes', 'bibliography', 'findings'],
  },
  custom: {
    name: 'Custom',
    type: 'custom',
    icon: '⚙️',
    description: 'Configure your own tracking preferences',
    preferences: {
      trackBrowserTabs: true,
      trackApplications: true,
      trackTerminal: true,
      trackMessaging: true,
      trackMeetings: true,
      trackDocuments: true,
      trackMedia: true,
      captureScreenshots: true,
      captureInterval: 15,
    },
    outputTemplates: ['simple', 'detailed', 'custom'],
  },
};

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
  // Rich content captured from the activity
  content?: {
    text?: string;         // Text content, notes, or snippets
    code?: string;         // Code snippets from IDEs/terminals
    summary?: string;      // AI-generated or extracted summary
    highlights?: string[]; // Key points or highlighted text
    attachments?: string[]; // File references or links
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
  profileType?: UserProfileType;
}

export interface SavedArticle {
  id: string;
  title: string;
  summary: string;
  sections: { label: string; content: string | string[] }[];
  tags: string[];
  createdAt: Date;
  sessionId: string;
  profileType: UserProfileType;
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
  template: 'salesforce' | 'microsoft' | 'confluence' | 'custom';
}

export type RecordingStatus = 'idle' | 'recording' | 'paused';
