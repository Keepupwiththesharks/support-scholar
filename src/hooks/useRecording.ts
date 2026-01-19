import { useState, useCallback, useRef, useEffect } from 'react';
import { RecordingSession, ActivityEvent, RecordingStatus } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

export interface CaptureTabInput {
  url: string;
  title?: string;
  description?: string;
}

export interface CaptureCodeInput {
  code: string;
  language?: string;
  source?: string;
  description?: string;
}

export interface CaptureNoteInput {
  text: string;
  title?: string;
}

export interface CaptureMeetingInput {
  title: string;
  attendees?: string;
  notes?: string;
  actionItems?: string[];
}

export interface CaptureFromClipboardResult {
  type: 'url' | 'code' | 'text';
  content: string;
}

// Detect content type from clipboard text
const detectContentType = (text: string): 'url' | 'code' | 'text' => {
  // Check if URL
  try {
    new URL(text.trim());
    return 'url';
  } catch {}
  
  // Check if code-like (contains common code patterns)
  const codePatterns = [
    /^(import|export|const|let|var|function|class|interface|type)\s/m,
    /[{}();]\s*$/m,
    /=>/,
    /^\s*(def|class|import|from|if __name__)/m,
    /^\s*<[a-zA-Z][^>]*>/m,
  ];
  
  if (codePatterns.some(pattern => pattern.test(text))) {
    return 'code';
  }
  
  return 'text';
};

// Fetch page metadata from URL
const fetchUrlMetadata = async (url: string): Promise<{ title: string; description: string }> => {
  try {
    // Use a simple approach - in production you'd use a backend service
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    return {
      title: data.data?.title || new URL(url).hostname,
      description: data.data?.description || '',
    };
  } catch {
    try {
      return {
        title: new URL(url).hostname,
        description: '',
      };
    } catch {
      return { title: url, description: '' };
    }
  }
};

export const useRecording = () => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(null);
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'recording') {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const startRecording = useCallback((sessionName?: string) => {
    const session: RecordingSession = {
      id: generateId(),
      name: sessionName || `Session ${new Date().toLocaleString()}`,
      startTime: new Date(),
      status: 'recording',
      events: [],
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

  // Add a simple note
  const addNote = useCallback((note: string) => {
    if (!currentSession) return;

    const noteEvent: ActivityEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'note',
      source: 'Manual',
      title: 'Quick Note',
      description: note,
      content: {
        text: note,
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

  // Capture a tab/URL
  const captureTab = useCallback(async (input: CaptureTabInput) => {
    if (!currentSession) return;

    let title = input.title;
    let description = input.description;

    // Fetch metadata if title not provided
    if (!title) {
      const metadata = await fetchUrlMetadata(input.url);
      title = metadata.title;
      description = description || metadata.description;
    }

    const event: ActivityEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'tab',
      source: new URL(input.url).hostname.replace('www.', ''),
      title: title || input.url,
      description: description || `Captured from ${input.url}`,
      url: input.url,
      content: {
        text: description || '',
        summary: `Tab captured: ${title || input.url}`,
      },
    };

    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        events: [...prev.events, event],
      };
    });
  }, [currentSession]);

  // Capture code snippet
  const captureCode = useCallback((input: CaptureCodeInput) => {
    if (!currentSession) return;

    const event: ActivityEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'action',
      source: input.source || 'Code Editor',
      title: input.description || 'Code Snippet',
      description: `${input.language || 'Code'} snippet captured`,
      content: {
        code: input.code,
        text: input.description || '',
        summary: `${input.code.split('\n').length} lines of ${input.language || 'code'}`,
      },
    };

    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        events: [...prev.events, event],
      };
    });
  }, [currentSession]);

  // Capture detailed note
  const captureNote = useCallback((input: CaptureNoteInput) => {
    if (!currentSession) return;

    const event: ActivityEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'note',
      source: 'Manual',
      title: input.title || 'Note',
      description: input.text,
      content: {
        text: input.text,
        summary: input.title || 'Manual note',
      },
    };

    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        events: [...prev.events, event],
      };
    });
  }, [currentSession]);

  // Capture meeting
  const captureMeeting = useCallback((input: CaptureMeetingInput) => {
    if (!currentSession) return;

    const event: ActivityEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'message',
      source: 'Meeting',
      title: input.title,
      description: input.notes || `Meeting: ${input.title}`,
      content: {
        text: input.notes || '',
        summary: input.attendees ? `Attendees: ${input.attendees}` : '',
        highlights: input.actionItems || [],
      },
      metadata: {
        attendees: input.attendees,
        actionItems: input.actionItems,
      },
    };

    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        events: [...prev.events, event],
      };
    });
  }, [currentSession]);

  // Capture from clipboard with auto-detection
  const captureFromClipboard = useCallback(async (): Promise<CaptureFromClipboardResult | null> => {
    if (!currentSession) return null;

    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return null;

      const contentType = detectContentType(text);

      if (contentType === 'url') {
        await captureTab({ url: text.trim() });
      } else if (contentType === 'code') {
        captureCode({ code: text });
      } else {
        captureNote({ text });
      }

      return { type: contentType, content: text };
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      return null;
    }
  }, [currentSession, captureTab, captureCode, captureNote]);

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
    captureTab,
    captureCode,
    captureNote,
    captureMeeting,
    captureFromClipboard,
  };
};
