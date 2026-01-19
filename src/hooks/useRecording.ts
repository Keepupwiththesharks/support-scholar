import { useState, useCallback, useRef, useEffect } from 'react';
import { RecordingSession, ActivityEvent, RecordingStatus } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Simulated activity sources for demo
const activitySources = [
  { type: 'tab' as const, source: 'Chrome', titles: ['Salesforce - Case #12345', 'AWS Console - EC2 Instances', 'Stack Overflow - React Hooks'] },
  { type: 'app' as const, source: 'Slack', titles: ['#support-team', 'DM with John', '@engineering-alerts'] },
  { type: 'message' as const, source: 'Slack', titles: ['Discussing server logs', 'Sharing error screenshot', 'Confirming fix deployed'] },
  { type: 'action' as const, source: 'Terminal', titles: ['kubectl get pods', 'docker logs container', 'ssh production-server'] },
];

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
  }, [currentSession, status]);

  useEffect(() => {
    if (status === 'recording') {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      activityIntervalRef.current = setInterval(simulateActivity, 3000);
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
