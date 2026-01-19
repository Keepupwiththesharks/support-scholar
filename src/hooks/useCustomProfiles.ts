import { useState, useCallback, useEffect } from 'react';
import { RecordingPreferences, DEFAULT_PROFILES } from '@/types';

export interface CustomProfile {
  id: string;
  name: string;
  icon: string;
  description: string;
  preferences: RecordingPreferences;
  outputTemplates: string[];
  basedOn: 'student' | 'developer' | 'support' | 'researcher' | 'custom';
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

// Available template options for custom profiles to choose from
export const AVAILABLE_TEMPLATES = [
  { id: 'study-guide', label: 'Study Guide', category: 'Education' },
  { id: 'flashcards', label: 'Flashcards', category: 'Education' },
  { id: 'lecture-notes', label: 'Lecture Notes', category: 'Education' },
  { id: 'summary', label: 'Summary', category: 'General' },
  { id: 'dev-docs', label: 'Dev Documentation', category: 'Development' },
  { id: 'changelog', label: 'Changelog', category: 'Development' },
  { id: 'debug-log', label: 'Debug Log', category: 'Development' },
  { id: 'readme', label: 'README', category: 'Development' },
  { id: 'knowledge-base', label: 'Knowledge Base', category: 'Support' },
  { id: 'ticket-summary', label: 'Ticket Summary', category: 'Support' },
  { id: 'runbook', label: 'Runbook', category: 'Support' },
  { id: 'research-notes', label: 'Research Notes', category: 'Research' },
  { id: 'bibliography', label: 'Bibliography', category: 'Research' },
  { id: 'findings', label: 'Findings Report', category: 'Research' },
  { id: 'meeting-notes', label: 'Meeting Notes', category: 'General' },
  { id: 'simple', label: 'Simple', category: 'General' },
  { id: 'detailed', label: 'Detailed', category: 'General' },
];

export const PROFILE_ICONS = [
  '👤', '👨‍💻', '👩‍🔬', '📚', '🎧', '🔧', '📊', '🎨', '📝', '🚀',
  '💡', '🔍', '📱', '🌐', '🎯', '⚡', '🔬', '📈', '🛠️', '🎓',
];

// Pre-built profile templates users can quickly add
export interface ProfileTemplate {
  name: string;
  icon: string;
  description: string;
  category: string;
  basedOn: 'student' | 'developer' | 'support' | 'researcher' | 'custom';
  preferences: Partial<RecordingPreferences>;
  outputTemplates: string[];
}

export const PROFILE_TEMPLATES: ProfileTemplate[] = [
  // Education & Learning
  {
    name: 'Online Course Learner',
    icon: '🎓',
    description: 'Track video courses, tutorials, and online learning platforms',
    category: 'Education',
    basedOn: 'student',
    preferences: { trackMedia: true, trackDocuments: true, captureInterval: 45 },
    outputTemplates: ['study-guide', 'flashcards', 'summary'],
  },
  {
    name: 'Exam Prep',
    icon: '📖',
    description: 'Focused study sessions for test preparation',
    category: 'Education',
    basedOn: 'student',
    preferences: { trackBrowserTabs: true, trackDocuments: true, trackMedia: false, captureInterval: 20 },
    outputTemplates: ['flashcards', 'study-guide', 'summary'],
  },
  {
    name: 'Language Learner',
    icon: '🌍',
    description: 'Track language learning apps, videos, and practice sessions',
    category: 'Education',
    basedOn: 'student',
    preferences: { trackMedia: true, trackApplications: true, captureInterval: 30 },
    outputTemplates: ['flashcards', 'summary', 'study-guide'],
  },
  {
    name: 'Book Club Reader',
    icon: '📚',
    description: 'Track reading sessions and capture key insights',
    category: 'Education',
    basedOn: 'researcher',
    preferences: { trackDocuments: true, trackMedia: false, trackTerminal: false, captureInterval: 60 },
    outputTemplates: ['summary', 'research-notes', 'findings'],
  },
  
  // Development & Tech
  {
    name: 'Frontend Developer',
    icon: '🎨',
    description: 'UI/UX focused development with design tool tracking',
    category: 'Development',
    basedOn: 'developer',
    preferences: { trackBrowserTabs: true, trackApplications: true, captureScreenshots: true, captureInterval: 10 },
    outputTemplates: ['dev-docs', 'changelog', 'readme'],
  },
  {
    name: 'Backend Engineer',
    icon: '⚙️',
    description: 'API development, databases, and server-side work',
    category: 'Development',
    basedOn: 'developer',
    preferences: { trackTerminal: true, trackApplications: true, trackMedia: false, captureInterval: 15 },
    outputTemplates: ['dev-docs', 'debug-log', 'changelog'],
  },
  {
    name: 'DevOps Engineer',
    icon: '🚀',
    description: 'Infrastructure, CI/CD, and deployment workflows',
    category: 'Development',
    basedOn: 'developer',
    preferences: { trackTerminal: true, trackBrowserTabs: true, captureInterval: 20 },
    outputTemplates: ['runbook', 'dev-docs', 'debug-log'],
  },
  {
    name: 'Code Reviewer',
    icon: '🔍',
    description: 'Track code review sessions and feedback',
    category: 'Development',
    basedOn: 'developer',
    preferences: { trackBrowserTabs: true, trackApplications: true, captureInterval: 15 },
    outputTemplates: ['dev-docs', 'changelog', 'summary'],
  },
  {
    name: 'Bug Hunter',
    icon: '🐛',
    description: 'Dedicated debugging and issue investigation',
    category: 'Development',
    basedOn: 'developer',
    preferences: { trackTerminal: true, trackBrowserTabs: true, captureScreenshots: true, captureInterval: 5 },
    outputTemplates: ['debug-log', 'ticket-summary', 'dev-docs'],
  },
  
  // Support & Customer Success
  {
    name: 'Customer Success Manager',
    icon: '🤝',
    description: 'Track customer calls, onboarding, and success metrics',
    category: 'Support',
    basedOn: 'support',
    preferences: { trackMeetings: true, trackMessaging: true, trackDocuments: true, captureInterval: 30 },
    outputTemplates: ['meeting-notes', 'summary', 'knowledge-base'],
  },
  {
    name: 'Technical Support',
    icon: '🛠️',
    description: 'Deep technical troubleshooting and escalations',
    category: 'Support',
    basedOn: 'support',
    preferences: { trackTerminal: true, trackBrowserTabs: true, captureScreenshots: true, captureInterval: 10 },
    outputTemplates: ['ticket-summary', 'knowledge-base', 'runbook'],
  },
  {
    name: 'Help Desk Agent',
    icon: '📞',
    description: 'First-line support and quick issue resolution',
    category: 'Support',
    basedOn: 'support',
    preferences: { trackMessaging: true, trackBrowserTabs: true, captureInterval: 15 },
    outputTemplates: ['ticket-summary', 'knowledge-base', 'summary'],
  },
  {
    name: 'QA Tester',
    icon: '✅',
    description: 'Testing workflows, bug reporting, and quality assurance',
    category: 'Support',
    basedOn: 'support',
    preferences: { trackBrowserTabs: true, trackApplications: true, captureScreenshots: true, captureInterval: 10 },
    outputTemplates: ['debug-log', 'ticket-summary', 'runbook'],
  },
  
  // Research & Analysis
  {
    name: 'Data Analyst',
    icon: '📊',
    description: 'Data exploration, visualization, and insights',
    category: 'Research',
    basedOn: 'researcher',
    preferences: { trackApplications: true, trackBrowserTabs: true, captureInterval: 25 },
    outputTemplates: ['findings', 'research-notes', 'summary'],
  },
  {
    name: 'UX Researcher',
    icon: '🧪',
    description: 'User research, interviews, and usability testing',
    category: 'Research',
    basedOn: 'researcher',
    preferences: { trackMeetings: true, trackDocuments: true, captureScreenshots: true, captureInterval: 30 },
    outputTemplates: ['research-notes', 'findings', 'summary'],
  },
  {
    name: 'Academic Researcher',
    icon: '🎓',
    description: 'Scholarly research with citation tracking',
    category: 'Research',
    basedOn: 'researcher',
    preferences: { trackBrowserTabs: true, trackDocuments: true, captureInterval: 40 },
    outputTemplates: ['bibliography', 'research-notes', 'findings'],
  },
  {
    name: 'Market Analyst',
    icon: '📈',
    description: 'Market research and competitive analysis',
    category: 'Research',
    basedOn: 'researcher',
    preferences: { trackBrowserTabs: true, trackDocuments: true, trackMedia: true, captureInterval: 30 },
    outputTemplates: ['findings', 'summary', 'research-notes'],
  },
  
  // Creative & Content
  {
    name: 'Content Writer',
    icon: '✍️',
    description: 'Blog posts, articles, and content creation',
    category: 'Creative',
    basedOn: 'custom',
    preferences: { trackBrowserTabs: true, trackDocuments: true, trackMedia: false, captureInterval: 45 },
    outputTemplates: ['summary', 'detailed', 'research-notes'],
  },
  {
    name: 'Video Editor',
    icon: '🎬',
    description: 'Video production and editing workflows',
    category: 'Creative',
    basedOn: 'custom',
    preferences: { trackApplications: true, trackMedia: true, captureScreenshots: true, captureInterval: 60 },
    outputTemplates: ['simple', 'detailed', 'changelog'],
  },
  {
    name: 'Designer',
    icon: '🎨',
    description: 'UI/UX design, graphics, and creative work',
    category: 'Creative',
    basedOn: 'custom',
    preferences: { trackApplications: true, trackBrowserTabs: true, captureScreenshots: true, captureInterval: 30 },
    outputTemplates: ['detailed', 'changelog', 'summary'],
  },
  {
    name: 'Podcaster',
    icon: '🎙️',
    description: 'Podcast production, research, and episode notes',
    category: 'Creative',
    basedOn: 'custom',
    preferences: { trackMedia: true, trackDocuments: true, trackMeetings: true, captureInterval: 45 },
    outputTemplates: ['summary', 'detailed', 'meeting-notes'],
  },
  
  // Business & Productivity
  {
    name: 'Project Manager',
    icon: '📋',
    description: 'Project tracking, meetings, and team coordination',
    category: 'Business',
    basedOn: 'custom',
    preferences: { trackMeetings: true, trackMessaging: true, trackDocuments: true, captureInterval: 30 },
    outputTemplates: ['meeting-notes', 'summary', 'detailed'],
  },
  {
    name: 'Product Manager',
    icon: '🎯',
    description: 'Product research, specs, and stakeholder meetings',
    category: 'Business',
    basedOn: 'custom',
    preferences: { trackMeetings: true, trackDocuments: true, trackBrowserTabs: true, captureInterval: 25 },
    outputTemplates: ['summary', 'findings', 'meeting-notes'],
  },
  {
    name: 'Sales Professional',
    icon: '💼',
    description: 'Sales calls, demos, and prospect research',
    category: 'Business',
    basedOn: 'custom',
    preferences: { trackMeetings: true, trackMessaging: true, trackBrowserTabs: true, captureInterval: 20 },
    outputTemplates: ['meeting-notes', 'summary', 'simple'],
  },
  {
    name: 'Consultant',
    icon: '💡',
    description: 'Client work, research, and deliverables',
    category: 'Business',
    basedOn: 'custom',
    preferences: { trackMeetings: true, trackDocuments: true, trackBrowserTabs: true, captureInterval: 30 },
    outputTemplates: ['detailed', 'findings', 'meeting-notes'],
  },
  {
    name: 'Entrepreneur',
    icon: '🚀',
    description: 'Multi-tasking across business functions',
    category: 'Business',
    basedOn: 'custom',
    preferences: { trackBrowserTabs: true, trackMeetings: true, trackMessaging: true, trackDocuments: true, captureInterval: 20 },
    outputTemplates: ['summary', 'meeting-notes', 'simple'],
  },
  
  // Personal & Lifestyle
  {
    name: 'Hobbyist',
    icon: '🎮',
    description: 'Track hobby projects and learning new skills',
    category: 'Personal',
    basedOn: 'custom',
    preferences: { trackBrowserTabs: true, trackMedia: true, captureInterval: 60 },
    outputTemplates: ['simple', 'summary', 'detailed'],
  },
  {
    name: 'Journaler',
    icon: '📔',
    description: 'Daily activity tracking and reflection',
    category: 'Personal',
    basedOn: 'custom',
    preferences: { trackBrowserTabs: true, trackApplications: true, trackDocuments: true, captureInterval: 60 },
    outputTemplates: ['summary', 'simple', 'detailed'],
  },
  {
    name: 'Health & Fitness',
    icon: '💪',
    description: 'Track workout research and nutrition planning',
    category: 'Personal',
    basedOn: 'custom',
    preferences: { trackBrowserTabs: true, trackMedia: true, trackDocuments: true, captureInterval: 45 },
    outputTemplates: ['summary', 'simple', 'detailed'],
  },
];

const STORAGE_KEY = 'recap-custom-profiles';
const DEFAULT_PROFILE_KEY = 'recap-default-custom-profile';

export const useCustomProfiles = () => {
  const [customProfiles, setCustomProfiles] = useState<CustomProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((p: CustomProfile) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  // Save to localStorage whenever profiles change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customProfiles));
  }, [customProfiles]);

  const createProfile = useCallback((
    name: string,
    icon: string,
    description: string,
    basedOn: CustomProfile['basedOn'],
    preferences?: Partial<RecordingPreferences>,
    outputTemplates?: string[]
  ): CustomProfile => {
    const baseProfile = DEFAULT_PROFILES[basedOn];
    const now = new Date();
    
    const newProfile: CustomProfile = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name,
      icon,
      description,
      preferences: {
        ...baseProfile.preferences,
        ...preferences,
      },
      outputTemplates: outputTemplates || baseProfile.outputTemplates,
      basedOn,
      createdAt: now,
      updatedAt: now,
    };
    
    setCustomProfiles(prev => [...prev, newProfile]);
    return newProfile;
  }, []);

  const updateProfile = useCallback((
    id: string,
    updates: Partial<Omit<CustomProfile, 'id' | 'createdAt'>>
  ) => {
    setCustomProfiles(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates, updatedAt: new Date() }
        : p
    ));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setCustomProfiles(prev => prev.filter(p => p.id !== id));
  }, []);

  const duplicateProfile = useCallback((id: string, newName: string): CustomProfile | undefined => {
    const original = customProfiles.find(p => p.id === id);
    if (!original) return undefined;

    const now = new Date();
    const duplicate: CustomProfile = {
      ...original,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: newName,
      createdAt: now,
      updatedAt: now,
    };

    setCustomProfiles(prev => [...prev, duplicate]);
    return duplicate;
  }, [customProfiles]);

  const getProfileById = useCallback((id: string): CustomProfile | undefined => {
    return customProfiles.find(p => p.id === id);
  }, [customProfiles]);

  const exportProfile = useCallback((id: string): string | null => {
    const profile = customProfiles.find(p => p.id === id);
    if (!profile) return null;

    const exportData = {
      ...profile,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    return btoa(JSON.stringify(exportData));
  }, [customProfiles]);

  const importProfile = useCallback((data: string): CustomProfile | null => {
    try {
      let parsed: CustomProfile;
      try {
        parsed = JSON.parse(atob(data));
      } catch {
        parsed = JSON.parse(data);
      }

      if (!parsed.name || !parsed.preferences || !parsed.outputTemplates) {
        throw new Error('Invalid profile format');
      }

      const now = new Date();
      const imported: CustomProfile = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: `${parsed.name} (Imported)`,
        icon: parsed.icon || '👤',
        description: parsed.description || '',
        preferences: parsed.preferences,
        outputTemplates: parsed.outputTemplates,
        basedOn: parsed.basedOn || 'custom',
        createdAt: now,
        updatedAt: now,
      };

      setCustomProfiles(prev => [...prev, imported]);
      return imported;
    } catch (error) {
      console.error('Failed to import profile:', error);
      return null;
    }
  }, []);

  const setDefaultProfile = useCallback((id: string | null) => {
    // Clear any existing default
    setCustomProfiles(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
    // Also store in separate key for quick access
    if (id) {
      localStorage.setItem(DEFAULT_PROFILE_KEY, id);
    } else {
      localStorage.removeItem(DEFAULT_PROFILE_KEY);
    }
  }, []);

  const getDefaultProfile = useCallback((): CustomProfile | null => {
    const defaultId = localStorage.getItem(DEFAULT_PROFILE_KEY);
    if (!defaultId) return null;
    return customProfiles.find(p => p.id === defaultId) || null;
  }, [customProfiles]);

  const clearDefault = useCallback(() => {
    setCustomProfiles(prev => prev.map(p => ({ ...p, isDefault: false })));
    localStorage.removeItem(DEFAULT_PROFILE_KEY);
  }, []);

  return {
    customProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    duplicateProfile,
    getProfileById,
    exportProfile,
    importProfile,
    setDefaultProfile,
    getDefaultProfile,
    clearDefault,
  };
};
