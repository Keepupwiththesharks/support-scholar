import { useState } from 'react';
import { FileText, Copy, Download, Check, X, Sparkles, Save, FileJson, FileCode, FileType, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecordingSession, KnowledgeArticle, SavedArticle } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { SmartContentPanel } from './SmartContentPanel';
import { TemplateSelector } from './TemplateSelector';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { GeneratedContent } from '@/lib/contentGenerationEngine';
import { CustomTemplate, DEFAULT_TEMPLATES } from '@/types/templates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ArticleGeneratorProps {
  session: RecordingSession;
  onClose: () => void;
  onSaveArticle?: (article: SavedArticle) => void;
}

// Template-specific content structure
interface TemplateContent {
  sections: { label: string; content: string | string[] }[];
}

// Generate content based on custom template
const generateTemplateContent = (
  session: RecordingSession, 
  template: CustomTemplate
): TemplateContent => {
  const tabEvents = session.events.filter(e => e.type === 'tab');
  const actionEvents = session.events.filter(e => e.type === 'action');
  const noteEvents = session.events.filter(e => e.type === 'note');
  
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

  const uniqueSources = [...new Set([...tabEvents].map(e => e.source))].join(', ') || 'various tools';
  const duration = Math.floor(session.events.length / 2);

  const enabledSections = template.sections.filter(s => s.enabled);
  
  return {
    sections: enabledSections.map((section) => {
      const label = section.label.toLowerCase();
      let content: string | string[] = '';
      
      if (label.includes('title') || label.includes('topic') || label.includes('name')) {
        content = session.name;
      } else if (label.includes('overview') || label.includes('summary')) {
        content = textContent[0] || `${duration} minute session covering ${uniqueSources}`;
      } else if (label.includes('key point') || label.includes('highlight') || label.includes('takeaway')) {
        content = highlights.length > 0 ? highlights : textContent.slice(0, 3);
      } else if (label.includes('action') || label.includes('task') || label.includes('next step') || label.includes('decision')) {
        content = actionEvents.slice(0, 5).map(e => e.content?.text || e.title);
      } else if (label.includes('note') || label.includes('observation')) {
        content = noteEvents.map(e => e.description);
      } else if (label.includes('source') || label.includes('resource') || label.includes('reference') || label.includes('appendix')) {
        content = tabEvents.slice(0, 5).map(e => e.url || e.title);
      } else if (label.includes('code') || label.includes('snippet') || label.includes('evidence') || label.includes('data')) {
        content = codeSnippets.length > 0 ? codeSnippets : ['No code captured'];
      } else if (label.includes('date') || label.includes('time')) {
        content = new Date().toLocaleDateString();
      } else if (label.includes('detail') || label.includes('description') || label.includes('background') || label.includes('context')) {
        content = actionEvents.map(e => e.content?.text || e.description);
      } else if (label.includes('finding') || label.includes('result') || label.includes('conclusion') || label.includes('analysis')) {
        content = highlights.length > 0 ? highlights : textContent;
      } else if (label.includes('question') || label.includes('further research')) {
        content = ['What are the key learnings?', 'How can this be applied?', 'What needs follow-up?'];
      } else if (label.includes('participant') || label.includes('attendee')) {
        content = 'Not specified';
      } else if (label.includes('hypothesis')) {
        content = textContent[0] || 'Initial research question';
      } else {
        // Default: use mixed content
        content = textContent.length > 0 ? textContent : actionEvents.slice(0, 3).map(e => e.title);
      }
      
      return { label: section.label, content };
    }),
  };
};

const generateArticle = (session: RecordingSession, template: CustomTemplate): KnowledgeArticle => {
  const tabEvents = session.events.filter(e => e.type === 'tab');
  const uniqueSources = [...new Set(session.events.map(e => e.source))].join(', ') || 'various tools';

  return {
    id: Math.random().toString(36).substring(2, 15),
    title: `${session.name} - ${template.name}`,
    summary: `This recap documents ${Math.floor(session.events.length / 2)} minutes of activity across ${uniqueSources}.`,
    problem: '',
    solution: '',
    steps: [],
    relatedLinks: tabEvents.slice(0, 3).map(e => e.url || '').filter(Boolean),
    tags: session.tags.length > 0 ? session.tags : ['recap', 'session'],
    createdAt: new Date(),
    sessionId: session.id,
    template: template.id,
  };
};

// Export functions
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
  onClose, 
  onSaveArticle,
}: ArticleGeneratorProps) => {
  const { toast } = useToast();
  
  const [generationMode, setGenerationMode] = useState<'article' | 'smart'>('article');
  const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplate>(DEFAULT_TEMPLATES[0]);
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [templateContent, setTemplateContent] = useState<TemplateContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setArticle(generateArticle(session, selectedTemplate));
    setTemplateContent(generateTemplateContent(session, selectedTemplate));
    
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
      templateType: selectedTemplate.id,
      templateLabel: selectedTemplate.name,
    };
    
    onSaveArticle(savedArticle);
    setSaved(true);
    toast({
      title: 'Article saved',
      description: 'You can find it in the Recaps tab',
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
    }
    
    toast({
      title: 'Downloaded',
      description: `Article exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-semibold">Generate Recap</h2>
              <p className="text-sm text-muted-foreground">{session.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mode Selector */}
        <div className="border-b p-3 flex gap-2">
          <Button 
            variant={generationMode === 'article' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setGenerationMode('article')}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Template-Based
          </Button>
          <Button 
            variant={generationMode === 'smart' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setGenerationMode('smart')}
            className="gap-2"
          >
            <Brain className="w-4 h-4" />
            Smart Analysis
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {generationMode === 'article' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Template Selection */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">Select Template</h3>
                    <p className="text-xs text-muted-foreground">Choose how your recap will be structured</p>
                  </div>
                  <TemplateSelector
                    selectedTemplateId={selectedTemplate.id}
                    onSelectTemplate={setSelectedTemplate}
                  />
                </div>
              </div>

              {/* Preview / Generated Content */}
              <div className="flex-1 overflow-hidden">
                {!article ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Ready to Generate</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                      Using the "{selectedTemplate.name}" template with {selectedTemplate.sections.filter(s => s.enabled).length} sections
                    </p>
                    <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Recap
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-6">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                        <p className="text-muted-foreground">{article.summary}</p>
                      </div>
                      
                      {templateContent?.sections.map((section, i) => (
                        <div key={i} className="space-y-2">
                          <h4 className="font-semibold text-primary">{section.label}</h4>
                          {Array.isArray(section.content) ? (
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {section.content.map((item, j) => (
                                <li key={j}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">{section.content}</p>
                          )}
                        </div>
                      ))}
                      
                      <div className="flex gap-1 flex-wrap pt-4 border-t">
                        {article.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <SmartContentPanel 
                session={session} 
                onApply={handleApplySmartContent}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {article && generationMode === 'article' && (
          <div className="border-t p-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('markdown')}>
                    <FileCode className="w-4 h-4 mr-2" />
                    Markdown (.md)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON (.json)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('html')}>
                    <FileType className="w-4 h-4 mr-2" />
                    HTML (.html)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setArticle(null); setTemplateContent(null); }}>
                Regenerate
              </Button>
              <Button onClick={handleSave} disabled={saved} className="gap-2">
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Recap'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
