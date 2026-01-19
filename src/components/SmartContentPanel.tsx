import { useState } from 'react';
import { Sparkles, Brain, Lightbulb, Target, ArrowRight, TrendingUp, RefreshCw, Pencil, Trash2, Plus, Check, X, GripVertical, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RecordingSession, UserProfileType } from '@/types';
import { generateSmartContent, GeneratedContent } from '@/lib/contentGenerationEngine';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SmartContentPanelProps {
  session: RecordingSession;
  profileType: UserProfileType;
  onApplyContent?: (content: GeneratedContent) => void;
}

interface SortableItemProps {
  id: string;
  value: string;
  index: number;
  onSave: (value: string) => void;
  onDelete: () => void;
  icon?: React.ReactNode;
  prefix?: string;
  showCheckbox?: boolean;
}

const SortableItem = ({ id, value, index, onSave, onDelete, icon, prefix, showCheckbox }: SortableItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
      <li ref={setNodeRef} style={style} className="flex gap-2 items-center bg-card">
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
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex gap-2 text-sm group items-center py-1.5 px-2 -mx-2 rounded-lg transition-colors",
        isDragging ? "bg-primary/10 shadow-lg z-50" : "hover:bg-muted/50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      {showCheckbox && <input type="checkbox" className="rounded border-muted-foreground" />}
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  // Drag end handlers
  const handleInsightsDragEnd = (event: DragEndEvent) => {
    if (!content) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = content.insights.findIndex((_, i) => `insight-${i}` === active.id);
      const newIndex = content.insights.findIndex((_, i) => `insight-${i}` === over.id);
      setContent({ ...content, insights: arrayMove(content.insights, oldIndex, newIndex) });
    }
  };

  const handleTakeawaysDragEnd = (event: DragEndEvent) => {
    if (!content) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = content.keyTakeaways.findIndex((_, i) => `takeaway-${i}` === active.id);
      const newIndex = content.keyTakeaways.findIndex((_, i) => `takeaway-${i}` === over.id);
      setContent({ ...content, keyTakeaways: arrayMove(content.keyTakeaways, oldIndex, newIndex) });
    }
  };

  const handleActionsDragEnd = (event: DragEndEvent) => {
    if (!content) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = content.actionItems.findIndex((_, i) => `action-${i}` === active.id);
      const newIndex = content.actionItems.findIndex((_, i) => `action-${i}` === over.id);
      setContent({ ...content, actionItems: arrayMove(content.actionItems, oldIndex, newIndex) });
    }
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

  // Export as Markdown
  const exportAsMarkdown = () => {
    if (!content) return;
    
    let markdown = `# ${content.title}\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleDateString()}\n`;
    markdown += `**Profile:** ${profileType}\n`;
    markdown += `**Confidence:** ${content.confidence}%\n\n`;
    
    markdown += `## Summary\n\n${content.summary}\n\n`;
    
    if (content.insights.length > 0) {
      markdown += `## Insights\n\n`;
      content.insights.forEach((insight, i) => {
        markdown += `${i + 1}. ${insight}\n`;
      });
      markdown += '\n';
    }
    
    if (content.keyTakeaways.length > 0) {
      markdown += `## Key Takeaways\n\n`;
      content.keyTakeaways.forEach((takeaway) => {
        markdown += `- ✓ ${takeaway}\n`;
      });
      markdown += '\n';
    }
    
    if (content.actionItems.length > 0) {
      markdown += `## Action Items\n\n`;
      content.actionItems.forEach((action) => {
        markdown += `- [ ] ${action}\n`;
      });
      markdown += '\n';
    }
    
    if (content.relatedTopics.length > 0) {
      markdown += `## Related Topics\n\n`;
      markdown += content.relatedTopics.join(', ') + '\n\n';
    }
    
    if (content.tags.length > 0) {
      markdown += `## Tags\n\n`;
      markdown += content.tags.map(tag => `#${tag}`).join(' ') + '\n';
    }
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-recap.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export as PDF (using print-to-PDF approach)
  const exportAsPDF = () => {
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${content.title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
    h2 { color: #334155; margin-top: 32px; margin-bottom: 16px; font-size: 1.25rem; }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 24px; }
    .meta span { margin-right: 16px; }
    .summary { background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #3b82f6; }
    ul, ol { padding-left: 24px; }
    li { margin-bottom: 8px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 16px; font-size: 0.75rem; }
    .confidence { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .high { background: #dcfce7; color: #166534; }
    .medium { background: #fef3c7; color: #92400e; }
    .low { background: #fee2e2; color: #991b1b; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${content.title}</h1>
  <div class="meta">
    <span>📅 ${new Date().toLocaleDateString()}</span>
    <span>👤 ${profileType}</span>
    <span class="confidence ${content.confidence > 70 ? 'high' : content.confidence > 40 ? 'medium' : 'low'}">
      ${content.confidence}% confidence
    </span>
  </div>
  
  <div class="summary">${content.summary}</div>
  
  ${content.insights.length > 0 ? `
  <h2>💡 Insights</h2>
  <ol>
    ${content.insights.map(i => `<li>${i}</li>`).join('')}
  </ol>` : ''}
  
  ${content.keyTakeaways.length > 0 ? `
  <h2>🎯 Key Takeaways</h2>
  <ul>
    ${content.keyTakeaways.map(t => `<li>✓ ${t}</li>`).join('')}
  </ul>` : ''}
  
  ${content.actionItems.length > 0 ? `
  <h2>➡️ Action Items</h2>
  <ul>
    ${content.actionItems.map(a => `<li>☐ ${a}</li>`).join('')}
  </ul>` : ''}
  
  ${content.relatedTopics.length > 0 ? `
  <h2>📈 Related Topics</h2>
  <p>${content.relatedTopics.join(', ')}</p>` : ''}
  
  ${content.tags.length > 0 ? `
  <h2>🏷️ Tags</h2>
  <div class="tags">
    ${content.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
  </div>` : ''}
</body>
</html>`;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
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
            <Badge variant="outline" className="text-xs">Drag to reorder</Badge>
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

      {/* Tab Content with Drag & Drop */}
      <div className="p-4 max-h-72 overflow-y-auto">
        {activeTab === 'insights' && (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleInsightsDragEnd}>
              <SortableContext items={content.insights.map((_, i) => `insight-${i}`)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-1">
                  {content.insights.map((insight, i) => (
                    <SortableItem
                      key={`insight-${i}`}
                      id={`insight-${i}`}
                      index={i}
                      value={insight}
                      onSave={(value) => updateInsight(i, value)}
                      onDelete={() => deleteInsight(i)}
                      icon={
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                          {i + 1}
                        </span>
                      }
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
            {content.insights.length === 0 && (
              <p className="text-muted-foreground text-sm italic">No insights extracted. Try adding your own.</p>
            )}
            <AddItemInput onAdd={addInsight} placeholder="Add a new insight..." />
          </>
        )}

        {activeTab === 'takeaways' && (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTakeawaysDragEnd}>
              <SortableContext items={content.keyTakeaways.map((_, i) => `takeaway-${i}`)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-1">
                  {content.keyTakeaways.map((takeaway, i) => (
                    <SortableItem
                      key={`takeaway-${i}`}
                      id={`takeaway-${i}`}
                      index={i}
                      value={takeaway}
                      onSave={(value) => updateTakeaway(i, value)}
                      onDelete={() => deleteTakeaway(i)}
                      prefix="✓"
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
            {content.keyTakeaways.length === 0 && (
              <p className="text-muted-foreground text-sm italic">No key takeaways found. Add your own.</p>
            )}
            <AddItemInput onAdd={addTakeaway} placeholder="Add a new takeaway..." />
          </>
        )}

        {activeTab === 'actions' && (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleActionsDragEnd}>
              <SortableContext items={content.actionItems.map((_, i) => `action-${i}`)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-1">
                  {content.actionItems.map((action, i) => (
                    <SortableItem
                      key={`action-${i}`}
                      id={`action-${i}`}
                      index={i}
                      value={action}
                      onSave={(value) => updateAction(i, value)}
                      onDelete={() => deleteAction(i)}
                      showCheckbox
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
            {content.actionItems.length === 0 && (
              <p className="text-muted-foreground text-sm italic">No action items suggested. Add your own.</p>
            )}
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

      {/* Export & Apply Buttons */}
      <div className="p-4 border-t space-y-2">
        <div className="flex gap-2">
          <Button onClick={exportAsMarkdown} variant="outline" size="sm" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Export Markdown
          </Button>
          <Button onClick={exportAsPDF} variant="outline" size="sm" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
        {onApplyContent && (
          <Button onClick={() => onApplyContent(content)} className="w-full" variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Apply to Article
          </Button>
        )}
      </div>
    </div>
  );
};
