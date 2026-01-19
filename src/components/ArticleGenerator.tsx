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

// Template-specific content structure interfaces
interface TemplateContent {
  sections: { label: string; content: string | string[] }[];
}

// Generate template-specific content based on profile and template type
const generateTemplateContent = (
  session: RecordingSession, 
  template: KnowledgeArticle['template'],
  profileType: UserProfileType
): TemplateContent => {
  const tabEvents = session.events.filter(e => e.type === 'tab');
  const actionEvents = session.events.filter(e => e.type === 'action');
  const noteEvents = session.events.filter(e => e.type === 'note');
  const appEvents = session.events.filter(e => e.type === 'app');
  const uniqueSources = [...new Set([...tabEvents, ...appEvents].map(e => e.source))].join(', ') || 'various tools';
  const duration = Math.floor(session.events.length / 2);

  // Support Engineer Templates
  if (profileType === 'support') {
    switch (template) {
      case 'salesforce':
        return {
          sections: [
            { label: 'Case Number', content: session.ticketId || `CASE-${Date.now().toString().slice(-6)}` },
            { label: 'Environment', content: `Platform: Web Application | Tools: ${uniqueSources}` },
            { label: 'Customer Impact', content: 'Customer unable to proceed with workflow' },
            { label: 'Root Cause', content: actionEvents[0]?.description || 'Issue identified during troubleshooting session' },
            { label: 'Resolution Steps', content: actionEvents.slice(0, 5).map(e => e.title) },
            { label: 'Verification', content: 'Issue resolved and verified with customer' },
            { label: 'Time to Resolution', content: `${duration} minutes` },
            { label: 'Knowledge Tags', content: session.tags.join(', ') || 'support, troubleshooting' },
          ],
        };
      case 'microsoft':
        return {
          sections: [
            { label: 'Article Title', content: `Troubleshooting: ${session.name}` },
            { label: 'Applies To', content: uniqueSources },
            { label: 'Symptoms', content: 'User reports issue with application functionality' },
            { label: 'Cause', content: actionEvents[0]?.description || 'Configuration or user error' },
            { label: 'Resolution', content: actionEvents.slice(0, 4).map(e => e.title) },
            { label: 'More Information', content: tabEvents.slice(0, 3).map(e => e.url || e.title) },
            { label: 'Keywords', content: session.tags.join(', ') },
          ],
        };
      case 'confluence':
        return {
          sections: [
            { label: 'Overview', content: `Technical documentation for ${session.name}` },
            { label: 'Prerequisites', content: `Access to: ${uniqueSources}` },
            { label: 'Procedure', content: actionEvents.map(e => e.title) },
            { label: 'Troubleshooting Tips', content: noteEvents.map(e => e.description) },
            { label: 'Related Pages', content: tabEvents.slice(0, 3).map(e => e.title) },
          ],
        };
      default:
        return {
          sections: [
            { label: 'Ticket Summary', content: session.name },
            { label: 'Duration', content: `${duration} minutes` },
            { label: 'Actions Taken', content: actionEvents.slice(0, 5).map(e => e.title) },
            { label: 'Outcome', content: 'Issue resolved successfully' },
            { label: 'Notes', content: noteEvents.map(e => e.description) },
          ],
        };
    }
  }

  // Student Templates
  if (profileType === 'student') {
    switch (template) {
      case 'microsoft': // Study Guide
        return {
          sections: [
            { label: 'Topic', content: session.name },
            { label: 'Key Concepts', content: tabEvents.slice(0, 4).map(e => `• ${e.title}`) },
            { label: 'Important Definitions', content: actionEvents.slice(0, 3).map(e => e.description || e.title) },
            { label: 'Examples', content: noteEvents.map(e => e.description) },
            { label: 'Study Tips', content: ['Review key concepts daily', 'Practice with examples', 'Create flashcards for definitions'] },
            { label: 'Resources', content: tabEvents.slice(0, 3).map(e => e.url || e.title) },
          ],
        };
      case 'confluence': // Lecture Notes
        return {
          sections: [
            { label: 'Lecture Title', content: session.name },
            { label: 'Date', content: new Date().toLocaleDateString() },
            { label: 'Main Points', content: tabEvents.slice(0, 5).map(e => e.title) },
            { label: 'Detailed Notes', content: actionEvents.map(e => e.description || e.title) },
            { label: 'Questions to Review', content: noteEvents.map(e => `Q: ${e.description}`) },
            { label: 'Next Steps', content: ['Review notes before next class', 'Complete assigned readings'] },
          ],
        };
      case 'custom': // Flashcards
        return {
          sections: [
            { label: 'Deck Name', content: session.name },
            { label: 'Cards', content: tabEvents.slice(0, 6).map((e, i) => `Card ${i + 1}: ${e.title}`) },
            { label: 'Key Terms', content: actionEvents.slice(0, 4).map(e => `Term: ${e.title}`) },
            { label: 'Practice Questions', content: [
              'What is the main concept discussed?',
              'How does this relate to previous topics?',
              'Can you explain this in your own words?',
            ]},
          ],
        };
      default: // Summary
        return {
          sections: [
            { label: 'Session Summary', content: session.name },
            { label: 'Topics Covered', content: tabEvents.slice(0, 4).map(e => e.title) },
            { label: 'Key Takeaways', content: actionEvents.slice(0, 3).map(e => e.title) },
            { label: 'Duration', content: `${duration} minutes of study` },
          ],
        };
    }
  }

  // Developer Templates
  if (profileType === 'developer') {
    switch (template) {
      case 'confluence': // Dev Docs
        return {
          sections: [
            { label: 'Feature/Module', content: session.name },
            { label: 'Overview', content: `Development session covering ${uniqueSources}` },
            { label: 'Architecture', content: 'Component-based architecture with separation of concerns' },
            { label: 'Implementation Details', content: actionEvents.map(e => e.title) },
            { label: 'Code References', content: tabEvents.filter(e => e.source === 'VS Code' || e.source === 'GitHub').map(e => e.title) },
            { label: 'Dependencies', content: ['React', 'TypeScript', 'Tailwind CSS'] },
            { label: 'Testing Notes', content: noteEvents.map(e => e.description) },
          ],
        };
      case 'microsoft': // README
        return {
          sections: [
            { label: 'Project Name', content: session.name },
            { label: 'Description', content: `Documentation generated from ${duration} minute development session` },
            { label: 'Installation', content: ['npm install', 'npm run dev'] },
            { label: 'Usage', content: actionEvents.slice(0, 3).map(e => e.title) },
            { label: 'Configuration', content: 'See .env.example for environment variables' },
            { label: 'Contributing', content: 'Submit PRs with clear descriptions and tests' },
          ],
        };
      case 'custom': // Changelog
        return {
          sections: [
            { label: 'Version', content: `v${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}` },
            { label: 'Date', content: new Date().toLocaleDateString() },
            { label: 'Changes', content: actionEvents.map(e => `• ${e.title}`) },
            { label: 'Files Modified', content: tabEvents.filter(e => e.source === 'VS Code').slice(0, 5).map(e => e.title) },
            { label: 'Notes', content: noteEvents.map(e => e.description) },
          ],
        };
      default: // Debug Log
        return {
          sections: [
            { label: 'Debug Session', content: session.name },
            { label: 'Timestamp', content: new Date().toISOString() },
            { label: 'Issue', content: actionEvents[0]?.description || 'Debugging session' },
            { label: 'Investigation Steps', content: actionEvents.map(e => e.title) },
            { label: 'Console Output', content: noteEvents.map(e => `> ${e.description}`) },
            { label: 'Resolution', content: 'Issue identified and resolved' },
          ],
        };
    }
  }

  // Researcher Templates
  if (profileType === 'researcher') {
    switch (template) {
      case 'microsoft': // Research Notes
        return {
          sections: [
            { label: 'Research Topic', content: session.name },
            { label: 'Hypothesis', content: 'Initial research question and assumptions' },
            { label: 'Sources Reviewed', content: tabEvents.slice(0, 5).map(e => e.title) },
            { label: 'Key Findings', content: actionEvents.map(e => e.description || e.title) },
            { label: 'Observations', content: noteEvents.map(e => e.description) },
            { label: 'Questions for Further Research', content: ['What are the implications?', 'How does this connect to existing literature?'] },
          ],
        };
      case 'confluence': // Literature Review
        return {
          sections: [
            { label: 'Review Title', content: session.name },
            { label: 'Scope', content: `Analysis of ${tabEvents.length} sources` },
            { label: 'Sources', content: tabEvents.map(e => `• ${e.title}${e.url ? ` (${e.url})` : ''}`) },
            { label: 'Themes Identified', content: actionEvents.slice(0, 4).map(e => e.title) },
            { label: 'Gaps in Literature', content: noteEvents.map(e => e.description) },
            { label: 'Conclusions', content: 'Further research needed in identified areas' },
          ],
        };
      case 'salesforce': // Findings
        return {
          sections: [
            { label: 'Study', content: session.name },
            { label: 'Methodology', content: `Qualitative analysis of ${uniqueSources}` },
            { label: 'Data Points', content: `${session.events.length} observations recorded` },
            { label: 'Primary Findings', content: actionEvents.slice(0, 4).map(e => e.title) },
            { label: 'Supporting Evidence', content: noteEvents.map(e => e.description) },
            { label: 'Implications', content: 'Findings suggest areas for continued investigation' },
          ],
        };
      default: // Bibliography
        return {
          sections: [
            { label: 'Bibliography', content: session.name },
            { label: 'Sources', content: tabEvents.map(e => `${e.title}${e.url ? `. Retrieved from ${e.url}` : ''}`) },
            { label: 'Access Date', content: new Date().toLocaleDateString() },
            { label: 'Notes', content: noteEvents.map(e => e.description) },
          ],
        };
    }
  }

  // Custom/Default Templates
  return {
    sections: [
      { label: 'Title', content: session.name },
      { label: 'Summary', content: `${duration} minute session across ${uniqueSources}` },
      { label: 'Activities', content: actionEvents.map(e => e.title) },
      { label: 'Resources', content: tabEvents.slice(0, 3).map(e => e.url || e.title) },
      { label: 'Notes', content: noteEvents.map(e => e.description) },
    ],
  };
};

const generateArticle = (session: RecordingSession, template: KnowledgeArticle['template']): KnowledgeArticle => {
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

export const ArticleGenerator = ({ session, profileType, onClose }: ArticleGeneratorProps) => {
  const profileConfig = PROFILE_TEMPLATES[profileType];
  const [template, setTemplate] = useState<KnowledgeArticle['template']>(profileConfig.templates[0]);
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [templateContent, setTemplateContent] = useState<TemplateContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setArticle(generateArticle(session, template));
    setTemplateContent(generateTemplateContent(session, template, profileType));
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!article || !templateContent) return;
    
    const sectionsMarkdown = templateContent.sections.map(section => {
      const content = Array.isArray(section.content) 
        ? section.content.map(item => `- ${item}`).join('\n')
        : section.content;
      return `## ${section.label}\n${content}`;
    }).join('\n\n');

    const markdown = `# ${article.title}

${article.summary}

${sectionsMarkdown}

---
**Tags:** ${article.tags.map(tag => `#${tag}`).join(' ')}
**Generated on:** ${article.createdAt.toLocaleString()}
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
                    AI will analyze {session.events.length} captured events and create a structured {profileConfig.labels[template]} you can save, share, or export.
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
                        Generate {profileConfig.labels[template]}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
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
                                <li key={i} className="text-foreground">{item}</li>
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
