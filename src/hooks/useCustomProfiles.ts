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
