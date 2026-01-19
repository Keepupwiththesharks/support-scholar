import { useState } from 'react';
import { FileText, Copy, Download, Check, X, Sparkles, Save, FileJson, FileCode, FileType, Brain, Settings2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecordingSession, KnowledgeArticle, UserProfileType, SavedArticle, OutputTemplateType } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ArticleVisuals } from './ArticleVisuals';
import { SmartContentPanel } from './SmartContentPanel';
import { TemplateSectionDialog } from './TemplateSectionEditor';
import { TemplateSelector } from './TemplateSelector';
import { useTemplateSections } from '@/hooks/useTemplateSections';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { GeneratedContent } from '@/lib/contentGenerationEngine';
import { AVAILABLE_TEMPLATES } from '@/hooks/useCustomProfiles';
import { CustomTemplate, DEFAULT_TEMPLATES } from '@/types/templates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ArticleGeneratorProps {
  session: RecordingSession;
  profileType: UserProfileType;
  onClose: () => void;
  onSaveArticle?: (article: SavedArticle) => void;
  customProfileName?: string;
  customOutputTemplates?: string[];
}

// Template labels for display
const TEMPLATE_LABELS: Record<OutputTemplateType, string> = {
  'study-guide': 'Study Guide',
  'flashcards': 'Flashcards',
  'lecture-notes': 'Lecture Notes',
  'summary': 'Summary',
  'dev-docs': 'Dev Documentation',
  'changelog': 'Changelog',
  'debug-log': 'Debug Log',
  'readme': 'README',
  'knowledge-base': 'Knowledge Base',
  'ticket-summary': 'Ticket Summary',
  'runbook': 'Runbook',
  'research-notes': 'Research Notes',
  'bibliography': 'Bibliography',
  'findings': 'Findings Report',
  'meeting-notes': 'Meeting Notes',
  'simple': 'Simple',
  'detailed': 'Detailed',
};

// Default templates for each profile type (aligned with profile purposes)
const PROFILE_DEFAULT_TEMPLATES: Record<UserProfileType, OutputTemplateType[]> = {
  student: ['study-guide', 'flashcards', 'lecture-notes', 'summary'],
  developer: ['dev-docs', 'readme', 'changelog', 'debug-log'],
  support: ['knowledge-base', 'ticket-summary', 'runbook', 'meeting-notes'],
  researcher: ['research-notes', 'findings', 'bibliography', 'detailed'],
  custom: ['simple', 'detailed', 'summary', 'meeting-notes'],
};

// Export format configurations per profile
const EXPORT_FORMATS: Record<UserProfileType, { formats: string[]; labels: Record<string, string>; icons: Record<string, React.ReactNode> }> = {
  support: {
    formats: ['json', 'markdown', 'html'],
    labels: {
      json: 'System Import (JSON)',
      markdown: 'Documentation (Markdown)',
      html: 'Web Format (HTML)',
    },
    icons: {
      json: <FileJson className="w-4 h-4" />,
      markdown: <FileCode className="w-4 h-4" />,
      html: <FileType className="w-4 h-4" />,
    },
  },
  student: {
    formats: ['pdf', 'markdown', 'anki'],
    labels: {
      pdf: 'Study Guide (PDF)',
      markdown: 'Notes (Markdown)',
      anki: 'Flashcards (Anki)',
    },
    icons: {
      pdf: <FileType className="w-4 h-4" />,
      markdown: <FileCode className="w-4 h-4" />,
      anki: <FileJson className="w-4 h-4" />,
    },
  },
  developer: {
    formats: ['markdown', 'json', 'html'],
    labels: {
      markdown: 'README/Docs (Markdown)',
      json: 'Structured Data (JSON)',
      html: 'Web Docs (HTML)',
    },
    icons: {
      markdown: <FileCode className="w-4 h-4" />,
      json: <FileJson className="w-4 h-4" />,
      html: <FileType className="w-4 h-4" />,
    },
  },
  researcher: {
    formats: ['pdf', 'bibtex', 'markdown'],
    labels: {
      pdf: 'Research Paper (PDF)',
      bibtex: 'Bibliography (BibTeX)',
      markdown: 'Notes (Markdown)',
    },
    icons: {
      pdf: <FileType className="w-4 h-4" />,
      bibtex: <FileCode className="w-4 h-4" />,
      markdown: <FileCode className="w-4 h-4" />,
    },
  },
  custom: {
    formats: ['markdown', 'json', 'txt'],
    labels: {
      markdown: 'Markdown',
      json: 'JSON',
      txt: 'Plain Text',
    },
    icons: {
      markdown: <FileCode className="w-4 h-4" />,
      json: <FileJson className="w-4 h-4" />,
      txt: <FileType className="w-4 h-4" />,
    },
  },
};

// Template-specific content structure interfaces
interface TemplateContent {
  sections: { label: string; content: string | string[] }[];
}

// Generate template-specific content based on template type
const generateTemplateContent = (
  session: RecordingSession, 
  template: OutputTemplateType,
  enabledSectionLabels?: string[]
): TemplateContent => {
  const tabEvents = session.events.filter(e => e.type === 'tab');
  const actionEvents = session.events.filter(e => e.type === 'action');
  const noteEvents = session.events.filter(e => e.type === 'note');
  const appEvents = session.events.filter(e => e.type === 'app');
  
  const codeSnippets = session.events
    .filter(e => e.content?.code)
    .map(e => e.content!.code!)
    .slice(0, 3);
  
  const textContent = session.events
    .filter(e => e.content?.text)
    .map(e => e.content!.text!)
    .slice(0, 5);
  
  const highlights = session.events
    .flatMap(e => e.content?.highlights || [])
    .slice(0, 5);

  const uniqueSources = [...new Set([...tabEvents, ...appEvents].map(e => e.source))].join(', ') || 'various tools';
  const duration = Math.floor(session.events.length / 2);

  // Template-specific content generation
  const templateSections: Record<OutputTemplateType, TemplateContent> = {
    'study-guide': {
      sections: [
        { label: 'Topic', content: session.name },
        { label: 'Key Concepts', content: textContent.slice(0, 4).map(t => `• ${t}`) },
        { label: 'Important Definitions', content: actionEvents.slice(0, 3).map(e => e.content?.text || e.title) },
        { label: 'Code Examples', content: codeSnippets.length > 0 ? codeSnippets : ['No code examples captured'] },
        { label: 'Examples & Applications', content: noteEvents.map(e => e.description) },
        { label: 'Key Highlights', content: highlights.length > 0 ? highlights : ['Review main concepts'] },
        { label: 'Study Tips', content: ['Review key concepts daily', 'Practice with examples', 'Create flashcards'] },
        { label: 'Resources', content: tabEvents.slice(0, 3).map(e => e.url || e.title) },
      ],
    },
    'flashcards': {
      sections: [
        { label: 'Deck Name', content: session.name },
        { label: 'Concept Cards', content: textContent.slice(0, 6).map((t, i) => `Card ${i + 1}: ${t}`) },
        { label: 'Key Terms', content: actionEvents.slice(0, 4).map(e => `Term: ${e.content?.text || e.title}`) },
        { label: 'Code Snippets', content: codeSnippets.length > 0 ? codeSnippets.map((c, i) => `Snippet ${i + 1}:\n${c}`) : ['No code to memorize'] },
        { label: 'Practice Questions', content: ['What is the main concept?', 'How does this relate to previous topics?', 'Explain in your own words'] },
      ],
    },
    'lecture-notes': {
      sections: [
        { label: 'Lecture Title', content: session.name },
        { label: 'Date', content: new Date().toLocaleDateString() },
        { label: 'Main Points', content: textContent.slice(0, 5) },
        { label: 'Detailed Notes', content: actionEvents.map(e => e.content?.text || e.title) },
        { label: 'Code/Formulas', content: codeSnippets.length > 0 ? codeSnippets : ['No code or formulas recorded'] },
        { label: 'Key Takeaways', content: highlights.length > 0 ? highlights : tabEvents.slice(0, 3).map(e => e.title) },
        { label: 'Questions to Review', content: noteEvents.map(e => `Q: ${e.description}`) },
        { label: 'Next Steps', content: ['Review notes', 'Complete assigned readings'] },
      ],
    },
    'summary': {
      sections: [
        { label: 'Session Summary', content: session.name },
        { label: 'Duration', content: `${duration} minutes` },
        { label: 'Topics Covered', content: textContent.slice(0, 4) },
        { label: 'Key Takeaways', content: highlights.length > 0 ? highlights : actionEvents.slice(0, 3).map(e => e.title) },
        { label: 'Notes', content: noteEvents.map(e => e.description) },
      ],
    },
    'dev-docs': {
      sections: [
        { label: 'Feature/Module', content: session.name },
        { label: 'Overview', content: textContent[0] || `Development session covering ${uniqueSources}` },
        { label: 'Architecture', content: 'Component-based architecture with separation of concerns' },
        { label: 'Implementation Details', content: actionEvents.map(e => e.content?.text || e.title) },
        { label: 'Code Snippets', content: codeSnippets.length > 0 ? codeSnippets : ['No code captured'] },
        { label: 'Dependencies', content: ['React', 'TypeScript', 'Tailwind CSS'] },
        { label: 'Key Decisions', content: highlights.length > 0 ? highlights : ['Standard implementation approach'] },
        { label: 'Testing Notes', content: noteEvents.map(e => e.description) },
      ],
    },
    'readme': {
      sections: [
        { label: 'Project Name', content: session.name },
        { label: 'Description', content: textContent[0] || `Documentation from ${duration} minute session` },
        { label: 'Installation', content: ['npm install', 'npm run dev'] },
        { label: 'Usage', content: actionEvents.slice(0, 3).map(e => e.content?.text || e.title) },
        { label: 'Code Examples', content: codeSnippets.length > 0 ? codeSnippets : ['See source files'] },
        { label: 'Configuration', content: 'See .env.example for environment variables' },
        { label: 'Contributing', content: 'Submit PRs with clear descriptions and tests' },
      ],
    },
    'changelog': {
      sections: [
        { label: 'Version', content: `v${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}` },
        { label: 'Date', content: new Date().toLocaleDateString() },
        { label: 'Changes', content: actionEvents.map(e => `• ${e.content?.text || e.title}`) },
        { label: 'Code Changes', content: codeSnippets.length > 0 ? codeSnippets : ['Minor updates'] },
        { label: 'Files Modified', content: tabEvents.filter(e => e.source === 'VS Code').slice(0, 5).map(e => e.title) },
        { label: 'Notes', content: noteEvents.map(e => e.description) },
      ],
    },
    'debug-log': {
      sections: [
        { label: 'Debug Session', content: session.name },
        { label: 'Timestamp', content: new Date().toISOString() },
        { label: 'Issue', content: textContent[0] || actionEvents[0]?.description || 'Debugging session' },
        { label: 'Investigation Steps', content: actionEvents.map(e => e.content?.text || e.title) },
        { label: 'Code Examined', content: codeSnippets.length > 0 ? codeSnippets : ['See console logs'] },
        { label: 'Console Output', content: noteEvents.map(e => `> ${e.description}`) },
        { label: 'Resolution', content: 'Issue identified and resolved' },
      ],
    },
    'knowledge-base': {
      sections: [
        { label: 'Article Title', content: session.name },
        { label: 'Environment', content: `Platform: Web Application | Tools: ${uniqueSources}` },
        { label: 'Problem Description', content: textContent[0] || 'Issue reported by user' },
        { label: 'Root Cause', content: textContent[1] || actionEvents[0]?.description || 'Issue identified' },
        { label: 'Resolution Steps', content: actionEvents.slice(0, 5).map(e => e.content?.text || e.title) },
        { label: 'Technical Details', content: codeSnippets.length > 0 ? codeSnippets : ['No code changes required'] },
        { label: 'Verification', content: 'Issue resolved and verified' },
        { label: 'Tags', content: session.tags.join(', ') || 'support, troubleshooting' },
      ],
    },
    'ticket-summary': {
      sections: [
        { label: 'Ticket ID', content: session.ticketId || `TICKET-${Date.now().toString().slice(-6)}` },
        { label: 'Duration', content: `${duration} minutes` },
        { label: 'Issue Description', content: textContent[0] || 'Support case handled' },
        { label: 'Actions Taken', content: actionEvents.slice(0, 5).map(e => e.content?.text || e.title) },
        { label: 'Outcome', content: 'Issue resolved successfully' },
        { label: 'Notes', content: noteEvents.map(e => e.description) },
      ],
    },
    'runbook': {
      sections: [
        { label: 'Procedure Title', content: session.name },
        { label: 'Prerequisites', content: `Access to: ${uniqueSources}` },
        { label: 'Steps', content: actionEvents.map(e => e.content?.text || e.title) },
        { label: 'Code References', content: codeSnippets.length > 0 ? codeSnippets : ['No code snippets'] },
        { label: 'Troubleshooting Tips', content: noteEvents.map(e => e.description) },
        { label: 'Key Points', content: highlights.length > 0 ? highlights : textContent.slice(0, 3) },
        { label: 'Related Pages', content: tabEvents.slice(0, 3).map(e => e.title) },
      ],
    },
    'research-notes': {
      sections: [
        { label: 'Research Topic', content: session.name },
        { label: 'Hypothesis', content: textContent[0] || 'Initial research question' },
        { label: 'Sources Reviewed', content: tabEvents.slice(0, 5).map(e => e.title) },
        { label: 'Key Findings', content: textContent.slice(1, 5) },
        { label: 'Data/Evidence', content: codeSnippets.length > 0 ? codeSnippets : highlights },
        { label: 'Observations', content: noteEvents.map(e => e.description) },
        { label: 'Further Research', content: ['What are the implications?', 'How does this connect to existing literature?'] },
      ],
    },
    'bibliography': {
      sections: [
        { label: 'Bibliography', content: session.name },
        { label: 'Sources', content: tabEvents.map(e => `${e.title}${e.url ? `. Retrieved from ${e.url}` : ''}`) },
        { label: 'Access Date', content: new Date().toLocaleDateString() },
        { label: 'Notes', content: noteEvents.map(e => e.description) },
      ],
    },
    'findings': {
      sections: [
        { label: 'Study', content: session.name },
        { label: 'Methodology', content: `Qualitative analysis of ${uniqueSources}` },
        { label: 'Data Points', content: `${session.events.length} observations recorded` },
        { label: 'Primary Findings', content: textContent.slice(0, 4) },
        { label: 'Supporting Evidence', content: highlights.length > 0 ? highlights : noteEvents.map(e => e.description) },
        { label: 'Implications', content: 'Findings suggest areas for continued investigation' },
      ],
    },
    'meeting-notes': {
      sections: [
        { label: 'Meeting Title', content: session.name },
        { label: 'Date', content: new Date().toLocaleDateString() },
        { label: 'Duration', content: `${duration} minutes` },
        { label: 'Discussion Points', content: textContent.slice(0, 5) },
        { label: 'Decisions Made', content: actionEvents.map(e => e.content?.text || e.title) },
        { label: 'Action Items', content: noteEvents.map(e => e.description) },
        { label: 'Next Steps', content: highlights.length > 0 ? highlights : ['Follow up on action items'] },
      ],
    },
    'simple': {
      sections: [
        { label: 'Title', content: session.name },
        { label: 'Summary', content: textContent[0] || `${duration} minute session` },
        { label: 'Key Points', content: highlights.length > 0 ? highlights : actionEvents.slice(0, 3).map(e => e.title) },
        { label: 'Notes', content: noteEvents.map(e => e.description) },
      ],
    },
    'detailed': {
      sections: [
        { label: 'Title', content: session.name },
        { label: 'Overview', content: textContent[0] || `${duration} minute session across ${uniqueSources}` },
        { label: 'Activities', content: actionEvents.map(e => e.content?.text || e.title) },
        { label: 'Content Captured', content: codeSnippets.length > 0 ? codeSnippets : textContent.slice(0, 3) },
        { label: 'Key Highlights', content: highlights },
        { label: 'Resources', content: tabEvents.slice(0, 3).map(e => e.url || e.title) },
        { label: 'Notes', content: noteEvents.map(e => e.description) },
        { label: 'Tags', content: session.tags.join(', ') },
      ],
    },
  };

  const content = templateSections[template] || templateSections['simple'];

  // Filter sections based on enabled labels if provided
  if (enabledSectionLabels && enabledSectionLabels.length > 0) {
    return {
      sections: content.sections
        .filter(s => enabledSectionLabels.includes(s.label))
        .sort((a, b) => enabledSectionLabels.indexOf(a.label) - enabledSectionLabels.indexOf(b.label)),
    };
  }

  return content;
};

const generateArticle = (session: RecordingSession, template: OutputTemplateType): KnowledgeArticle => {
  const tabEvents = session.events.filter(e => e.type === 'tab');
  const sessionName = session.ticketId || 'Session';
  const uniqueSources = [...new Set(session.events.map(e => e.source))].join(', ') || 'various tools';

  return {
    id: Math.random().toString(36).substring(2, 15),
    title: `${sessionName} - Activity Recap`,
    summary: `This recap documents ${Math.floor(session.events.length / 2)} minutes of activity across ${uniqueSources}.`,
    problem: '',
    solution: '',
    steps: [],
    relatedLinks: tabEvents.slice(0, 3).map(e => e.url || '').filter(Boolean),
    tags: session.tags.length > 0 ? session.tags : ['recap', 'session'],
    createdAt: new Date(),
    sessionId: session.id,
    template,
  };
};

// Export functions for different formats
const exportAsMarkdown = (article: KnowledgeArticle, content: TemplateContent): string => {
  const sectionsMarkdown = content.sections.map(section => {
    const sectionContent = Array.isArray(section.content) 
      ? section.content.map(item => `- ${item}`).join('\n')
      : section.content;
    return `## ${section.label}\n${sectionContent}`;
  }).join('\n\n');

  return `# ${article.title}

${article.summary}

${sectionsMarkdown}

---
**Tags:** ${article.tags.map(tag => `#${tag}`).join(' ')}
**Generated on:** ${article.createdAt.toLocaleString()}
`;
};

const exportAsJSON = (article: KnowledgeArticle, content: TemplateContent): string => {
  return JSON.stringify({
    title: article.title,
    summary: article.summary,
    sections: content.sections.reduce((acc, section) => {
      acc[section.label.toLowerCase().replace(/\s+/g, '_')] = section.content;
      return acc;
    }, {} as Record<string, string | string[]>),
    tags: article.tags,
    createdAt: article.createdAt.toISOString(),
    sessionId: article.sessionId,
  }, null, 2);
};

const exportAsHTML = (article: KnowledgeArticle, content: TemplateContent): string => {
  const sectionsHTML = content.sections.map(section => {
    const sectionContent = Array.isArray(section.content) 
      ? `<ul>${section.content.map(item => `<li>${item}</li>`).join('')}</ul>`
      : `<p>${section.content}</p>`;
    return `<section><h2>${section.label}</h2>${sectionContent}</section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${article.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { color: #1a1a1a; } h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    .summary { background: #f5f5f5; padding: 1rem; border-radius: 8px; }
    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .tag { background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>${article.title}</h1>
  <div class="summary"><p>${article.summary}</p></div>
  ${sectionsHTML}
  <div class="tags">${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>
  <p><small>Generated on ${article.createdAt.toLocaleString()}</small></p>
</body>
</html>`;
};

const exportAsBibTeX = (article: KnowledgeArticle, content: TemplateContent): string => {
  const sources = content.sections.find(s => s.label === 'Sources')?.content || [];
  const entries = (Array.isArray(sources) ? sources : [sources]).map((source, i) => {
    const key = `source${i + 1}_${Date.now()}`;
    return `@misc{${key},
  title = {${typeof source === 'string' ? source.split('.')[0] : source}},
  year = {${new Date().getFullYear()}},
  note = {Accessed: ${new Date().toLocaleDateString()}}
}`;
  });
  return entries.join('\n\n');
};

const exportAsAnki = (article: KnowledgeArticle, content: TemplateContent): string => {
  const cards: { front: string; back: string }[] = [];
  
  content.sections.forEach(section => {
    if (Array.isArray(section.content)) {
      section.content.forEach((item, i) => {
        cards.push({
          front: `${section.label} - Item ${i + 1}`,
          back: item,
        });
      });
    }
  });

  return JSON.stringify({ deck: article.title, cards }, null, 2);
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const ArticleGenerator = ({ 
  session, 
  profileType, 
  onClose, 
  onSaveArticle,
  customProfileName,
  customOutputTemplates,
}: ArticleGeneratorProps) => {
  const { getAllTemplates, getTemplateById } = useCustomTemplates();
  
  // Get all available templates (both default and custom)
  const allTemplates = getAllTemplates();
  
  // Determine available templates - use custom templates if provided, otherwise use profile defaults
  const availableTemplates: OutputTemplateType[] = customOutputTemplates && customOutputTemplates.length > 0
    ? (customOutputTemplates.filter(t => TEMPLATE_LABELS[t as OutputTemplateType]) as OutputTemplateType[])
    : PROFILE_DEFAULT_TEMPLATES[profileType];
  
  // Ensure we have at least one template
  const templates = availableTemplates.length > 0 ? availableTemplates : ['simple'] as OutputTemplateType[];
  
  const exportConfig = EXPORT_FORMATS[profileType];
  const [generationMode, setGenerationMode] = useState<'article' | 'smart'>('article');
  const [template, setTemplate] = useState<OutputTemplateType>(templates[0]);
  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState<CustomTemplate | null>(
    DEFAULT_TEMPLATES[0]
  );
  const [useCustomTemplateMode, setUseCustomTemplateMode] = useState(false);
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [templateContent, setTemplateContent] = useState<TemplateContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();
  const { getEnabledSections, hasCustomizations } = useTemplateSections();

  const handleApplySmartContent = (smartContent: GeneratedContent) => {
    if (article && templateContent) {
      setArticle({
        ...article,
        summary: smartContent.summary,
        tags: [...new Set([...article.tags, ...smartContent.tags])],
      });
      toast({
        title: 'Smart content applied',
        description: 'Insights and tags have been added to your article',
      });
    }
  };

  // Generate content for custom templates
  const generateCustomTemplateContent = (customTemplate: CustomTemplate): TemplateContent => {
    const tabEvents = session.events.filter(e => e.type === 'tab');
    const actionEvents = session.events.filter(e => e.type === 'action');
    const noteEvents = session.events.filter(e => e.type === 'note');
    const textContent = session.events.filter(e => e.content?.text).map(e => e.content!.text!).slice(0, 5);
    const highlights = session.events.flatMap(e => e.content?.highlights || []).slice(0, 5);
    const codeSnippets = session.events.filter(e => e.content?.code).map(e => e.content!.code!).slice(0, 3);
    
    const enabledSections = customTemplate.sections.filter(s => s.enabled);
    
    return {
      sections: enabledSections.map((section, i) => {
        // Generate appropriate content based on section label
        const label = section.label.toLowerCase();
        let content: string | string[] = '';
        
        if (label.includes('title') || label.includes('topic') || label.includes('name')) {
          content = session.name;
        } else if (label.includes('summary') || label.includes('overview')) {
          content = textContent[0] || `Session covering ${session.events.length} activities`;
        } else if (label.includes('key point') || label.includes('highlight') || label.includes('takeaway')) {
          content = highlights.length > 0 ? highlights : textContent.slice(0, 3);
        } else if (label.includes('action') || label.includes('task') || label.includes('next step')) {
          content = actionEvents.slice(0, 5).map(e => e.content?.text || e.title);
        } else if (label.includes('note') || label.includes('observation')) {
          content = noteEvents.map(e => e.description);
        } else if (label.includes('source') || label.includes('resource') || label.includes('reference')) {
          content = tabEvents.slice(0, 5).map(e => e.url || e.title);
        } else if (label.includes('code') || label.includes('snippet')) {
          content = codeSnippets.length > 0 ? codeSnippets : ['No code captured'];
        } else if (label.includes('date') || label.includes('time')) {
          content = new Date().toLocaleDateString();
        } else if (label.includes('detail') || label.includes('description')) {
          content = actionEvents.map(e => e.content?.text || e.description);
        } else if (label.includes('finding') || label.includes('result') || label.includes('conclusion')) {
          content = highlights.length > 0 ? highlights : textContent;
        } else if (label.includes('question')) {
          content = ['What are the key learnings?', 'How can this be applied?', 'What needs follow-up?'];
        } else if (label.includes('participant') || label.includes('attendee')) {
          content = 'Not specified';
        } else if (label.includes('decision')) {
          content = actionEvents.slice(0, 3).map(e => e.content?.text || e.title);
        } else {
          // Default: use mixed content
          content = textContent.length > 0 ? textContent : actionEvents.slice(0, 3).map(e => e.title);
        }
        
        return { label: section.label, content };
      }),
    };
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (useCustomTemplateMode && selectedCustomTemplate) {
      // Use custom template
      const customContent = generateCustomTemplateContent(selectedCustomTemplate);
      setArticle({
        id: Math.random().toString(36).substring(2, 15),
        title: `${session.name} - ${selectedCustomTemplate.name}`,
        summary: `Generated using the "${selectedCustomTemplate.name}" template`,
        problem: '',
        solution: '',
        steps: [],
        relatedLinks: [],
        tags: session.tags.length > 0 ? session.tags : ['recap'],
        createdAt: new Date(),
        sessionId: session.id,
        template: 'simple', // Fallback for type
      });
      setTemplateContent(customContent);
    } else {
      // Use built-in template
      setArticle(generateArticle(session, template));
      const enabledSections = getEnabledSections(profileType, template);
      const enabledLabels = enabledSections.map(s => s.label);
      setTemplateContent(generateTemplateContent(session, template, enabledLabels));
    }
    
    setIsGenerating(false);
    setSaved(false);
  };

  const handleCopy = () => {
    if (!article || !templateContent) return;
    const markdown = exportAsMarkdown(article, templateContent);
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'Article content copied in Markdown format',
    });
  };

  const handleSave = () => {
    if (!article || !templateContent || !onSaveArticle) return;
    
    const savedArticle: SavedArticle = {
      id: article.id,
      title: article.title,
      summary: article.summary,
      sections: templateContent.sections,
      tags: article.tags,
      createdAt: article.createdAt,
      sessionId: article.sessionId,
      profileType,
      templateType: template,
      templateLabel: TEMPLATE_LABELS[template],
    };
    
    onSaveArticle(savedArticle);
    setSaved(true);
    toast({
      title: 'Article saved',
      description: 'You can find it in the Articles tab',
    });
  };

  const handleExport = (format: string) => {
    if (!article || !templateContent) return;

    const filename = article.title.replace(/\s+/g, '_').toLowerCase();
    
    switch (format) {
      case 'markdown':
        downloadFile(exportAsMarkdown(article, templateContent), `${filename}.md`, 'text/markdown');
        break;
      case 'json':
        downloadFile(exportAsJSON(article, templateContent), `${filename}.json`, 'application/json');
        break;
      case 'html':
        downloadFile(exportAsHTML(article, templateContent), `${filename}.html`, 'text/html');
        break;
      case 'pdf':
        // For PDF, we'll export as HTML and let the user print to PDF
        const htmlContent = exportAsHTML(article, templateContent);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
        }
        break;
      case 'bibtex':
        downloadFile(exportAsBibTeX(article, templateContent), `${filename}.bib`, 'application/x-bibtex');
        break;
      case 'anki':
        downloadFile(exportAsAnki(article, templateContent), `${filename}_anki.json`, 'application/json');
        break;
      case 'txt':
        const plainText = `${article.title}\n\n${article.summary}\n\n` +
          templateContent.sections.map(s => 
            `${s.label}:\n${Array.isArray(s.content) ? s.content.join('\n') : s.content}`
          ).join('\n\n');
        downloadFile(plainText, `${filename}.txt`, 'text/plain');
        break;
    }

    toast({
      title: 'Export complete',
      description: `Article exported as ${exportConfig.labels[format]}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Generate Knowledge Article</h2>
              <p className="text-sm text-muted-foreground">{session.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Mode Selector */}
          <div className="flex items-center gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
            <button
              onClick={() => { setGenerationMode('article'); setArticle(null); setSaved(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                generationMode === 'article' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              Knowledge Article
            </button>
            <button
              onClick={() => { setGenerationMode('smart'); setArticle(null); setSaved(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                generationMode === 'smart' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Brain className="w-4 h-4" />
              Smart Content Analysis
            </button>
          </div>

          {generationMode === 'smart' ? (
            <SmartContentPanel 
              session={session} 
              profileType={profileType}
              onApplyContent={handleApplySmartContent}
            />
          ) : (
          <>
            {/* Template Mode Toggle */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setUseCustomTemplateMode(false); setArticle(null); setSaved(false); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    !useCustomTemplateMode 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Profile Templates
                </button>
                <button
                  onClick={() => { setUseCustomTemplateMode(true); setArticle(null); setSaved(false); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    useCustomTemplateMode 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Custom Templates
                </button>
              </div>
              {useCustomTemplateMode && selectedCustomTemplate && (
                <TemplateSelector
                  selectedTemplateId={selectedCustomTemplate.id}
                  onSelectTemplate={(t) => {
                    setSelectedCustomTemplate(t);
                    setArticle(null);
                    setSaved(false);
                  }}
                />
              )}
            </div>

            {useCustomTemplateMode ? (
              /* Custom Template Mode */
              <div>
                {!article ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Sparkles className="w-16 h-16 text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                    <p className="text-muted-foreground text-center mb-4 max-w-md">
                      Using the <strong>{selectedCustomTemplate?.name}</strong> template with {selectedCustomTemplate?.sections.filter(s => s.enabled).length} sections.
                    </p>
                    <Button 
                      variant="gradient" 
                      size="lg" 
                      onClick={handleGenerate}
                      disabled={isGenerating || !selectedCustomTemplate}
                    >
                      {isGenerating ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate {selectedCustomTemplate?.name || 'Article'}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="prose prose-sm max-w-none">
                      <h1 className="text-xl font-bold mb-4">{article.title}</h1>
                      
                      <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                        <p className="text-foreground text-sm">{article.summary}</p>
                      </div>

                      {templateContent?.sections.map((section, index) => (
                        <div key={index} className="mb-4">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {section.label}
                          </h3>
                          {Array.isArray(section.content) ? (
                            section.content.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1">
                                {section.content.map((item, i) => (
                                  <li key={i} className="text-foreground">
                                    {item.includes('\n') ? (
                                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">{item}</pre>
                                    ) : item}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground italic">No items recorded</p>
                            )
                          ) : (
                            <p className="text-foreground">{section.content}</p>
                          )}
                        </div>
                      ))}

                      <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t">
                        {article.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </div>
            ) : (
            /* Profile Template Mode */
          <Tabs value={template} onValueChange={(v) => { setTemplate(v as OutputTemplateType); setArticle(null); setSaved(false); }}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className={`grid grid-cols-${Math.min(templates.length, 4)}`}>
                {templates.map((t) => (
                  <TabsTrigger key={t} value={t}>
                    {TEMPLATE_LABELS[t]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TemplateSectionDialog
                profileType={profileType}
                templateKey={template}
                templateLabel={TEMPLATE_LABELS[template]}
              />
            </div>

            <TabsContent value={template} className="mt-0">
              {!article ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md">
                    AI will analyze {session.events.length} captured events and create a structured {TEMPLATE_LABELS[template]} you can save, share, or export.
                  </p>
                  {hasCustomizations(profileType, template) && (
                    <p className="text-xs text-primary mb-4 flex items-center gap-1">
                      <Settings2 className="w-3 h-3" />
                      Using custom section structure
                    </p>
                  )}
                  <Button 
                    variant="gradient" 
                    size="lg" 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate {TEMPLATE_LABELS[template]}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="prose prose-sm max-w-none">
                    <h1 className="text-xl font-bold mb-4">{article.title}</h1>
                    
                    <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                      <p className="text-foreground text-sm">{article.summary}</p>
                    </div>


                    {/* Visual elements for students and researchers */}
                    <ArticleVisuals 
                      session={session} 
                      profileType={profileType} 
                      templateType={template} 
                    />

                    {templateContent?.sections.map((section, index) => (
                      <div key={index} className="mb-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {section.label}
                        </h3>
                        {Array.isArray(section.content) ? (
                          section.content.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {section.content.map((item, i) => (
                                <li key={i} className="text-foreground">
                                  {item.includes('\n') ? (
                                    <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">{item}</pre>
                                  ) : item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground italic">No items recorded</p>
                          )
                        ) : (
                          section.content.includes('\n') && section.content.includes('const') ? (
                            <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">{section.content}</pre>
                          ) : (
                            <p className="text-foreground">{section.content}</p>
                          )
                        )}
                      </div>
                    ))}

                    <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t">
                      {article.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
          )}
          </>
          )}
        </div>

        {article && (
          <div className="flex items-center justify-between p-6 border-t bg-secondary/30">
            <p className="text-sm text-muted-foreground">
              Generated from {session.events.length} events
            </p>
            <div className="flex gap-2">
              {onSaveArticle && (
                <Button variant="outline" onClick={handleSave} disabled={saved}>
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save'}
                </Button>
              )}
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="gradient">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {exportConfig.formats.map(format => (
                    <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
                      {exportConfig.icons[format]}
                      <span className="ml-2">{exportConfig.labels[format]}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
