import { useState, useCallback, useEffect } from 'react';
import { UserProfileType, KnowledgeArticle } from '@/types';
import { TemplateSection } from './useTemplateSections';

export interface TemplatePreset {
  id: string;
  name: string;
  description?: string;
  profileType: UserProfileType;
  templateKey: KnowledgeArticle['template'];
  sections: TemplateSection[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  tags?: string[];
}

const STORAGE_KEY = 'recap-template-presets';

export const useTemplatePresets = () => {
  const [presets, setPresets] = useState<TemplatePreset[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((p: TemplatePreset) => ({
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

  // Save to localStorage whenever presets change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  }, [presets]);

  const getPresetsForTemplate = useCallback((
    profileType: UserProfileType,
    templateKey: KnowledgeArticle['template']
  ): TemplatePreset[] => {
    return presets.filter(
      p => p.profileType === profileType && p.templateKey === templateKey
    );
  }, [presets]);

  const getAllPresets = useCallback((): TemplatePreset[] => {
    return presets;
  }, [presets]);

  const getPresetById = useCallback((id: string): TemplatePreset | undefined => {
    return presets.find(p => p.id === id);
  }, [presets]);

  const savePreset = useCallback((
    name: string,
    profileType: UserProfileType,
    templateKey: KnowledgeArticle['template'],
    sections: TemplateSection[],
    description?: string,
    tags?: string[]
  ): TemplatePreset => {
    const now = new Date();
    const newPreset: TemplatePreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name,
      description,
      profileType,
      templateKey,
      sections: sections.map(s => ({ ...s })), // Deep copy
      createdAt: now,
      updatedAt: now,
      tags,
    };
    
    setPresets(prev => [...prev, newPreset]);
    return newPreset;
  }, []);

  const updatePreset = useCallback((
    id: string,
    updates: Partial<Pick<TemplatePreset, 'name' | 'description' | 'sections' | 'tags'>>
  ) => {
    setPresets(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates, updatedAt: new Date() }
        : p
    ));
  }, []);

  const deletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  }, []);

  const duplicatePreset = useCallback((id: string, newName: string): TemplatePreset | undefined => {
    const original = presets.find(p => p.id === id);
    if (!original) return undefined;

    const now = new Date();
    const duplicate: TemplatePreset = {
      ...original,
      id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: newName,
      createdAt: now,
      updatedAt: now,
      isDefault: false,
      sections: original.sections.map(s => ({ ...s })),
    };

    setPresets(prev => [...prev, duplicate]);
    return duplicate;
  }, [presets]);

  const exportPreset = useCallback((id: string): string | null => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return null;

    const exportData = {
      ...preset,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    return btoa(JSON.stringify(exportData));
  }, [presets]);

  const exportPresetAsJSON = useCallback((id: string): string | null => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return null;

    return JSON.stringify({
      ...preset,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }, null, 2);
  }, [presets]);

  const importPreset = useCallback((data: string): TemplatePreset | null => {
    try {
      // Try base64 first
      let parsed: TemplatePreset;
      try {
        parsed = JSON.parse(atob(data));
      } catch {
        // Try raw JSON
        parsed = JSON.parse(data);
      }

      // Validate required fields
      if (!parsed.name || !parsed.profileType || !parsed.templateKey || !parsed.sections) {
        throw new Error('Invalid preset format');
      }

      const now = new Date();
      const imported: TemplatePreset = {
        id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: `${parsed.name} (Imported)`,
        description: parsed.description,
        profileType: parsed.profileType,
        templateKey: parsed.templateKey,
        sections: parsed.sections.map((s, i) => ({
          ...s,
          id: `section_${Date.now()}_${i}`,
        })),
        createdAt: now,
        updatedAt: now,
        tags: parsed.tags,
      };

      setPresets(prev => [...prev, imported]);
      return imported;
    } catch (error) {
      console.error('Failed to import preset:', error);
      return null;
    }
  }, []);

  const setDefaultPreset = useCallback((
    id: string,
    profileType: UserProfileType,
    templateKey: KnowledgeArticle['template']
  ) => {
    setPresets(prev => prev.map(p => {
      if (p.profileType === profileType && p.templateKey === templateKey) {
        return { ...p, isDefault: p.id === id };
      }
      return p;
    }));
  }, []);

  const getDefaultPreset = useCallback((
    profileType: UserProfileType,
    templateKey: KnowledgeArticle['template']
  ): TemplatePreset | undefined => {
    return presets.find(
      p => p.profileType === profileType && 
           p.templateKey === templateKey && 
           p.isDefault
    );
  }, [presets]);

  const searchPresets = useCallback((query: string): TemplatePreset[] => {
    const lowerQuery = query.toLowerCase();
    return presets.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.tags?.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [presets]);

  return {
    presets,
    getPresetsForTemplate,
    getAllPresets,
    getPresetById,
    savePreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    exportPreset,
    exportPresetAsJSON,
    importPreset,
    setDefaultPreset,
    getDefaultPreset,
    searchPresets,
  };
};
