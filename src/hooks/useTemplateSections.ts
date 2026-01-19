import { useState, useCallback, useEffect } from 'react';
import { UserProfileType, KnowledgeArticle } from '@/types';

export interface TemplateSection {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
  description?: string;
}

export interface TemplateConfig {
  profileType: UserProfileType;
  templateKey: KnowledgeArticle['template'];
  sections: TemplateSection[];
}

type TemplateConfigKey = `${UserProfileType}_${KnowledgeArticle['template']}`;

const STORAGE_KEY = 'recap-template-sections';

// Default sections for each profile/template combination
const DEFAULT_TEMPLATE_SECTIONS: Record<string, string[]> = {
  // Support templates
  'support_salesforce': ['Case Number', 'Environment', 'Customer Impact', 'Root Cause', 'Resolution Steps', 'Technical Details', 'Verification', 'Time to Resolution', 'Key Observations', 'Knowledge Tags'],
  'support_microsoft': ['Article Title', 'Applies To', 'Symptoms', 'Cause', 'Resolution', 'Technical Notes', 'More Information', 'Keywords'],
  'support_confluence': ['Overview', 'Prerequisites', 'Procedure', 'Code References', 'Troubleshooting Tips', 'Key Points', 'Related Pages'],
  'support_custom': ['Ticket Summary', 'Duration', 'Issue Description', 'Actions Taken', 'Outcome', 'Notes'],
  
  // Student templates
  'student_microsoft': ['Topic', 'Key Concepts', 'Important Definitions', 'Code Examples', 'Examples & Applications', 'Key Highlights', 'Study Tips', 'Resources'],
  'student_confluence': ['Lecture Title', 'Date', 'Main Points', 'Detailed Notes', 'Code/Formulas', 'Key Takeaways', 'Questions to Review', 'Next Steps'],
  'student_custom': ['Deck Name', 'Concept Cards', 'Key Terms', 'Code Snippets', 'Practice Questions'],
  'student_salesforce': ['Session Summary', 'Topics Covered', 'Key Takeaways', 'Duration'],
  
  // Developer templates
  'developer_confluence': ['Feature/Module', 'Overview', 'Architecture', 'Implementation Details', 'Code Snippets', 'Code References', 'Dependencies', 'Key Decisions', 'Testing Notes'],
  'developer_microsoft': ['Project Name', 'Description', 'Installation', 'Usage', 'Code Examples', 'Configuration', 'Contributing'],
  'developer_custom': ['Version', 'Date', 'Changes', 'Code Changes', 'Files Modified', 'Notes'],
  'developer_salesforce': ['Debug Session', 'Timestamp', 'Issue', 'Investigation Steps', 'Code Examined', 'Console Output', 'Resolution'],
  
  // Researcher templates
  'researcher_microsoft': ['Research Topic', 'Hypothesis', 'Sources Reviewed', 'Key Findings', 'Data/Evidence', 'Observations', 'Questions for Further Research'],
  'researcher_confluence': ['Review Title', 'Scope', 'Sources', 'Key Excerpts', 'Themes Identified', 'Gaps in Literature', 'Conclusions'],
  'researcher_salesforce': ['Study', 'Methodology', 'Data Points', 'Primary Findings', 'Data/Code', 'Supporting Evidence', 'Implications'],
  'researcher_custom': ['Bibliography', 'Sources Consulted', 'Citation Format'],
  
  // Custom profile templates
  'custom_salesforce': ['Title', 'Overview', 'Details', 'Conclusion'],
  'custom_microsoft': ['Title', 'Summary', 'Content', 'Key Points', 'References'],
  'custom_confluence': ['Title', 'Description', 'Main Content', 'Notes'],
  'custom_custom': ['Title', 'Content', 'Notes'],
};

// Section descriptions for better UX
const SECTION_DESCRIPTIONS: Record<string, string> = {
  'Case Number': 'Unique identifier for the support case',
  'Environment': 'System/platform details where issue occurred',
  'Customer Impact': 'How the issue affects the customer',
  'Root Cause': 'Underlying cause of the issue',
  'Resolution Steps': 'Steps taken to resolve the issue',
  'Technical Details': 'Code snippets or technical information',
  'Verification': 'Confirmation that issue is resolved',
  'Key Concepts': 'Main ideas and concepts to learn',
  'Important Definitions': 'Key terms and their meanings',
  'Study Tips': 'Recommendations for effective studying',
  'Quiz Questions': 'Practice questions for self-testing',
  'Architecture': 'System design and component structure',
  'Dependencies': 'Required packages and libraries',
  'Hypothesis': 'Research question or assumption',
  'Methodology': 'Research approach and methods used',
};

const createDefaultSections = (labels: string[]): TemplateSection[] => {
  return labels.map((label, index) => ({
    id: `section_${index}_${label.toLowerCase().replace(/\s+/g, '_')}`,
    label,
    enabled: true,
    order: index,
    description: SECTION_DESCRIPTIONS[label],
  }));
};

export const useTemplateSections = () => {
  const [configs, setConfigs] = useState<Record<string, TemplateConfig>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return {};
  });

  // Save to localStorage whenever configs change
  useEffect(() => {
    if (Object.keys(configs).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    }
  }, [configs]);

  const getConfigKey = (profileType: UserProfileType, templateKey: KnowledgeArticle['template']): TemplateConfigKey => {
    return `${profileType}_${templateKey}`;
  };

  const getDefaultSections = useCallback((profileType: UserProfileType, templateKey: KnowledgeArticle['template']): TemplateSection[] => {
    const key = getConfigKey(profileType, templateKey);
    const defaultLabels = DEFAULT_TEMPLATE_SECTIONS[key] || ['Title', 'Content', 'Notes'];
    return createDefaultSections(defaultLabels);
  }, []);

  const getSections = useCallback((profileType: UserProfileType, templateKey: KnowledgeArticle['template']): TemplateSection[] => {
    const key = getConfigKey(profileType, templateKey);
    if (configs[key]) {
      return configs[key].sections.sort((a, b) => a.order - b.order);
    }
    return getDefaultSections(profileType, templateKey);
  }, [configs, getDefaultSections]);

  const getEnabledSections = useCallback((profileType: UserProfileType, templateKey: KnowledgeArticle['template']): TemplateSection[] => {
    return getSections(profileType, templateKey).filter(s => s.enabled);
  }, [getSections]);

  const updateSections = useCallback((
    profileType: UserProfileType, 
    templateKey: KnowledgeArticle['template'], 
    sections: TemplateSection[]
  ) => {
    const key = getConfigKey(profileType, templateKey);
    setConfigs(prev => ({
      ...prev,
      [key]: {
        profileType,
        templateKey,
        sections,
      },
    }));
  }, []);

  const toggleSection = useCallback((
    profileType: UserProfileType, 
    templateKey: KnowledgeArticle['template'], 
    sectionId: string
  ) => {
    const sections = getSections(profileType, templateKey);
    const updated = sections.map(s => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    updateSections(profileType, templateKey, updated);
  }, [getSections, updateSections]);

  const reorderSections = useCallback((
    profileType: UserProfileType, 
    templateKey: KnowledgeArticle['template'], 
    fromIndex: number, 
    toIndex: number
  ) => {
    const sections = getSections(profileType, templateKey);
    const updated = [...sections];
    const [removed] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, removed);
    
    // Update order values
    const reordered = updated.map((s, i) => ({ ...s, order: i }));
    updateSections(profileType, templateKey, reordered);
  }, [getSections, updateSections]);

  const addSection = useCallback((
    profileType: UserProfileType, 
    templateKey: KnowledgeArticle['template'], 
    label: string,
    description?: string
  ) => {
    const sections = getSections(profileType, templateKey);
    const newSection: TemplateSection = {
      id: `section_${Date.now()}_${label.toLowerCase().replace(/\s+/g, '_')}`,
      label,
      enabled: true,
      order: sections.length,
      description,
    };
    updateSections(profileType, templateKey, [...sections, newSection]);
  }, [getSections, updateSections]);

  const removeSection = useCallback((
    profileType: UserProfileType, 
    templateKey: KnowledgeArticle['template'], 
    sectionId: string
  ) => {
    const sections = getSections(profileType, templateKey);
    const updated = sections
      .filter(s => s.id !== sectionId)
      .map((s, i) => ({ ...s, order: i }));
    updateSections(profileType, templateKey, updated);
  }, [getSections, updateSections]);

  const renameSection = useCallback((
    profileType: UserProfileType, 
    templateKey: KnowledgeArticle['template'], 
    sectionId: string,
    newLabel: string
  ) => {
    const sections = getSections(profileType, templateKey);
    const updated = sections.map(s => 
      s.id === sectionId ? { ...s, label: newLabel } : s
    );
    updateSections(profileType, templateKey, updated);
  }, [getSections, updateSections]);

  const resetToDefaults = useCallback((
    profileType: UserProfileType, 
    templateKey: KnowledgeArticle['template']
  ) => {
    const key = getConfigKey(profileType, templateKey);
    setConfigs(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const hasCustomizations = useCallback((
    profileType: UserProfileType, 
    templateKey: KnowledgeArticle['template']
  ): boolean => {
    const key = getConfigKey(profileType, templateKey);
    return key in configs;
  }, [configs]);

  return {
    getSections,
    getEnabledSections,
    getDefaultSections,
    updateSections,
    toggleSection,
    reorderSections,
    addSection,
    removeSection,
    renameSection,
    resetToDefaults,
    hasCustomizations,
  };
};
