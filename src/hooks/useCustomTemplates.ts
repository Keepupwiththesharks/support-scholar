import { useState, useCallback, useEffect } from 'react';
import { CustomTemplate, TemplateSection, DEFAULT_TEMPLATES } from '@/types/templates';

const STORAGE_KEY = 'recap-custom-templates';
const TEMPLATES_CHANGED_EVENT = 'recap-templates-changed';

const notifyTemplatesChanged = () => {
  window.dispatchEvent(new CustomEvent(TEMPLATES_CHANGED_EVENT));
};

const readTemplatesFromStorage = (): CustomTemplate[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((t: CustomTemplate) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }));
    }
  } catch {
    // Ignore parse errors
  }
  return [];
};

export const useCustomTemplates = () => {
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(readTemplatesFromStorage);

  // Listen for changes from other hook instances
  useEffect(() => {
    const handleTemplatesChanged = () => {
      setCustomTemplates(readTemplatesFromStorage());
    };

    window.addEventListener(TEMPLATES_CHANGED_EVENT, handleTemplatesChanged);
    return () => window.removeEventListener(TEMPLATES_CHANGED_EVENT, handleTemplatesChanged);
  }, []);

  // Save to localStorage whenever templates change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Get all templates (defaults + custom)
  const getAllTemplates = useCallback((): CustomTemplate[] => {
    return [...DEFAULT_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  // Get only custom (user-created) templates
  const getCustomTemplates = useCallback((): CustomTemplate[] => {
    return customTemplates;
  }, [customTemplates]);

  // Get template by ID
  const getTemplateById = useCallback((id: string): CustomTemplate | undefined => {
    const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];
    return allTemplates.find(t => t.id === id);
  }, [customTemplates]);

  // Create a new custom template
  const createTemplate = useCallback((
    name: string,
    description: string,
    icon: string,
    sections: { label: string; description?: string; enabled?: boolean; placeholder?: string }[],
    createdFrom: 'scratch' | 'url' | 'file' = 'scratch',
    sourceUrl?: string
  ): CustomTemplate => {
    const now = new Date();
    
    const newTemplate: CustomTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name,
      description,
      icon,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
      createdFrom,
      sourceUrl,
      sections: sections.map((s, index) => ({
        ...s,
        id: `section_${Date.now()}_${index}`,
        order: index,
        enabled: true,
      })),
    };
    
    setCustomTemplates(prev => [...prev, newTemplate]);
    setTimeout(notifyTemplatesChanged, 0);
    return newTemplate;
  }, []);

  // Update an existing template
  const updateTemplate = useCallback((
    id: string,
    updates: Partial<Omit<CustomTemplate, 'id' | 'createdAt' | 'isDefault'>>
  ) => {
    setCustomTemplates(prev => prev.map(t => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date() }
        : t
    ));
    setTimeout(notifyTemplatesChanged, 0);
  }, []);

  // Delete a template
  const deleteTemplate = useCallback((id: string) => {
    // Can't delete default templates
    if (DEFAULT_TEMPLATES.some(t => t.id === id)) return;
    
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
    setTimeout(notifyTemplatesChanged, 0);
  }, []);

  // Duplicate a template
  const duplicateTemplate = useCallback((id: string, newName: string): CustomTemplate | undefined => {
    const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];
    const original = allTemplates.find(t => t.id === id);
    if (!original) return undefined;

    const now = new Date();
    const duplicate: CustomTemplate = {
      ...original,
      id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: newName,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
      sections: original.sections.map((s, i) => ({
        ...s,
        id: `section_${Date.now()}_${i}`,
      })),
    };

    setCustomTemplates(prev => [...prev, duplicate]);
    setTimeout(notifyTemplatesChanged, 0);
    return duplicate;
  }, [customTemplates]);

  // Reorder sections within a template
  const reorderSections = useCallback((templateId: string, sections: TemplateSection[]) => {
    setCustomTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        sections: sections.map((s, i) => ({ ...s, order: i })),
        updatedAt: new Date(),
      };
    }));
    setTimeout(notifyTemplatesChanged, 0);
  }, []);

  // Add a section to a template
  const addSection = useCallback((templateId: string, label: string, description?: string) => {
    setCustomTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      const newSection: TemplateSection = {
        id: `section_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        label,
        description,
        order: t.sections.length,
        enabled: true,
      };
      return {
        ...t,
        sections: [...t.sections, newSection],
        updatedAt: new Date(),
      };
    }));
    setTimeout(notifyTemplatesChanged, 0);
  }, []);

  // Remove a section from a template
  const removeSection = useCallback((templateId: string, sectionId: string) => {
    setCustomTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        sections: t.sections.filter(s => s.id !== sectionId).map((s, i) => ({ ...s, order: i })),
        updatedAt: new Date(),
      };
    }));
    setTimeout(notifyTemplatesChanged, 0);
  }, []);

  // Toggle section visibility
  const toggleSection = useCallback((templateId: string, sectionId: string) => {
    setCustomTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        sections: t.sections.map(s => 
          s.id === sectionId ? { ...s, enabled: !s.enabled } : s
        ),
        updatedAt: new Date(),
      };
    }));
    setTimeout(notifyTemplatesChanged, 0);
  }, []);

  // Rename a section
  const renameSection = useCallback((templateId: string, sectionId: string, newLabel: string) => {
    setCustomTemplates(prev => prev.map(t => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        sections: t.sections.map(s => 
          s.id === sectionId ? { ...s, label: newLabel } : s
        ),
        updatedAt: new Date(),
      };
    }));
    setTimeout(notifyTemplatesChanged, 0);
  }, []);

  // Export template as JSON
  const exportTemplate = useCallback((id: string): string | null => {
    const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];
    const template = allTemplates.find(t => t.id === id);
    if (!template) return null;

    return JSON.stringify({
      ...template,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }, null, 2);
  }, [customTemplates]);

  // Import template from JSON
  const importTemplate = useCallback((data: string): CustomTemplate | null => {
    try {
      const parsed = JSON.parse(data);

      if (!parsed.name || !parsed.sections || !Array.isArray(parsed.sections)) {
        throw new Error('Invalid template format');
      }

      const now = new Date();
      const imported: CustomTemplate = {
        id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: `${parsed.name} (Imported)`,
        description: parsed.description || '',
        icon: parsed.icon || '📝',
        isDefault: false,
        createdAt: now,
        updatedAt: now,
        createdFrom: 'file',
        sections: parsed.sections.map((s: TemplateSection, i: number) => ({
          ...s,
          id: `section_${Date.now()}_${i}`,
          order: i,
          enabled: s.enabled ?? true,
        })),
      };

      setCustomTemplates(prev => [...prev, imported]);
      setTimeout(notifyTemplatesChanged, 0);
      return imported;
    } catch (error) {
      console.error('Failed to import template:', error);
      return null;
    }
  }, []);

  return {
    customTemplates,
    getAllTemplates,
    getCustomTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    reorderSections,
    addSection,
    removeSection,
    toggleSection,
    renameSection,
    exportTemplate,
    importTemplate,
    defaultTemplates: DEFAULT_TEMPLATES,
  };
};
