import { useState, useEffect, useCallback, useMemo } from 'react';
import { GeneratedContent } from '@/lib/contentGenerationEngine';
import { UserProfileType } from '@/types';

export type PresetCategory = 'general' | 'reports' | 'documentation' | 'learning' | 'research' | 'custom';

export const PRESET_CATEGORIES: { value: PresetCategory; label: string; icon: string }[] = [
  { value: 'general', label: 'General', icon: '📋' },
  { value: 'reports', label: 'Reports', icon: '📊' },
  { value: 'documentation', label: 'Documentation', icon: '📝' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'research', label: 'Research', icon: '🔬' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
];

export interface ContentPreset {
  id: string;
  name: string;
  description?: string;
  content: GeneratedContent;
  profileType: UserProfileType;
  category: PresetCategory;
  tags: string[];
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
        // Convert date strings back to Date objects and ensure new fields exist
        const loadedPresets = parsed.map((preset: ContentPreset) => ({
          ...preset,
          category: preset.category || 'general',
          tags: preset.tags || [],
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

  // Get all unique tags across all presets
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    presets.forEach(p => p.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [presets]);

  const savePreset = useCallback((
    name: string,
    content: GeneratedContent,
    profileType: UserProfileType,
    options?: {
      description?: string;
      category?: PresetCategory;
      tags?: string[];
    }
  ): ContentPreset => {
    const newPreset: ContentPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: options?.description,
      content,
      profileType,
      category: options?.category || 'general',
      tags: options?.tags || [],
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
    updates: Partial<Pick<ContentPreset, 'name' | 'description' | 'content' | 'category' | 'tags'>>
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

  const getPresetsByCategory = useCallback((category: PresetCategory): ContentPreset[] => {
    return presets.filter(p => p.category === category);
  }, [presets]);

  const getPresetsByTag = useCallback((tag: string): ContentPreset[] => {
    return presets.filter(p => p.tags.includes(tag));
  }, [presets]);

  const filterPresets = useCallback((filters: {
    profileType?: UserProfileType;
    category?: PresetCategory;
    tags?: string[];
    search?: string;
  }): ContentPreset[] => {
    return presets.filter(p => {
      if (filters.profileType && p.profileType !== filters.profileType) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some(t => p.tags.includes(t))) return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(searchLower);
        const matchesDesc = p.description?.toLowerCase().includes(searchLower);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(searchLower));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }
      return true;
    });
  }, [presets]);

  const duplicatePreset = useCallback((id: string): ContentPreset | null => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return null;
    
    return savePreset(
      `${preset.name} (Copy)`,
      preset.content,
      preset.profileType,
      {
        description: preset.description,
        category: preset.category,
        tags: preset.tags,
      }
    );
  }, [presets, savePreset]);

  return {
    presets,
    allTags,
    isLoading,
    savePreset,
    updatePreset,
    deletePreset,
    getPresetsByProfile,
    getPresetsByCategory,
    getPresetsByTag,
    filterPresets,
    duplicatePreset,
  };
};
