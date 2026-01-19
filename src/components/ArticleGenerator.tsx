import { useState } from 'react';
import { FileText, Copy, Download, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecordingSession, KnowledgeArticle } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface ArticleGeneratorProps {
  session: RecordingSession;
  onClose: () => void;
}

const generateArticle = (session: RecordingSession, template: KnowledgeArticle['template']): KnowledgeArticle => {
  const tabEvents = session.events.filter(e => e.type === 'tab');
  const actionEvents = session.events.filter(e => e.type === 'action');
  const noteEvents = session.events.filter(e => e.type === 'note');

  return {
    id: Math.random().toString(36).substring(2, 15),
    title: `Troubleshooting Guide: ${session.ticketId || 'Support Case'}`,
    summary: `This article documents the resolution process for ${session.ticketId || 'the support case'} captured during a ${Math.floor(session.events.length / 3)} minute session.`,
    problem: `Customer reported an issue that required investigation across multiple systems including ${[...new Set(tabEvents.map(e => e.source))].join(', ') || 'various platforms'}.`,
    solution: `The issue was resolved by performing the following diagnostic steps and applying the necessary fixes as documented below.`,
    steps: [
      'Initial triage and case review',
      ...actionEvents.slice(0, 5).map(e => e.title),
      ...noteEvents.map(e => e.description),
      'Verified resolution and closed ticket',
    ].filter(Boolean),
    relatedLinks: tabEvents.slice(0, 3).map(e => e.url || '').filter(Boolean),
    tags: ['troubleshooting', 'support', session.ticketId || 'general'].filter(Boolean),
    createdAt: new Date(),
    sessionId: session.id,
    template,
  };
};

export const ArticleGenerator = ({ session, onClose }: ArticleGeneratorProps) => {
  const [template, setTemplate] = useState<KnowledgeArticle['template']>('salesforce');
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
              <TabsTrigger value="salesforce">Salesforce</TabsTrigger>
              <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
              <TabsTrigger value="confluence">Confluence</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value={template} className="mt-0">
              {!article ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    AI will analyze {session.events.length} captured events and create a structured knowledge article in {template.charAt(0).toUpperCase() + template.slice(1)} format.
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
                        Generate Article
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

                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Problem</h3>
                    <p className="mb-4">{article.problem}</p>

                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Solution</h3>
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
