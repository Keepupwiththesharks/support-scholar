import { useState, useCallback, useRef, useEffect } from 'react';
import { RecordingSession, ActivityEvent, RecordingStatus, UserProfileType, RecordingPreferences, DEFAULT_PROFILES } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Activity sources organized by tracking category
const activitySourcesByCategory = {
  trackBrowserTabs: [
    { type: 'tab' as const, source: 'Chrome', titles: ['YouTube - Tutorial Video', 'GitHub - Pull Request #234', 'Stack Overflow - Array Methods', 'Wikipedia - Research Topic', 'Google Docs - Project Notes'] },
    { type: 'tab' as const, source: 'Chrome', titles: ['Notion - Study Notes', 'Figma - Design File', 'ChatGPT - Help Query'] },
    { type: 'tab' as const, source: 'Firefox', titles: ['MDN Web Docs - JavaScript', 'Reddit - Discussion Thread', 'Arxiv - Research Paper'] },
  ],
  trackApplications: [
    { type: 'app' as const, source: 'VS Code', titles: ['src/components/App.tsx', 'package.json', 'README.md'] },
    { type: 'app' as const, source: 'Finder', titles: ['Documents/Project', 'Downloads/files', 'Desktop'] },
    { type: 'app' as const, source: 'Notes', titles: ['Meeting Notes', 'Quick Ideas', 'Todo List'] },
  ],
  trackTerminal: [
    { type: 'action' as const, source: 'Terminal', titles: ['git commit -m "fix bug"', 'npm install', 'python script.py', 'docker compose up'] },
    { type: 'action' as const, source: 'VS Code Terminal', titles: ['npm run dev', 'pnpm build', 'vitest --run'] },
  ],
  trackMessaging: [
    { type: 'message' as const, source: 'Slack', titles: ['#general - Team Update', '#dev - Code Review', 'DM - Quick Question'] },
    { type: 'message' as const, source: 'Discord', titles: ['#study-group', 'Voice: Project Meeting', 'DM with teammate'] },
    { type: 'message' as const, source: 'Teams', titles: ['Channel - Announcements', 'Chat - Support Thread'] },
  ],
  trackMeetings: [
    { type: 'app' as const, source: 'Zoom', titles: ['Team Standup', 'Client Call', '1:1 Meeting'] },
    { type: 'app' as const, source: 'Google Meet', titles: ['Project Sync', 'Interview', 'Training Session'] },
  ],
  trackDocuments: [
    { type: 'app' as const, source: 'Google Docs', titles: ['Project Proposal', 'Meeting Notes', 'Research Draft'] },
    { type: 'app' as const, source: 'Word', titles: ['Report.docx', 'Outline.docx'] },
    { type: 'app' as const, source: 'Notion', titles: ['Wiki - Documentation', 'Database - Tasks', 'Page - Notes'] },
  ],
  trackMedia: [
    { type: 'tab' as const, source: 'YouTube', titles: ['Tutorial: React Hooks', 'Lecture: Machine Learning', 'Documentary'] },
    { type: 'app' as const, source: 'Spotify', titles: ['Focus Playlist', 'Lo-fi Beats', 'Podcast Episode'] },
  ],
};

type ActivitySource = {
  type: 'tab' | 'app' | 'message' | 'action';
  source: string;
  titles: string[];
};

const getActivitySourcesForPreferences = (preferences: RecordingPreferences): ActivitySource[] => {
  const sources: ActivitySource[] = [];
  
  Object.entries(preferences).forEach(([key, enabled]) => {
    if (enabled === true && key in activitySourcesByCategory) {
      sources.push(...activitySourcesByCategory[key as keyof typeof activitySourcesByCategory]);
    }
  });
  
  return sources.length > 0 ? sources : activitySourcesByCategory.trackBrowserTabs;
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
    const sources = getActivitySourcesForPreferences(preferences);
    const source = sources[Math.floor(Math.random() * sources.length)];
    const title = source.titles[Math.floor(Math.random() * source.titles.length)];

    const newEvent: ActivityEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: source.type,
      source: source.source,
      title,
      description: `Activity captured from ${source.source}`,
      url: source.type === 'tab' ? `https://example.com/${generateId()}` : undefined,
    };

    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        events: [...prev.events, newEvent],
      };
    });
  }, [currentSession, status, getPreferences]);

  useEffect(() => {
    if (status === 'recording') {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      const preferences = getPreferences();
      const activityInterval = Math.max(2000, preferences.captureInterval * 100); // Scale for demo
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
