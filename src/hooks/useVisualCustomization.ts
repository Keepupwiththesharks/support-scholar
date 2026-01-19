import { useState, useCallback } from 'react';

export type VisualType = 
  | 'conceptMap' 
  | 'learningFlow' 
  | 'insights' 
  | 'researchFlow' 
  | 'sourceChart' 
  | 'timeline' 
  | 'radar' 
  | 'progress';

export interface VisualConfig {
  id: VisualType;
  label: string;
  enabled: boolean;
  order: number;
}

export interface EditableContent {
  conceptMapTitle: string;
  conceptMapItems: string[];
  flowSteps: string[];
  insightItems: string[];
  researchStages: { label: string; icon: string; status: 'complete' | 'current' | 'pending' }[];
}

const DEFAULT_VISUALS: Record<VisualType, { label: string; order: number }> = {
  conceptMap: { label: 'Concept Map', order: 0 },
  learningFlow: { label: 'Learning Flow', order: 1 },
  insights: { label: 'Key Insights', order: 2 },
  researchFlow: { label: 'Research Progress', order: 3 },
  sourceChart: { label: 'Source Analysis', order: 4 },
  timeline: { label: 'Activity Timeline', order: 5 },
  radar: { label: 'Topic Coverage', order: 6 },
  progress: { label: 'Session Metrics', order: 7 },
};

export const useVisualCustomization = (initialVisuals: VisualType[] = []) => {
  const [visuals, setVisuals] = useState<VisualConfig[]>(() => 
    initialVisuals.map((id, index) => ({
      id,
      label: DEFAULT_VISUALS[id].label,
      enabled: true,
      order: index,
    }))
  );

  const [editableContent, setEditableContent] = useState<EditableContent>({
    conceptMapTitle: '',
    conceptMapItems: [],
    flowSteps: [],
    insightItems: [],
    researchStages: [
      { label: 'Question', icon: '❓', status: 'complete' },
      { label: 'Research', icon: '🔍', status: 'complete' },
      { label: 'Analyze', icon: '📊', status: 'current' },
      { label: 'Conclude', icon: '✅', status: 'pending' },
    ],
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const toggleVisual = useCallback((id: VisualType) => {
    setVisuals(prev => prev.map(v => 
      v.id === id ? { ...v, enabled: !v.enabled } : v
    ));
  }, []);

  const reorderVisuals = useCallback((fromIndex: number, toIndex: number) => {
    setVisuals(prev => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result.map((v, i) => ({ ...v, order: i }));
    });
  }, []);

  const moveVisualUp = useCallback((id: VisualType) => {
    setVisuals(prev => {
      const index = prev.findIndex(v => v.id === id);
      if (index <= 0) return prev;
      const result = [...prev];
      [result[index - 1], result[index]] = [result[index], result[index - 1]];
      return result.map((v, i) => ({ ...v, order: i }));
    });
  }, []);

  const moveVisualDown = useCallback((id: VisualType) => {
    setVisuals(prev => {
      const index = prev.findIndex(v => v.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;
      const result = [...prev];
      [result[index], result[index + 1]] = [result[index + 1], result[index]];
      return result.map((v, i) => ({ ...v, order: i }));
    });
  }, []);

  const updateConceptMapTitle = useCallback((title: string) => {
    setEditableContent(prev => ({ ...prev, conceptMapTitle: title }));
  }, []);

  const updateConceptMapItem = useCallback((index: number, value: string) => {
    setEditableContent(prev => ({
      ...prev,
      conceptMapItems: prev.conceptMapItems.map((item, i) => i === index ? value : item),
    }));
  }, []);

  const updateFlowStep = useCallback((index: number, value: string) => {
    setEditableContent(prev => ({
      ...prev,
      flowSteps: prev.flowSteps.map((step, i) => i === index ? value : step),
    }));
  }, []);

  const updateInsightItem = useCallback((index: number, value: string) => {
    setEditableContent(prev => ({
      ...prev,
      insightItems: prev.insightItems.map((item, i) => i === index ? value : item),
    }));
  }, []);

  const updateResearchStage = useCallback((index: number, updates: Partial<EditableContent['researchStages'][0]>) => {
    setEditableContent(prev => ({
      ...prev,
      researchStages: prev.researchStages.map((stage, i) => 
        i === index ? { ...stage, ...updates } : stage
      ),
    }));
  }, []);

  const initializeContent = useCallback((content: Partial<EditableContent>) => {
    setEditableContent(prev => ({ ...prev, ...content }));
  }, []);

  const enabledVisuals = visuals.filter(v => v.enabled).sort((a, b) => a.order - b.order);

  return {
    visuals,
    enabledVisuals,
    editableContent,
    isEditMode,
    setIsEditMode,
    toggleVisual,
    reorderVisuals,
    moveVisualUp,
    moveVisualDown,
    updateConceptMapTitle,
    updateConceptMapItem,
    updateFlowStep,
    updateInsightItem,
    updateResearchStage,
    initializeContent,
  };
};
