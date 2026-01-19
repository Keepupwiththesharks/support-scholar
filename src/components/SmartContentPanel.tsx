import { useState } from 'react';
import { Sparkles, Brain, Lightbulb, Target, ArrowRight, TrendingUp, RefreshCw, Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RecordingSession, UserProfileType } from '@/types';
import { generateSmartContent, GeneratedContent } from '@/lib/contentGenerationEngine';
import { cn } from '@/lib/utils';

interface SmartContentPanelProps {
  session: RecordingSession;
  profileType: UserProfileType;
  onApplyContent?: (content: GeneratedContent) => void;
}

interface EditableItemProps {
  value: string;
  onSave: (value: string) => void;
  onDelete: () => void;
  icon?: React.ReactNode;
  prefix?: string;
  showCheckbox?: boolean;
}

const EditableItem = ({ value, onSave, onDelete, icon, prefix, showCheckbox }: EditableItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="flex gap-2 items-center">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 h-8 text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
          <Check className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </Button>
      </li>
    );
  }

  return (
    <li className="flex gap-3 text-sm group items-start">
      {showCheckbox && <input type="checkbox" className="mt-1 rounded border-muted-foreground" />}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {prefix && <span className="text-primary flex-shrink-0">{prefix}</span>}
      <span className="text-foreground flex-1">{value}</span>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)} 
          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
        >
          <Pencil className="w-3 h-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete} 
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </li>
  );
};

interface AddItemInputProps {
  onAdd: (value: string) => void;
  placeholder: string;
}

const AddItemInput = ({ onAdd, placeholder }: AddItemInputProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsAdding(true)}
        className="text-xs text-muted-foreground hover:text-primary mt-2"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add item
      </Button>
    );
  }

  return (
    <div className="flex gap-2 items-center mt-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-8 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
          if (e.key === 'Escape') {
            setValue('');
            setIsAdding(false);
          }
        }}
      />
      <Button variant="ghost" size="sm" onClick={handleAdd} className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
        <Check className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => { setValue(''); setIsAdding(false); }} 
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const SmartContentPanel = ({ session, profileType, onApplyContent }: SmartContentPanelProps) => {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'takeaways' | 'actions'>('insights');

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const generated = generateSmartContent(session, profileType);
    setContent(generated);
    setIsGenerating(false);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const generated = generateSmartContent(session, profileType);
    setContent(generated);
    setIsGenerating(false);
  };

  // Editing handlers
  const updateInsight = (index: number, value: string) => {
    if (!content) return;
    const newInsights = [...content.insights];
    newInsights[index] = value;
    setContent({ ...content, insights: newInsights });
  };

  const deleteInsight = (index: number) => {
    if (!content) return;
    setContent({ ...content, insights: content.insights.filter((_, i) => i !== index) });
  };

  const addInsight = (value: string) => {
    if (!content) return;
    setContent({ ...content, insights: [...content.insights, value] });
  };

  const updateTakeaway = (index: number, value: string) => {
    if (!content) return;
    const newTakeaways = [...content.keyTakeaways];
    newTakeaways[index] = value;
    setContent({ ...content, keyTakeaways: newTakeaways });
  };

  const deleteTakeaway = (index: number) => {
    if (!content) return;
    setContent({ ...content, keyTakeaways: content.keyTakeaways.filter((_, i) => i !== index) });
  };

  const addTakeaway = (value: string) => {
    if (!content) return;
    setContent({ ...content, keyTakeaways: [...content.keyTakeaways, value] });
  };

  const updateAction = (index: number, value: string) => {
    if (!content) return;
    const newActions = [...content.actionItems];
    newActions[index] = value;
    setContent({ ...content, actionItems: newActions });
  };

  const deleteAction = (index: number) => {
    if (!content) return;
    setContent({ ...content, actionItems: content.actionItems.filter((_, i) => i !== index) });
  };

  const addAction = (value: string) => {
    if (!content) return;
    setContent({ ...content, actionItems: [...content.actionItems, value] });
  };

  if (!content) {
    return (
      <div className="border rounded-xl p-6 bg-gradient-to-br from-primary/5 to-secondary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Smart Content Analysis</h3>
            <p className="text-sm text-muted-foreground">AI-powered insights from your session</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Analyze {session.events.length} events to extract key insights, takeaways, and action items 
          tailored to your {profileType} workflow.
        </p>
        
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || session.events.length === 0}
          className="w-full"
          variant="gradient"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Smart Content
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      {/* Header with confidence score */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Smart Analysis</h3>
            <Badge variant="outline" className="text-xs">Editable</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={isGenerating}>
            <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Content Quality</span>
              <span className="font-medium">{content.confidence}%</span>
            </div>
            <Progress value={content.confidence} className="h-2" />
          </div>
          <Badge variant={content.confidence > 70 ? "default" : content.confidence > 40 ? "secondary" : "outline"}>
            {content.confidence > 70 ? 'High' : content.confidence > 40 ? 'Medium' : 'Low'}
          </Badge>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 border-b bg-secondary/20">
        <p className="text-sm text-foreground leading-relaxed">{content.summary}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('insights')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === 'insights' 
              ? "bg-primary/10 text-primary border-b-2 border-primary" 
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Lightbulb className="w-4 h-4 inline mr-2" />
          Insights ({content.insights.length})
        </button>
        <button
          onClick={() => setActiveTab('takeaways')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === 'takeaways' 
              ? "bg-primary/10 text-primary border-b-2 border-primary" 
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Takeaways ({content.keyTakeaways.length})
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            activeTab === 'actions' 
              ? "bg-primary/10 text-primary border-b-2 border-primary" 
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <ArrowRight className="w-4 h-4 inline mr-2" />
          Actions ({content.actionItems.length})
        </button>
      </div>

      {/* Tab Content with Editing */}
      <div className="p-4 max-h-72 overflow-y-auto">
        {activeTab === 'insights' && (
          <>
            <ul className="space-y-3">
              {content.insights.map((insight, i) => (
                <EditableItem
                  key={i}
                  value={insight}
                  onSave={(value) => updateInsight(i, value)}
                  onDelete={() => deleteInsight(i)}
                  icon={
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {i + 1}
                    </span>
                  }
                />
              ))}
              {content.insights.length === 0 && (
                <p className="text-muted-foreground text-sm italic">No insights extracted. Try adding your own.</p>
              )}
            </ul>
            <AddItemInput onAdd={addInsight} placeholder="Add a new insight..." />
          </>
        )}

        {activeTab === 'takeaways' && (
          <>
            <ul className="space-y-3">
              {content.keyTakeaways.map((takeaway, i) => (
                <EditableItem
                  key={i}
                  value={takeaway}
                  onSave={(value) => updateTakeaway(i, value)}
                  onDelete={() => deleteTakeaway(i)}
                  prefix="✓"
                />
              ))}
              {content.keyTakeaways.length === 0 && (
                <p className="text-muted-foreground text-sm italic">No key takeaways found. Add your own.</p>
              )}
            </ul>
            <AddItemInput onAdd={addTakeaway} placeholder="Add a new takeaway..." />
          </>
        )}

        {activeTab === 'actions' && (
          <>
            <ul className="space-y-3">
              {content.actionItems.map((action, i) => (
                <EditableItem
                  key={i}
                  value={action}
                  onSave={(value) => updateAction(i, value)}
                  onDelete={() => deleteAction(i)}
                  showCheckbox
                />
              ))}
              {content.actionItems.length === 0 && (
                <p className="text-muted-foreground text-sm italic">No action items suggested. Add your own.</p>
              )}
            </ul>
            <AddItemInput onAdd={addAction} placeholder="Add a new action item..." />
          </>
        )}
      </div>

      {/* Related Topics */}
      {content.relatedTopics.length > 0 && (
        <div className="p-4 border-t bg-secondary/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Explore Next</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {content.relatedTopics.map((topic, i) => (
              <Badge key={i} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Auto-generated Tags */}
      {content.tags.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex flex-wrap gap-1.5">
            {content.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Apply Button */}
      {onApplyContent && (
        <div className="p-4 border-t">
          <Button onClick={() => onApplyContent(content)} className="w-full" variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Apply to Article
          </Button>
        </div>
      )}
    </div>
  );
};
