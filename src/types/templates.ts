// Custom Template Builder Types

export interface TemplateSection {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  order: number;
  enabled: boolean;
}

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: TemplateSection[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdFrom?: 'scratch' | 'url' | 'file' | 'default';
  sourceUrl?: string;
}

// The 4 default templates
export const DEFAULT_TEMPLATES: CustomTemplate[] = [
  {
    id: 'quick-summary',
    name: 'Quick Summary',
    description: 'A brief overview with key points and takeaways',
    icon: '⚡',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdFrom: 'default',
    sections: [
      { id: 'qs-1', label: 'Title', description: 'Main title or topic', order: 0, enabled: true },
      { id: 'qs-2', label: 'Overview', description: 'Brief 2-3 sentence summary', order: 1, enabled: true },
      { id: 'qs-3', label: 'Key Points', description: 'Main highlights (bullet points)', order: 2, enabled: true },
      { id: 'qs-4', label: 'Takeaways', description: 'What to remember', order: 3, enabled: true },
    ],
  },
  {
    id: 'detailed-report',
    name: 'Detailed Report',
    description: 'Comprehensive documentation with full context',
    icon: '📄',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdFrom: 'default',
    sections: [
      { id: 'dr-1', label: 'Title', description: 'Report title', order: 0, enabled: true },
      { id: 'dr-2', label: 'Executive Summary', description: 'High-level overview for stakeholders', order: 1, enabled: true },
      { id: 'dr-3', label: 'Background', description: 'Context and situation', order: 2, enabled: true },
      { id: 'dr-4', label: 'Details', description: 'Full breakdown of information', order: 3, enabled: true },
      { id: 'dr-5', label: 'Analysis', description: 'Interpretation and insights', order: 4, enabled: true },
      { id: 'dr-6', label: 'Conclusions', description: 'Final thoughts and outcomes', order: 5, enabled: true },
      { id: 'dr-7', label: 'Appendix', description: 'Supporting materials and references', order: 6, enabled: true },
    ],
  },
  {
    id: 'action-items',
    name: 'Action Items',
    description: 'Task-focused format with priorities and deadlines',
    icon: '✅',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdFrom: 'default',
    sections: [
      { id: 'ai-1', label: 'Meeting/Session Title', description: 'What was this about', order: 0, enabled: true },
      { id: 'ai-2', label: 'Date', description: 'When this occurred', order: 1, enabled: true },
      { id: 'ai-3', label: 'Participants', description: 'Who was involved', order: 2, enabled: true },
      { id: 'ai-4', label: 'Decisions Made', description: 'Key decisions reached', order: 3, enabled: true },
      { id: 'ai-5', label: 'Action Items', description: 'Tasks with owners and deadlines', order: 4, enabled: true },
      { id: 'ai-6', label: 'Next Steps', description: 'Immediate follow-ups needed', order: 5, enabled: true },
    ],
  },
  {
    id: 'research-notes',
    name: 'Research Notes',
    description: 'Academic-style notes with sources and findings',
    icon: '🔬',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdFrom: 'default',
    sections: [
      { id: 'rn-1', label: 'Research Topic', description: 'Subject being researched', order: 0, enabled: true },
      { id: 'rn-2', label: 'Hypothesis/Question', description: 'What you\'re trying to answer', order: 1, enabled: true },
      { id: 'rn-3', label: 'Sources Reviewed', description: 'Materials and references used', order: 2, enabled: true },
      { id: 'rn-4', label: 'Key Findings', description: 'Important discoveries', order: 3, enabled: true },
      { id: 'rn-5', label: 'Evidence', description: 'Supporting data and quotes', order: 4, enabled: true },
      { id: 'rn-6', label: 'Observations', description: 'Personal notes and insights', order: 5, enabled: true },
      { id: 'rn-7', label: 'Questions for Further Research', description: 'Open questions to explore', order: 6, enabled: true },
    ],
  },
];

// Commonly used section suggestions for building custom templates
export const SUGGESTED_SECTIONS = [
  { label: 'Title', description: 'Main title or heading' },
  { label: 'Summary', description: 'Brief overview' },
  { label: 'Introduction', description: 'Opening context' },
  { label: 'Background', description: 'Relevant context' },
  { label: 'Key Points', description: 'Main highlights' },
  { label: 'Details', description: 'In-depth information' },
  { label: 'Analysis', description: 'Interpretation' },
  { label: 'Findings', description: 'Discoveries made' },
  { label: 'Action Items', description: 'Tasks to complete' },
  { label: 'Next Steps', description: 'What to do next' },
  { label: 'Conclusions', description: 'Final thoughts' },
  { label: 'Resources', description: 'Links and references' },
  { label: 'Notes', description: 'Additional notes' },
  { label: 'Questions', description: 'Open questions' },
  { label: 'Code Snippets', description: 'Code examples' },
  { label: 'Screenshots', description: 'Visual references' },
];

export const TEMPLATE_ICONS = [
  '📝', '📄', '📋', '📑', '📊', '📈', '📉', '🗂️',
  '⚡', '✅', '🎯', '💡', '🔬', '📚', '🎓', '💼',
  '🛠️', '🔧', '📦', '🚀', '🔍', '📌', '🏷️', '📎',
];
