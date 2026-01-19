import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Target, CheckSquare, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RecordingSession } from '@/types';
import { generateSmartContent, GeneratedContent } from '@/lib/contentGenerationEngine';
import { useToast } from '@/hooks/use-toast';

interface SmartContentPanelProps {
  session: RecordingSession;
  onApply?: (content: GeneratedContent) => void;
}

export const SmartContentPanel = ({ session, onApply }: SmartContentPanelProps) => {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const generated = generateSmartContent(session);
    setContent(generated);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!content) return;
    
    const text = `# ${content.title}

## Summary
${content.summary}

## Key Insights
${content.insights.map(i => `- ${i}`).join('\n')}

## Key Takeaways
${content.keyTakeaways.map(t => `- ${t}`).join('\n')}

## Action Items
${content.actionItems.map(a => `- ${a}`).join('\n')}

## Related Topics
${content.relatedTopics.map(t => `- ${t}`).join('\n')}

Tags: ${content.tags.join(', ')}
`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'Smart content copied as Markdown',
    });
  };

  useEffect(() => {
    handleGenerate();
  }, [session.id]);

  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Analyzing your session...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center">
        <Button onClick={handleGenerate} className="gap-2">
          <Brain className="w-4 h-4" />
          Generate Smart Content
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-medium">Smart Analysis</span>
          <span className="text-xs text-muted-foreground">
            ({content.confidence}% confidence)
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleGenerate} className="gap-1">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Summary */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
            <p className="text-sm text-muted-foreground">{content.summary}</p>
          </div>

          {/* Insights */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h4 className="font-medium">Key Insights</h4>
            </div>
            <ul className="space-y-2">
              {content.insights.map((insight, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-muted-foreground flex gap-2"
                >
                  <span className="text-primary">•</span>
                  {insight}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Takeaways */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-emerald-500" />
              <h4 className="font-medium">Key Takeaways</h4>
            </div>
            <ul className="space-y-2">
              {content.keyTakeaways.map((takeaway, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="text-sm text-muted-foreground flex gap-2"
                >
                  <span className="text-emerald-500">•</span>
                  {takeaway}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium">Action Items</h4>
            </div>
            <ul className="space-y-2">
              {content.actionItems.map((action, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.6 }}
                  className="text-sm text-muted-foreground flex gap-2"
                >
                  <span className="text-blue-500">□</span>
                  {action}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="flex gap-1 flex-wrap pt-4 border-t">
            {content.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </ScrollArea>

      {onApply && (
        <div className="border-t p-4">
          <Button onClick={() => onApply(content)} className="w-full gap-2">
            <Brain className="w-4 h-4" />
            Apply to Article
          </Button>
        </div>
      )}
    </div>
  );
};
