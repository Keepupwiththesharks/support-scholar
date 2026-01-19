import { useState, useCallback, useRef, useEffect } from 'react';
import { RecordingSession, ActivityEvent, RecordingStatus } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Rich content templates for each source type
const contentTemplates: Record<string, { code?: string[]; text?: string[]; summary?: string[]; highlights?: string[] }> = {
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
};

// Activity sources for simulation
type ActivitySource = {
  type: 'tab' | 'app' | 'message' | 'action';
  source: string;
  titles: string[];
};

const activitySources: ActivitySource[] = [
  { type: 'tab', source: 'YouTube', titles: ['React Tutorial - Full Course', 'TypeScript Best Practices', 'Machine Learning Lecture'] },
  { type: 'tab', source: 'GitHub', titles: ['Pull Request #234 - Fix auth bug', 'Issue #89 - Dark mode', 'Repository: project-x'] },
  { type: 'tab', source: 'Stack Overflow', titles: ['How to handle async errors in React?', 'TypeScript generics explained'] },
  { type: 'tab', source: 'Notion', titles: ['Project Roadmap Q4', 'Meeting Notes - Team Sync', 'Research Database'] },
  { type: 'app', source: 'VS Code', titles: ['src/components/App.tsx', 'hooks/useAuth.ts', 'package.json'] },
  { type: 'app', source: 'Finder', titles: ['Documents/Project Files', 'Downloads/Resources', 'Desktop/Screenshots'] },
  { type: 'action', source: 'Terminal', titles: ['git commit -m "fix: auth bug"', 'npm run build', 'docker compose up'] },
  { type: 'message', source: 'Slack', titles: ['#engineering - Deployment update', '#general - Team announcement', 'DM - Quick sync'] },
  { type: 'app', source: 'Zoom', titles: ['Team Standup', 'Client Presentation', '1:1 with Manager'] },
  { type: 'app', source: 'Google Docs', titles: ['Research Proposal Draft', 'Technical Spec v2', 'Meeting Minutes'] },
];

const getContentForSource = (source: string): ActivityEvent['content'] => {
  const templates = contentTemplates[source];
  
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

export const useRecording = () => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(null);
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const simulateActivity = useCallback(() => {
    if (!currentSession || status !== 'recording') return;

    const source = activitySources[Math.floor(Math.random() * activitySources.length)];
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
  }, [currentSession, status]);

  useEffect(() => {
    if (status === 'recording') {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      // Simulate activity every 2-4 seconds
      activityIntervalRef.current = setInterval(simulateActivity, 2500);
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
  }, [status, simulateActivity]);

  const startRecording = useCallback((ticketId?: string) => {
    const session: RecordingSession = {
      id: generateId(),
      name: ticketId ? `Session for ${ticketId}` : `Recording ${new Date().toLocaleString()}`,
      startTime: new Date(),
      status: 'recording',
      events: [],
      ticketId,
      tags: [],
    };

    setCurrentSession(session);
    setStatus('recording');
    setElapsedTime(0);
  }, []);

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
