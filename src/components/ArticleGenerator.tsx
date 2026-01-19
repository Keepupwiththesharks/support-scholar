import { useState } from 'react';
import { FileText, Copy, Download, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecordingSession, KnowledgeArticle, UserProfileType } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface ArticleGeneratorProps {
  session: RecordingSession;
  profileType: UserProfileType;
  onClose: () => void;
}

// Profile-specific template configurations
const PROFILE_TEMPLATES: Record<UserProfileType, { templates: KnowledgeArticle['template'][]; labels: Record<string, string> }> = {
  support: {
    templates: ['salesforce', 'microsoft', 'confluence', 'custom'],
    labels: {
      salesforce: 'Salesforce KB',
      microsoft: 'Microsoft Docs',
      confluence: 'Confluence',
      custom: 'Ticket Summary',
    },
  },
  student: {
    templates: ['microsoft', 'confluence', 'custom', 'salesforce'],
    labels: {
      microsoft: 'Study Guide',
      confluence: 'Lecture Notes',
      custom: 'Flashcards',
      salesforce: 'Summary',
    },
  },
  developer: {
    templates: ['confluence', 'microsoft', 'custom', 'salesforce'],
    labels: {
      confluence: 'Dev Docs',
      microsoft: 'README',
      custom: 'Changelog',
      salesforce: 'Debug Log',
    },
  },
  researcher: {
    templates: ['microsoft', 'confluence', 'salesforce', 'custom'],
    labels: {
      microsoft: 'Research Notes',
      confluence: 'Literature Review',
      salesforce: 'Findings',
      custom: 'Bibliography',
    },
  },
  custom: {
    templates: ['salesforce', 'microsoft', 'confluence', 'custom'],
    labels: {
      salesforce: 'Professional',
      microsoft: 'Detailed',
      confluence: 'Technical',
      custom: 'Simple',
    },
  },
};

const generateArticle = (session: RecordingSession, template: KnowledgeArticle['template']): KnowledgeArticle => {
  const tabEvents = session.events.filter(e => e.type === 'tab');
  const actionEvents = session.events.filter(e => e.type === 'action');
  const noteEvents = session.events.filter(e => e.type === 'note');
  const appEvents = session.events.filter(e => e.type === 'app');

  const sessionName = session.ticketId || 'Session';
  const uniqueSources = [...new Set([...tabEvents, ...appEvents].map(e => e.source))].join(', ') || 'various tools';

  return {
    id: Math.random().toString(36).substring(2, 15),
    title: `${sessionName} - Activity Recap`,
    summary: `This recap documents ${Math.floor(session.events.length / 2)} minutes of activity across ${uniqueSources}. Perfect for review, documentation, or sharing with others.`,
    problem: `Session Goal: Capture and document the workflow involving ${uniqueSources}.`,
    solution: `Here's what was accomplished during this session, with key steps and resources used.`,
    steps: [
      'Session started',
      ...tabEvents.slice(0, 3).map(e => `Visited: ${e.title}`),
      ...actionEvents.slice(0, 4).map(e => e.title),
      ...noteEvents.map(e => `Note: ${e.description}`),
      'Session completed',
    ].filter(Boolean),
    relatedLinks: tabEvents.slice(0, 3).map(e => e.url || '').filter(Boolean),
    tags: ['troubleshooting', 'support', session.ticketId || 'general'].filter(Boolean),
    createdAt: new Date(),
    sessionId: session.id,
    template,
  };
};

export const ArticleGenerator = ({ session, profileType, onClose }: ArticleGeneratorProps) => {
  const profileConfig = PROFILE_TEMPLATES[profileType];
  const [template, setTemplate] = useState<KnowledgeArticle['template']>(profileConfig.templates[0]);
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setArticle(generateArticle(session, template));
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!article) return;
    
    const markdown = `# ${article.title}

## Summary
${article.summary}

## Problem
${article.problem}

## Solution
${article.solution}

## Steps
${article.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Related Links
${article.relatedLinks.map(link => `- ${link}`).join('\n')}

## Tags
${article.tags.map(tag => `#${tag}`).join(' ')}

---
Generated on ${article.createdAt.toLocaleString()}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'Article content copied in Markdown format',
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
          <Tabs value={template} onValueChange={(v) => setTemplate(v as KnowledgeArticle['template'])}>
            <TabsList className="grid grid-cols-4 mb-6">
              {profileConfig.templates.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {profileConfig.labels[t]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={template} className="mt-0">
              {!article ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    AI will analyze {session.events.length} captured events and create a structured recap you can save, share, or export.
                  </p>
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
                        Generate Recap
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="prose prose-sm max-w-none">
                    <h1 className="text-xl font-bold mb-4">{article.title}</h1>
                    
                    <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary</h3>
                      <p className="text-foreground">{article.summary}</p>
                    </div>

                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overview</h3>
                    <p className="mb-4">{article.problem}</p>

                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">What Was Done</h3>
                    <p className="mb-4">{article.solution}</p>

                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resolution Steps</h3>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      {article.steps.map((step, i) => (
                        <li key={i} className="text-foreground">{step}</li>
                      ))}
                    </ol>

                    {article.relatedLinks.length > 0 && (
                      <>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Related Links</h3>
                        <ul className="list-disc list-inside space-y-1 mb-4">
                          {article.relatedLinks.map((link, i) => (
                            <li key={i} className="text-primary font-mono text-sm">{link}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    <div className="flex gap-2 flex-wrap">
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
        </div>

        {article && (
          <div className="flex items-center justify-between p-6 border-t bg-secondary/30">
            <p className="text-sm text-muted-foreground">
              Generated from {session.events.length} events
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="gradient">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
