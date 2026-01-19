import { useState, useEffect, useCallback } from 'react';
import { GeneratedContent } from '@/lib/contentGenerationEngine';
import { UserProfileType } from '@/types';

export interface ContentPreset {
  id: string;
  name: string;
  description?: string;
  content: GeneratedContent;
  profileType: UserProfileType;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'recap-content-presets';

export const useContentPresets = () => {
  const [presets, setPresets] = useState<ContentPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load presets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const loadedPresets = parsed.map((preset: ContentPreset) => ({
          ...preset,
          createdAt: new Date(preset.createdAt),
          updatedAt: new Date(preset.updatedAt),
        }));
        setPresets(loadedPresets);
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save presets to localStorage
  const saveToStorage = useCallback((updatedPresets: ContentPreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  }, []);

  const savePreset = useCallback((
    name: string,
    content: GeneratedContent,
    profileType: UserProfileType,
    description?: string
  ): ContentPreset => {
    const newPreset: ContentPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      content,
      profileType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    saveToStorage(updatedPresets);
    
    return newPreset;
  }, [presets, saveToStorage]);

  const updatePreset = useCallback((
    id: string,
    updates: Partial<Pick<ContentPreset, 'name' | 'description' | 'content'>>
  ): ContentPreset | null => {
    const index = presets.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    const updatedPreset: ContentPreset = {
      ...presets[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    const updatedPresets = [...presets];
    updatedPresets[index] = updatedPreset;
    setPresets(updatedPresets);
    saveToStorage(updatedPresets);
    
    return updatedPreset;
  }, [presets, saveToStorage]);

  const deletePreset = useCallback((id: string): boolean => {
    const index = presets.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    const updatedPresets = presets.filter(p => p.id !== id);
    setPresets(updatedPresets);
    saveToStorage(updatedPresets);
    
    return true;
  }, [presets, saveToStorage]);

  const getPresetsByProfile = useCallback((profileType: UserProfileType): ContentPreset[] => {
    return presets.filter(p => p.profileType === profileType);
  }, [presets]);

  const duplicatePreset = useCallback((id: string): ContentPreset | null => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return null;
    
    return savePreset(
      `${preset.name} (Copy)`,
      preset.content,
      preset.profileType,
      preset.description
    );
  }, [presets, savePreset]);

  return {
    presets,
    isLoading,
    savePreset,
    updatePreset,
    deletePreset,
    getPresetsByProfile,
    duplicatePreset,
  };
};
