import { useState, useCallback, useRef, useEffect } from 'react';
import { RecordingSession, ActivityEvent, RecordingStatus, UserProfileType, RecordingPreferences, DEFAULT_PROFILES } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Rich content templates for each source type
const contentTemplates = {
  'VS Code': {
    code: [
      `const handleSubmit = async (data) => {\n  try {\n    await api.post('/submit', data);\n    toast.success('Saved!');\n  } catch (err) {\n    console.error(err);\n  }\n};`,
      `interface User {\n  id: string;\n  name: string;\n  email: string;\n  role: 'admin' | 'user';\n}`,
      `export const useAuth = () => {\n  const [user, setUser] = useState(null);\n  // Authentication logic\n};`,
    ],
    text: ['Refactoring component structure', 'Adding error handling', 'Implementing new feature'],
  },
  'GitHub': {
    text: [
      'PR #234: Fix authentication bug - Resolved issue where users were logged out unexpectedly',
      'Issue #89: Add dark mode support - Implementing theme switching functionality',
      'Merged: Update dependencies to latest versions',
    ],
    highlights: ['2 files changed', '15 additions, 3 deletions', 'All checks passed'],
  },
  'Terminal': {
    code: [
      '$ npm run build\n✓ Compiled successfully in 2.3s\n✓ 47 modules transformed',
      '$ git status\nmodified: src/App.tsx\nnew file: src/hooks/useAuth.ts',
      '$ docker ps\nCONTAINER ID   IMAGE      STATUS\na1b2c3d4e5f6   postgres   Up 2 hours',
    ],
    text: ['Build completed', 'Tests passing', 'Deployment started'],
  },
  'YouTube': {
    text: [
      'React 19 New Features Explained - Server Components, Actions, and More',
      'Building a Full-Stack App with TypeScript - Complete Tutorial',
      'Machine Learning Fundamentals - Lecture 5: Neural Networks',
    ],
    summary: ['Key topics: hooks, state management, performance optimization'],
    highlights: ['Timestamps: 0:00 Intro, 5:30 Setup, 15:00 Implementation'],
  },
  'Notion': {
    text: [
      '## Project Roadmap\n- Phase 1: MVP Development\n- Phase 2: User Testing\n- Phase 3: Launch',
      '### Meeting Notes\nAttendees: Team leads\nDecisions: Approved new architecture',
      '**Key Insights**\n1. User engagement up 25%\n2. Retention improved',
    ],
    highlights: ['Action items identified', 'Deadlines confirmed', 'Resources allocated'],
  },
  'Slack': {
    text: [
      '@team: Deployed v2.1 to staging. Please test the new dashboard features.',
      'Quick question - has anyone seen issues with the API rate limiting?',
      'FYI: Standup moved to 10am tomorrow due to client call',
    ],
    summary: ['Team coordination', 'Issue discussion', 'Schedule update'],
  },
  'Discord': {
    text: [
      'Great progress on the study group project! Next meeting Thursday.',
      'Anyone else stuck on chapter 5? The recursion examples are tricky.',
      'Shared resource: https://docs.example.com/guide',
    ],
    highlights: ['Study tips shared', 'Resources linked', 'Questions answered'],
  },
  'Google Docs': {
    text: [
      '## Research Proposal\nThis study aims to investigate the effects of...',
      '### Executive Summary\nKey findings indicate a 30% improvement in...',
      '**Draft Outline**\n1. Introduction\n2. Methodology\n3. Results\n4. Discussion',
    ],
    highlights: ['Key arguments outlined', 'Citations added', 'Peer review comments'],
  },
  'Zoom': {
    text: [
      'Meeting Summary: Discussed Q3 roadmap priorities and resource allocation',
      'Action items: Follow up with design team, schedule user testing sessions',
      'Key decision: Moving to bi-weekly sprint cycles starting next month',
    ],
    summary: ['45 minute call', '6 participants', 'Recording available'],
  },
  'Salesforce': {
    text: [
      'Case #00123456: Customer reporting login issues after password reset',
      'Knowledge Article: Troubleshooting SSO Configuration',
      'Account: Acme Corp - Enterprise tier - Annual renewal in 30 days',
    ],
    highlights: ['Priority: High', 'SLA: 4 hours', 'Escalated to Tier 2'],
  },
  'Jira': {
    text: [
      'PROJ-1234: Implement user authentication - In Progress',
      'Sprint 14: 8 story points completed, 5 remaining',
      'Bug: PROJ-1240 - Fix memory leak in dashboard component',
    ],
    highlights: ['Due date: Friday', 'Assigned to: Dev Team', 'Blocked by: API team'],
  },
};

// Activity sources organized by tracking category
const activitySourcesByCategory = {
  trackBrowserTabs: [
    { type: 'tab' as const, source: 'YouTube', titles: ['React Tutorial - Full Course', 'TypeScript Best Practices', 'Machine Learning Lecture'] },
    { type: 'tab' as const, source: 'GitHub', titles: ['Pull Request #234 - Fix auth bug', 'Issue #89 - Dark mode', 'Repository: project-x'] },
    { type: 'tab' as const, source: 'Stack Overflow', titles: ['How to handle async errors in React?', 'TypeScript generics explained'] },
    { type: 'tab' as const, source: 'Notion', titles: ['Project Roadmap Q4', 'Meeting Notes - Team Sync', 'Research Database'] },
  ],
  trackApplications: [
    { type: 'app' as const, source: 'VS Code', titles: ['src/components/App.tsx', 'hooks/useAuth.ts', 'package.json'] },
    { type: 'app' as const, source: 'Finder', titles: ['Documents/Project Files', 'Downloads/Resources', 'Desktop/Screenshots'] },
    { type: 'app' as const, source: 'Notes', titles: ['Quick Ideas', 'Todo List', 'Meeting Notes'] },
  ],
  trackTerminal: [
    { type: 'action' as const, source: 'Terminal', titles: ['git commit -m "fix: auth bug"', 'npm run build', 'docker compose up'] },
    { type: 'action' as const, source: 'VS Code Terminal', titles: ['npm run dev', 'vitest --run', 'pnpm lint'] },
  ],
  trackMessaging: [
    { type: 'message' as const, source: 'Slack', titles: ['#engineering - Deployment update', '#general - Team announcement', 'DM - Quick sync'] },
    { type: 'message' as const, source: 'Discord', titles: ['#study-group - Question', 'Voice: Project discussion', 'DM - Resource sharing'] },
    { type: 'message' as const, source: 'Teams', titles: ['Channel - Sprint planning', 'Chat - Code review feedback'] },
  ],
  trackMeetings: [
    { type: 'app' as const, source: 'Zoom', titles: ['Team Standup', 'Client Presentation', '1:1 with Manager'] },
    { type: 'app' as const, source: 'Google Meet', titles: ['Project Kickoff', 'Design Review', 'Interview - Sr. Developer'] },
  ],
  trackDocuments: [
    { type: 'app' as const, source: 'Google Docs', titles: ['Research Proposal Draft', 'Technical Spec v2', 'Meeting Minutes'] },
    { type: 'app' as const, source: 'Notion', titles: ['Wiki - API Documentation', 'Database - User Stories', 'Page - Architecture'] },
    { type: 'app' as const, source: 'Word', titles: ['Report_Q3.docx', 'Proposal_Final.docx'] },
  ],
  trackMedia: [
    { type: 'tab' as const, source: 'YouTube', titles: ['Tutorial: Advanced React Patterns', 'Lecture: Data Structures', 'Conference: Tech Talk 2024'] },
    { type: 'app' as const, source: 'Spotify', titles: ['Focus Playlist', 'Coding Beats', 'Tech Podcast'] },
  ],
};

// Support-specific sources
const supportSources = [
  { type: 'app' as const, source: 'Salesforce', titles: ['Case #00123456 - Login Issue', 'Knowledge Base - SSO Setup', 'Account: Enterprise Client'] },
  { type: 'app' as const, source: 'Jira', titles: ['SUPPORT-456 - Escalation', 'Sprint Board - Support Queue', 'Bug: PROD-789'] },
  { type: 'message' as const, source: 'Zendesk', titles: ['Ticket #12345 - Password Reset', 'Customer Chat - Billing Question'] },
];

type ActivitySource = {
  type: 'tab' | 'app' | 'message' | 'action';
  source: string;
  titles: string[];
};

const getActivitySourcesForPreferences = (preferences: RecordingPreferences, profileType?: UserProfileType): ActivitySource[] => {
  const sources: ActivitySource[] = [];
  
  Object.entries(preferences).forEach(([key, enabled]) => {
    if (enabled === true && key in activitySourcesByCategory) {
      sources.push(...activitySourcesByCategory[key as keyof typeof activitySourcesByCategory]);
    }
  });
  
  // Add support-specific sources for support profile
  if (profileType === 'support') {
    sources.push(...supportSources);
  }
  
  return sources.length > 0 ? sources : activitySourcesByCategory.trackBrowserTabs;
};

const getContentForSource = (source: string): ActivityEvent['content'] => {
  const templates = contentTemplates[source as keyof typeof contentTemplates] as {
    code?: string[];
    text?: string[];
    summary?: string[];
    highlights?: string[];
  } | undefined;
  
  if (!templates) {
    return {
      text: 'Activity captured',
      summary: `Recorded from ${source}`,
    };
  }
  
  const content: ActivityEvent['content'] = {};
  
  if (templates.code) {
    content.code = templates.code[Math.floor(Math.random() * templates.code.length)];
  }
  if (templates.text) {
    content.text = templates.text[Math.floor(Math.random() * templates.text.length)];
  }
  if (templates.summary) {
    content.summary = templates.summary[Math.floor(Math.random() * templates.summary.length)];
  }
  if (templates.highlights) {
    const numHighlights = Math.floor(Math.random() * 3) + 1;
    content.highlights = templates.highlights.slice(0, numHighlights);
  }
  
  return content;
};

interface UseRecordingOptions {
  profileType?: UserProfileType;
  customPreferences?: RecordingPreferences;
}

export const useRecording = (options?: UseRecordingOptions) => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(null);
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPreferences = useCallback((): RecordingPreferences => {
    if (options?.profileType === 'custom' && options?.customPreferences) {
      return options.customPreferences;
    }
    return DEFAULT_PROFILES[options?.profileType || 'developer'].preferences;
  }, [options?.profileType, options?.customPreferences]);

  const simulateActivity = useCallback(() => {
    if (!currentSession || status !== 'recording') return;

    const preferences = getPreferences();
    const sources = getActivitySourcesForPreferences(preferences, options?.profileType);
    const source = sources[Math.floor(Math.random() * sources.length)];
    const title = source.titles[Math.floor(Math.random() * source.titles.length)];
    const content = getContentForSource(source.source);

    const newEvent: ActivityEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: source.type,
      source: source.source,
      title,
      description: content.text || `Activity captured from ${source.source}`,
      url: source.type === 'tab' ? `https://example.com/${generateId()}` : undefined,
      content,
    };

    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        events: [...prev.events, newEvent],
      };
    });
  }, [currentSession, status, getPreferences, options?.profileType]);

  useEffect(() => {
    if (status === 'recording') {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      const preferences = getPreferences();
      const activityInterval = Math.max(2000, preferences.captureInterval * 100);
      activityIntervalRef.current = setInterval(simulateActivity, activityInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
        activityIntervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (activityIntervalRef.current) clearInterval(activityIntervalRef.current);
    };
  }, [status, simulateActivity, getPreferences]);

  const startRecording = useCallback((ticketId?: string) => {
    const session: RecordingSession = {
      id: generateId(),
      name: ticketId ? `Session for ${ticketId}` : `Recording ${new Date().toLocaleString()}`,
      startTime: new Date(),
      status: 'recording',
      events: [],
      ticketId,
      tags: [],
      profileType: options?.profileType,
    };

    setCurrentSession(session);
    setStatus('recording');
    setElapsedTime(0);
  }, [options?.profileType]);

  const pauseRecording = useCallback(() => {
    setStatus('paused');
    setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : prev);
  }, []);

  const resumeRecording = useCallback(() => {
    setStatus('recording');
    setCurrentSession(prev => prev ? { ...prev, status: 'recording' } : prev);
  }, []);

  const stopRecording = useCallback(() => {
    if (currentSession) {
      const completedSession: RecordingSession = {
        ...currentSession,
        endTime: new Date(),
        status: 'completed',
      };
      setSessions(prev => [completedSession, ...prev]);
      setCurrentSession(null);
    }
    setStatus('idle');
    setElapsedTime(0);
  }, [currentSession]);

  const addNote = useCallback((note: string) => {
    if (!currentSession) return;

    const noteEvent: ActivityEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'note',
      source: 'User',
      title: 'Note',
      description: note,
      content: {
        text: note,
        summary: 'User added note',
      },
    };

    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        events: [...prev.events, noteEvent],
      };
    });
  }, [currentSession]);

  return {
    status,
    currentSession,
    sessions,
    elapsedTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    addNote,
  };
};
