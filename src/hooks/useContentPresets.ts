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

  // Export presets as JSON
  const exportPresetsAsJSON = useCallback((presetIds?: string[]): void => {
    const presetsToExport = presetIds 
      ? presets.filter(p => presetIds.includes(p.id))
      : presets;
    
    if (presetsToExport.length === 0) return;
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      presets: presetsToExport,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = presetIds?.length === 1 
      ? `preset-${presetsToExport[0].name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
      : `recap-presets-${new Date().toISOString().split('T')[0]}.json`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [presets]);

  // Parse presets from JSON file (without importing)
  const parsePresetsFromJSON = useCallback((file: File): Promise<{
    presets: ContentPreset[];
    conflicts: { imported: ContentPreset; existing: ContentPreset }[];
    errors: string[];
  }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (!data.presets || !Array.isArray(data.presets)) {
            resolve({ presets: [], conflicts: [], errors: ['Invalid file format: missing presets array'] });
            return;
          }
          
          const parsedPresets: ContentPreset[] = [];
          const conflicts: { imported: ContentPreset; existing: ContentPreset }[] = [];
          const errors: string[] = [];
          
          for (const preset of data.presets) {
            if (!preset.name || !preset.content || !preset.profileType) {
              errors.push(`Skipped preset: missing required fields`);
              continue;
            }
            
            const newPreset: ContentPreset = {
              id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: preset.name,
              description: preset.description,
              content: preset.content,
              profileType: preset.profileType,
              category: preset.category || 'general',
              tags: preset.tags || [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            const existingPreset = presets.find(
              p => p.name.toLowerCase() === preset.name.toLowerCase() && p.profileType === preset.profileType
            );
            
            if (existingPreset) {
              conflicts.push({ imported: newPreset, existing: existingPreset });
            } else {
              parsedPresets.push(newPreset);
            }
          }
          
          resolve({ presets: parsedPresets, conflicts, errors });
        } catch (error) {
          resolve({ presets: [], conflicts: [], errors: ['Failed to parse JSON file'] });
        }
      };
      
      reader.onerror = () => {
        resolve({ presets: [], conflicts: [], errors: ['Failed to read file'] });
      };
      
      reader.readAsText(file);
    });
  }, [presets]);

  // Apply import with conflict resolution
  const applyImport = useCallback((
    newPresets: ContentPreset[],
    conflictResolutions: { 
      presetName: string; 
      action: 'overwrite' | 'keep_both' | 'skip' | 'cherry_pick';
      cherryPickedContent?: {
        insights: string[];
        keyTakeaways: string[];
        actionItems: string[];
      };
    }[],
    conflicts: { imported: ContentPreset; existing: ContentPreset }[]
  ): { imported: number; overwritten: number; merged: number; skipped: number } => {
    let imported = newPresets.length;
    let overwritten = 0;
    let merged = 0;
    let skipped = 0;
    
    let updatedPresets = [...presets];
    const presetsToAdd: ContentPreset[] = [...newPresets];
    
    for (const conflict of conflicts) {
      const resolution = conflictResolutions.find(r => r.presetName === conflict.imported.name);
      const action = resolution?.action || 'skip';
      
      if (action === 'overwrite') {
        // Remove existing and add new
        updatedPresets = updatedPresets.filter(p => p.id !== conflict.existing.id);
        presetsToAdd.push(conflict.imported);
        overwritten++;
      } else if (action === 'keep_both') {
        // Add with modified name
        const renamedPreset: ContentPreset = {
          ...conflict.imported,
          name: `${conflict.imported.name} (Imported)`,
        };
        presetsToAdd.push(renamedPreset);
        imported++;
      } else if (action === 'cherry_pick' && resolution?.cherryPickedContent) {
        // Merge selected items into existing preset
        const existingIndex = updatedPresets.findIndex(p => p.id === conflict.existing.id);
        if (existingIndex !== -1) {
          const mergedPreset: ContentPreset = {
            ...updatedPresets[existingIndex],
            content: {
              ...updatedPresets[existingIndex].content,
              insights: resolution.cherryPickedContent.insights,
              keyTakeaways: resolution.cherryPickedContent.keyTakeaways,
              actionItems: resolution.cherryPickedContent.actionItems,
            },
            updatedAt: new Date(),
          };
          updatedPresets[existingIndex] = mergedPreset;
          merged++;
        }
      } else {
        skipped++;
      }
    }
    
    const finalPresets = [...updatedPresets, ...presetsToAdd];
    setPresets(finalPresets);
    saveToStorage(finalPresets);
    
    return { imported, overwritten, merged, skipped };
  }, [presets, saveToStorage]);

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
    exportPresetsAsJSON,
    parsePresetsFromJSON,
    applyImport,
  };
};
