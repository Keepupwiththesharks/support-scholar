import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Lightbulb, Target, ArrowRight, TrendingUp, RefreshCw, Pencil, Trash2, Plus, Check, X, GripVertical, Download, FileText, Save, FolderOpen, Copy, MoreHorizontal, Tag, Filter, Upload, Share2, AlertTriangle, ArrowLeftRight, Eye, ChevronDown, ChevronUp, GitMerge, HelpCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { RecordingSession, UserProfileType } from '@/types';
import { generateSmartContent, GeneratedContent } from '@/lib/contentGenerationEngine';
import { cn } from '@/lib/utils';
import { useContentPresets, ContentPreset, PresetCategory, PRESET_CATEGORIES } from '@/hooks/useContentPresets';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  
  // Preset management
  const { presets, allTags, savePreset, deletePreset, filterPresets, duplicatePreset, exportPresetsAsJSON, parsePresetsFromJSON, applyImport } = useContentPresets();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; overwritten: number; merged: number; skipped: number } | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [pendingImport, setPendingImport] = useState<{
    presets: ContentPreset[];
    conflicts: { imported: ContentPreset; existing: ContentPreset }[];
  } | null>(null);
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, 'overwrite' | 'keep_both' | 'skip' | 'cherry_pick'>>({});
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(new Set());
  
  // Cherry-pick selections with ordered arrays for drag-and-drop
  const [cherryPickSelections, setCherryPickSelections] = useState<Record<string, {
    insights: string[];
    takeaways: string[];
    actions: string[];
  }>>({});
  
  // Onboarding guide dismissal tracking
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(true);
  
  useEffect(() => {
    const dismissed = localStorage.getItem('conflict-onboarding-dismissed');
    if (dismissed === 'true') {
      setShowOnboardingGuide(false);
    }
  }, []);
  
  const handleDismissOnboarding = () => {
    setShowOnboardingGuide(false);
    localStorage.setItem('conflict-onboarding-dismissed', 'true');
  };
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [presetCategory, setPresetCategory] = useState<PresetCategory>('general');
  const [presetTags, setPresetTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loadedPresetId, setLoadedPresetId] = useState<string | null>(null);
  
  // Load dialog filters
  const [filterCategory, setFilterCategory] = useState<PresetCategory | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPresets = filterPresets({
    profileType,
    category: filterCategory === 'all' ? undefined : filterCategory,
    tags: filterTag === 'all' ? undefined : [filterTag],
    search: searchQuery || undefined,
  });
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
    setLoadedPresetId(null);
    await new Promise(resolve => setTimeout(resolve, 600));
    const generated = generateSmartContent(session, profileType);
    setContent(generated);
    setIsGenerating(false);
  };

  // Preset handlers
  const handleSavePreset = () => {
    if (!content || !presetName.trim()) return;
    savePreset(presetName.trim(), content, profileType, {
      description: presetDescription.trim() || undefined,
      category: presetCategory,
      tags: presetTags,
    });
    setPresetName('');
    setPresetDescription('');
    setPresetCategory('general');
    setPresetTags([]);
    setShowSaveDialog(false);
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !presetTags.includes(tag)) {
      setPresetTags([...presetTags, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setPresetTags(presetTags.filter(t => t !== tag));
  };

  const handleLoadPreset = (preset: ContentPreset) => {
    setContent(preset.content);
    setLoadedPresetId(preset.id);
    setShowLoadDialog(false);
  };

  const handleDeletePreset = (id: string) => {
    deletePreset(id);
    if (loadedPresetId === id) {
      setLoadedPresetId(null);
    }
  };

  const handleDuplicatePreset = (id: string) => {
    duplicatePreset(id);
  };

  const handleExportPreset = (id: string) => {
    exportPresetsAsJSON([id]);
  };

  const handleExportAllPresets = () => {
    exportPresetsAsJSON();
  };

  const handleImportPresets = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const result = await parsePresetsFromJSON(file);
    
    if (result.errors.length > 0 && result.presets.length === 0 && result.conflicts.length === 0) {
      setImportErrors(result.errors);
      setImportResult({ imported: 0, overwritten: 0, merged: 0, skipped: 0 });
    } else if (result.conflicts.length > 0) {
      // Show conflict resolution dialog
      setPendingImport({ presets: result.presets, conflicts: result.conflicts });
      setConflictResolutions(
        Object.fromEntries(result.conflicts.map(c => [c.imported.name, 'skip' as const]))
      );
      setImportErrors(result.errors);
      setShowConflictDialog(true);
    } else {
      // No conflicts, import directly
      const importRes = applyImport(result.presets, [], []);
      setImportResult(importRes);
      setImportErrors(result.errors);
    }
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleApplyConflictResolutions = () => {
    if (!pendingImport) return;
    
    const resolutions = Object.entries(conflictResolutions).map(([presetName, action]) => {
      if (action === 'cherry_pick') {
        const selections = cherryPickSelections[presetName];
        return {
          presetName,
          action,
          cherryPickedContent: selections ? {
            insights: selections.insights,
            keyTakeaways: selections.takeaways,
            actionItems: selections.actions,
          } : undefined,
        };
      }
      return { presetName, action };
    });
    
    const result = applyImport(pendingImport.presets, resolutions, pendingImport.conflicts);
    setImportResult(result);
    setShowConflictDialog(false);
    setPendingImport(null);
    setConflictResolutions({});
    setCherryPickSelections({});
  };

  const handleSetAllConflicts = (action: 'overwrite' | 'keep_both' | 'skip' | 'cherry_pick') => {
    if (!pendingImport) return;
    setConflictResolutions(
      Object.fromEntries(pendingImport.conflicts.map(c => [c.imported.name, action]))
    );
    
    // Initialize cherry-pick selections if setting to cherry_pick
    if (action === 'cherry_pick') {
      const newSelections: Record<string, { insights: string[]; takeaways: string[]; actions: string[] }> = {};
      pendingImport.conflicts.forEach(c => {
        // Start with existing items selected
        newSelections[c.imported.name] = {
          insights: [...c.existing.content.insights],
          takeaways: [...c.existing.content.keyTakeaways],
          actions: [...c.existing.content.actionItems],
        };
      });
      setCherryPickSelections(newSelections);
      // Auto-expand all for cherry-pick
      setExpandedConflicts(new Set(pendingImport.conflicts.map(c => c.imported.name)));
    }
  };

  const toggleConflictPreview = (presetName: string) => {
    setExpandedConflicts(prev => {
      const next = new Set(prev);
      if (next.has(presetName)) {
        next.delete(presetName);
      } else {
        next.add(presetName);
      }
      return next;
    });
  };

  const initializeCherryPick = (conflict: { imported: ContentPreset; existing: ContentPreset }) => {
    const presetName = conflict.imported.name;
    setConflictResolutions(prev => ({ ...prev, [presetName]: 'cherry_pick' }));
    setCherryPickSelections(prev => ({
      ...prev,
      [presetName]: {
        insights: [...conflict.existing.content.insights],
        takeaways: [...conflict.existing.content.keyTakeaways],
        actions: [...conflict.existing.content.actionItems],
      },
    }));
    setExpandedConflicts(prev => new Set([...prev, presetName]));
  };

  const toggleCherryPickItem = (
    presetName: string,
    type: 'insights' | 'takeaways' | 'actions',
    item: string
  ) => {
    setCherryPickSelections(prev => {
      const current = prev[presetName] || { insights: [], takeaways: [], actions: [] };
      const currentArray = [...current[type]];
      const index = currentArray.indexOf(item);
      if (index > -1) {
        currentArray.splice(index, 1);
      } else {
        currentArray.push(item);
      }
      return {
        ...prev,
        [presetName]: { ...current, [type]: currentArray },
      };
    });
  };

  const selectAllFromSource = (
    presetName: string,
    source: 'existing' | 'imported',
    conflict: { imported: ContentPreset; existing: ContentPreset }
  ) => {
    const content = source === 'existing' ? conflict.existing.content : conflict.imported.content;
    setCherryPickSelections(prev => ({
      ...prev,
      [presetName]: {
        insights: [...content.insights],
        takeaways: [...content.keyTakeaways],
        actions: [...content.actionItems],
      },
    }));
  };

  // Reorder cherry-picked items
  const reorderCherryPickItems = (
    presetName: string,
    type: 'insights' | 'takeaways' | 'actions',
    oldIndex: number,
    newIndex: number
  ) => {
    setCherryPickSelections(prev => {
      const current = prev[presetName];
      if (!current) return prev;
      const items = [...current[type]];
      const [removed] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, removed);
      return {
        ...prev,
        [presetName]: { ...current, [type]: items },
      };
    });
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
    <>
    <div className="border rounded-xl overflow-hidden bg-card">
      {/* Header with confidence score */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Smart Analysis</h3>
            {loadedPresetId && (
              <Badge variant="secondary" className="text-xs">From Preset</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowLoadDialog(true)} title="Load preset">
              <FolderOpen className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(true)} title="Save as preset">
              <Save className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={isGenerating} title="Regenerate">
              <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
            </Button>
          </div>
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

    {/* Save Preset Dialog */}
    <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Preset</DialogTitle>
          <DialogDescription>
            Save this content configuration to reuse across sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Preset Name</label>
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g., Weekly Report Template"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              value={presetDescription}
              onChange={(e) => setPresetDescription(e.target.value)}
              placeholder="Brief description of this preset"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setPresetCategory(cat.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                    presetCategory === cat.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {presetTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {presetTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {allTags.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Existing tags:</p>
                <div className="flex flex-wrap gap-1">
                  {allTags.filter(t => !presetTags.includes(t)).slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setPresetTags([...presetTags, tag])}
                      className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
            <Save className="w-4 h-4 mr-2" />
            Save Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Load Preset Dialog */}
    <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Load Preset</DialogTitle>
          <DialogDescription>
            Select a saved preset to load its content configuration.
          </DialogDescription>
        </DialogHeader>
        
        {/* Import/Export and Filters */}
        <div className="space-y-3 pb-2 border-b">
          {/* Import result message */}
          {importResult && (
            <div className={cn(
              "p-3 rounded-lg text-sm",
              importResult.imported > 0 || importResult.overwritten > 0 || importResult.merged > 0 ? "bg-green-500/10 text-green-700" : "bg-amber-500/10 text-amber-700"
            )}>
              {importResult.imported > 0 && (
                <p>✓ Successfully imported {importResult.imported} preset{importResult.imported !== 1 ? 's' : ''}</p>
              )}
              {importResult.overwritten > 0 && (
                <p>✓ Overwrote {importResult.overwritten} existing preset{importResult.overwritten !== 1 ? 's' : ''}</p>
              )}
              {importResult.merged > 0 && (
                <p>✓ Merged {importResult.merged} preset{importResult.merged !== 1 ? 's' : ''}</p>
              )}
              {importResult.skipped > 0 && (
                <p>⚠ Skipped {importResult.skipped} preset{importResult.skipped !== 1 ? 's' : ''}</p>
              )}
              {importErrors.length > 0 && importErrors.slice(0, 3).map((err, i) => (
                <p key={i} className="text-xs mt-1 opacity-80">• {err}</p>
              ))}
              <button 
                onClick={() => { setImportResult(null); setImportErrors([]); }} 
                className="text-xs underline mt-1 hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Import/Export buttons */}
          <div className="flex gap-2">
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleImportPresets}
                className="hidden"
              />
              <Button variant="outline" size="sm" className="w-full h-9" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Presets
                </span>
              </Button>
            </label>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-9" 
              onClick={handleExportAllPresets}
              disabled={presets.length === 0}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
          
          {/* Search and filters */}
          {presets.length > 0 && (
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search presets..."
                  className="h-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="w-4 h-4 mr-1" />
                    {filterCategory === 'all' ? 'Category' : PRESET_CATEGORIES.find(c => c.value === filterCategory)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterCategory('all')}>
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {PRESET_CATEGORIES.map((cat) => (
                    <DropdownMenuItem key={cat.value} onClick={() => setFilterCategory(cat.value)}>
                      {cat.icon} {cat.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {allTags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Tag className="w-4 h-4 mr-1" />
                      {filterTag === 'all' ? 'Tag' : `#${filterTag}`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterTag('all')}>
                      All Tags
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {allTags.map((tag) => (
                      <DropdownMenuItem key={tag} onClick={() => setFilterTag(tag)}>
                        #{tag}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
        
        <div className="py-2 max-h-72 overflow-y-auto">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              {presets.length === 0 ? (
                <>
                  <p className="text-sm">No presets saved yet.</p>
                  <p className="text-xs">Save your current content to create a preset.</p>
                </>
              ) : (
                <>
                  <p className="text-sm">No presets match your filters.</p>
                  <p className="text-xs">Try adjusting your search or filters.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors group",
                    loadedPresetId === preset.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => handleLoadPreset(preset)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm truncate">{preset.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {PRESET_CATEGORIES.find(c => c.value === preset.category)?.icon} {PRESET_CATEGORIES.find(c => c.value === preset.category)?.label}
                        </Badge>
                      </div>
                      {preset.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {preset.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {preset.content.insights.length} insights • {preset.content.keyTakeaways.length} takeaways • {preset.content.actionItems.length} actions
                        </span>
                        {preset.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {preset.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                                #{tag}
                              </span>
                            ))}
                            {preset.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{preset.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleLoadPreset(preset); }}>
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Load
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicatePreset(preset.id); }}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleExportPreset(preset.id); }}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Export as JSON
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDeletePreset(preset.id); }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Conflict Resolution Dialog */}
    <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <TooltipProvider delayDuration={300}>
          {/* Header with gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-6 pb-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
            <div className="relative">
              <DialogHeader className="space-y-2">
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <GitMerge className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold">Resolve Import Conflicts</span>
                      <p className="text-sm font-normal text-muted-foreground mt-0.5">
                        {pendingImport?.conflicts.length} preset{pendingImport?.conflicts.length !== 1 ? 's' : ''} need your attention
                      </p>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <HelpCircle className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs p-4 space-y-2">
                      <p className="font-semibold text-sm">How Conflict Resolution Works</p>
                      <div className="space-y-1.5 text-xs">
                        <p className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                          <span>Review each conflicting preset below</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                          <span>Click "Compare" to see differences side-by-side</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                          <span>Choose an action for each conflict</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
                          <span>Click "Apply & Import" when done</span>
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </DialogTitle>
              </DialogHeader>
            </div>
          </div>
          
          {/* Onboarding guide - shows for first-time users */}
          <AnimatePresence>
            {showOnboardingGuide && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-3 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent border-b">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-600 mb-1">Quick Guide</p>
                      <p className="text-xs text-muted-foreground">
                        Choose how to handle each conflict: <strong>Overwrite</strong> replaces existing, <strong>Keep Both</strong> creates a copy, 
                        <strong> Cherry-Pick</strong> lets you select individual items from both versions, or <strong>Skip</strong> to ignore.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                      onClick={handleDismissOnboarding}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Bulk actions bar */}
          <div className="flex items-center gap-3 px-6 py-3 border-b bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">Quick actions:</span>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSetAllConflicts('overwrite')}
                    className="h-8 rounded-full px-4 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-colors"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
                    Overwrite All
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Replace all existing presets with imported versions</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSetAllConflicts('keep_both')}
                    className="h-8 rounded-full px-4 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Keep All
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Keep existing and add imported as copies</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSetAllConflicts('cherry_pick')}
                    className="h-8 rounded-full px-4 hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30 transition-colors"
                  >
                    <GitMerge className="w-3.5 h-3.5 mr-1.5" />
                    Cherry-Pick All
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Manually select items from both versions to merge</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSetAllConflicts('skip')}
                    className="h-8 rounded-full px-4 hover:bg-muted transition-colors"
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Skip All
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Ignore all conflicts and keep existing presets</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        
        {/* Conflicts list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          {pendingImport?.conflicts.map((conflict, conflictIndex) => {
            const isExpanded = expandedConflicts.has(conflict.imported.name);
            const resolution = conflictResolutions[conflict.imported.name];
            
            return (
              <div 
                key={conflict.imported.name} 
                className={cn(
                  "rounded-2xl border-2 overflow-hidden transition-all duration-200",
                  resolution === 'overwrite' && "border-amber-500/30 bg-amber-500/5",
                  resolution === 'keep_both' && "border-blue-500/30 bg-blue-500/5",
                  resolution === 'cherry_pick' && "border-purple-500/30 bg-purple-500/5",
                  resolution === 'skip' && "border-muted bg-muted/20 opacity-60",
                  !resolution && "border-border bg-card"
                )}
              >
                {/* Conflict header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary">
                          {conflictIndex + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-base">{conflict.imported.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              Existing: {conflict.existing.content.insights.length + conflict.existing.content.keyTakeaways.length + conflict.existing.content.actionItems.length} items
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Imported: {conflict.imported.content.insights.length + conflict.imported.content.keyTakeaways.length + conflict.imported.content.actionItems.length} items
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 rounded-full transition-colors",
                        isExpanded ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => toggleConflictPreview(conflict.imported.name)}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      {isExpanded ? 'Hide' : 'Compare'}
                      {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                    </Button>
                  </div>
                  
                  {/* Action buttons with tooltips */}
                  <div className="flex gap-2 mt-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={resolution === 'overwrite' ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "h-9 rounded-xl flex-1 transition-all",
                            resolution === 'overwrite' 
                              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20" 
                              : "hover:border-amber-500/50 hover:bg-amber-500/10"
                          )}
                          onClick={() => setConflictResolutions(prev => ({ ...prev, [conflict.imported.name]: 'overwrite' }))}
                        >
                          <ArrowLeftRight className="w-4 h-4 mr-2" />
                          Overwrite
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Replace existing preset with imported version</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={resolution === 'keep_both' ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "h-9 rounded-xl flex-1 transition-all",
                            resolution === 'keep_both' 
                              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                              : "hover:border-blue-500/50 hover:bg-blue-500/10"
                          )}
                          onClick={() => setConflictResolutions(prev => ({ ...prev, [conflict.imported.name]: 'keep_both' }))}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Keep Both
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Keep existing and add imported as a new copy</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={resolution === 'cherry_pick' ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "h-9 rounded-xl flex-1 transition-all",
                            resolution === 'cherry_pick' 
                              ? "bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-500/20" 
                              : "hover:border-purple-500/50 hover:bg-purple-500/10"
                          )}
                          onClick={() => initializeCherryPick(conflict)}
                        >
                          <GitMerge className="w-4 h-4 mr-2" />
                          Cherry-Pick
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-xs font-medium mb-1">Advanced Merge</p>
                        <p className="text-xs text-muted-foreground">Select specific items from both presets to create a custom merged version</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={resolution === 'skip' ? 'secondary' : 'outline'}
                          size="sm"
                          className="h-9 rounded-xl px-4 transition-all"
                          onClick={() => setConflictResolutions(prev => ({ ...prev, [conflict.imported.name]: 'skip' }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Skip this conflict and keep existing preset</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                
                {/* Side-by-side diff preview with cherry-pick support */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.2, ease: 'easeInOut' }
                      }}
                      className="overflow-hidden border-t"
                    >
                      {/* Cherry-pick mode header */}
                      <AnimatePresence mode="wait">
                        {resolution === 'cherry_pick' && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-transparent border-b flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <motion.div 
                                initial={{ scale: 0.5, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"
                              >
                                <GitMerge className="w-4 h-4 text-purple-600" />
                              </motion.div>
                              <div>
                                <span className="font-medium text-purple-600 text-sm">Cherry-Pick Mode</span>
                                <p className="text-xs text-muted-foreground">Select items from both presets to create a merged version</p>
                              </div>
                            </div>
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="flex gap-2"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs rounded-full px-3 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                onClick={() => selectAllFromSource(conflict.imported.name, 'existing', conflict)}
                              >
                                Use Existing
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs rounded-full px-3 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                                onClick={() => selectAllFromSource(conflict.imported.name, 'imported', conflict)}
                              >
                                Use Imported
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2"
                      >
                      {/* Existing preset column */}
                      <div className="p-4 bg-gradient-to-br from-amber-500/5 to-transparent border-r">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 text-xs font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Existing
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Updated {new Date(conflict.existing.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {/* Insights */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                              <span>Insights</span>
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                {conflict.existing.content.insights.length}
                              </Badge>
                            </div>
                            <ul className="space-y-1 max-h-28 overflow-y-auto pr-2">
                              {conflict.existing.content.insights.map((item, i) => {
                                const isCherryPick = resolution === 'cherry_pick';
                                const isSelected = cherryPickSelections[conflict.imported.name]?.insights.includes(item);
                                return (
                                  <li 
                                    key={i} 
                                    className={cn(
                                      "flex items-start gap-2 py-1.5 px-2 rounded-lg text-xs transition-all",
                                      isCherryPick && "cursor-pointer",
                                      isCherryPick && isSelected && "bg-purple-500/20 ring-1 ring-purple-500/30",
                                      isCherryPick && !isSelected && "hover:bg-muted/50 opacity-60",
                                      !isCherryPick && "bg-muted/30"
                                    )}
                                    onClick={() => isCherryPick && toggleCherryPickItem(conflict.imported.name, 'insights', item)}
                                  >
                                    {isCherryPick && (
                                      <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                        isSelected ? "bg-purple-500 border-purple-500" : "border-muted-foreground/30"
                                      )}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    )}
                                    <span className="leading-relaxed">{item}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          {/* Takeaways */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Target className="w-3.5 h-3.5 text-blue-500" />
                              <span>Takeaways</span>
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                {conflict.existing.content.keyTakeaways.length}
                              </Badge>
                            </div>
                            <ul className="space-y-1 max-h-28 overflow-y-auto pr-2">
                              {conflict.existing.content.keyTakeaways.map((item, i) => {
                                const isCherryPick = resolution === 'cherry_pick';
                                const isSelected = cherryPickSelections[conflict.imported.name]?.takeaways.includes(item);
                                return (
                                  <li 
                                    key={i} 
                                    className={cn(
                                      "flex items-start gap-2 py-1.5 px-2 rounded-lg text-xs transition-all",
                                      isCherryPick && "cursor-pointer",
                                      isCherryPick && isSelected && "bg-purple-500/20 ring-1 ring-purple-500/30",
                                      isCherryPick && !isSelected && "hover:bg-muted/50 opacity-60",
                                      !isCherryPick && "bg-muted/30"
                                    )}
                                    onClick={() => isCherryPick && toggleCherryPickItem(conflict.imported.name, 'takeaways', item)}
                                  >
                                    {isCherryPick && (
                                      <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                        isSelected ? "bg-purple-500 border-purple-500" : "border-muted-foreground/30"
                                      )}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    )}
                                    <span className="leading-relaxed">{item}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          {/* Actions */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Actions</span>
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                {conflict.existing.content.actionItems.length}
                              </Badge>
                            </div>
                            <ul className="space-y-1 max-h-28 overflow-y-auto pr-2">
                              {conflict.existing.content.actionItems.map((item, i) => {
                                const isCherryPick = resolution === 'cherry_pick';
                                const isSelected = cherryPickSelections[conflict.imported.name]?.actions.includes(item);
                                return (
                                  <li 
                                    key={i} 
                                    className={cn(
                                      "flex items-start gap-2 py-1.5 px-2 rounded-lg text-xs transition-all",
                                      isCherryPick && "cursor-pointer",
                                      isCherryPick && isSelected && "bg-purple-500/20 ring-1 ring-purple-500/30",
                                      isCherryPick && !isSelected && "hover:bg-muted/50 opacity-60",
                                      !isCherryPick && "bg-muted/30"
                                    )}
                                    onClick={() => isCherryPick && toggleCherryPickItem(conflict.imported.name, 'actions', item)}
                                  >
                                    {isCherryPick && (
                                      <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                        isSelected ? "bg-purple-500 border-purple-500" : "border-muted-foreground/30"
                                      )}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    )}
                                    <span className="leading-relaxed">{item}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {/* Imported preset column */}
                      <div className="p-4 bg-gradient-to-bl from-emerald-500/5 to-transparent">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Imported
                          </div>
                          <span className="text-xs text-muted-foreground">From file</span>
                        </div>
                        <div className="space-y-4">
                          {/* Insights */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                              <span>Insights</span>
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                {conflict.imported.content.insights.length}
                              </Badge>
                            </div>
                            <ul className="space-y-1 max-h-28 overflow-y-auto pr-2">
                              {conflict.imported.content.insights.map((item, i) => {
                                const isCherryPick = resolution === 'cherry_pick';
                                const isSelected = cherryPickSelections[conflict.imported.name]?.insights.includes(item);
                                const isInExisting = conflict.existing.content.insights.includes(item);
                                return (
                                  <li 
                                    key={i} 
                                    className={cn(
                                      "flex items-start gap-2 py-1.5 px-2 rounded-lg text-xs transition-all",
                                      isCherryPick && !isInExisting && "cursor-pointer",
                                      isCherryPick && isSelected && "bg-purple-500/20 ring-1 ring-purple-500/30",
                                      isCherryPick && !isSelected && !isInExisting && "hover:bg-muted/50 opacity-60",
                                      isCherryPick && isInExisting && "opacity-30",
                                      !isCherryPick && "bg-muted/30"
                                    )}
                                    onClick={() => isCherryPick && !isInExisting && toggleCherryPickItem(conflict.imported.name, 'insights', item)}
                                  >
                                    {isCherryPick && (
                                      <input 
                                        type="checkbox" 
                                        checked={isSelected} 
                                        disabled={isInExisting}
                                        onChange={() => {}}
                                        className="mt-0.5 rounded border-muted-foreground"
                                      />
                                    )}
                                    <span className={cn("truncate", !isCherryPick && "ml-3")}>
                                      {isCherryPick ? '' : '• '}{item}
                                      {isCherryPick && isInExisting && <span className="text-muted-foreground ml-1">(duplicate)</span>}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          {/* Takeaways */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Target className="w-3.5 h-3.5 text-blue-500" />
                              <span>Takeaways</span>
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                {conflict.imported.content.keyTakeaways.length}
                              </Badge>
                            </div>
                            <ul className="space-y-1 max-h-28 overflow-y-auto pr-2">
                              {conflict.imported.content.keyTakeaways.map((item, i) => {
                                const isCherryPick = resolution === 'cherry_pick';
                                const isSelected = cherryPickSelections[conflict.imported.name]?.takeaways.includes(item);
                                const isInExisting = conflict.existing.content.keyTakeaways.includes(item);
                                return (
                                  <li 
                                    key={i} 
                                    className={cn(
                                      "flex items-start gap-2 py-1.5 px-2 rounded-lg text-xs transition-all",
                                      isCherryPick && !isInExisting && "cursor-pointer",
                                      isCherryPick && isSelected && "bg-purple-500/20 ring-1 ring-purple-500/30",
                                      isCherryPick && !isSelected && !isInExisting && "hover:bg-muted/50 opacity-60",
                                      isCherryPick && isInExisting && "opacity-30",
                                      !isCherryPick && "bg-muted/30"
                                    )}
                                    onClick={() => isCherryPick && !isInExisting && toggleCherryPickItem(conflict.imported.name, 'takeaways', item)}
                                  >
                                    {isCherryPick && (
                                      <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                        isSelected ? "bg-purple-500 border-purple-500" : "border-muted-foreground/30",
                                        isInExisting && "opacity-30"
                                      )}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    )}
                                    <span className="leading-relaxed">
                                      {item}
                                      {isCherryPick && isInExisting && (
                                        <span className="text-muted-foreground ml-1.5 text-[10px]">(exists)</span>
                                      )}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          {/* Actions */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Actions</span>
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                {conflict.imported.content.actionItems.length}
                              </Badge>
                            </div>
                            <ul className="space-y-1 max-h-28 overflow-y-auto pr-2">
                              {conflict.imported.content.actionItems.map((item, i) => {
                                const isCherryPick = resolution === 'cherry_pick';
                                const isSelected = cherryPickSelections[conflict.imported.name]?.actions.includes(item);
                                const isInExisting = conflict.existing.content.actionItems.includes(item);
                                return (
                                  <li 
                                    key={i} 
                                    className={cn(
                                      "flex items-start gap-2 py-1.5 px-2 rounded-lg text-xs transition-all",
                                      isCherryPick && !isInExisting && "cursor-pointer",
                                      isCherryPick && isSelected && "bg-purple-500/20 ring-1 ring-purple-500/30",
                                      isCherryPick && !isSelected && !isInExisting && "hover:bg-muted/50 opacity-60",
                                      isCherryPick && isInExisting && "opacity-30",
                                      !isCherryPick && "bg-muted/30"
                                    )}
                                    onClick={() => isCherryPick && !isInExisting && toggleCherryPickItem(conflict.imported.name, 'actions', item)}
                                  >
                                    {isCherryPick && (
                                      <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                        isSelected ? "bg-purple-500 border-purple-500" : "border-muted-foreground/30",
                                        isInExisting && "opacity-30"
                                      )}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                      </div>
                                    )}
                                    <span className="leading-relaxed">
                                      {item}
                                      {isCherryPick && isInExisting && (
                                        <span className="text-muted-foreground ml-1.5 text-[10px]">(exists)</span>
                                      )}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                      </motion.div>
                    
                      {/* Cherry-pick summary with draggable preview */}
                      <AnimatePresence>
                        {resolution === 'cherry_pick' && cherryPickSelections[conflict.imported.name] && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="border-t bg-gradient-to-b from-purple-500/5 to-transparent"
                          >
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-purple-500/10 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <motion.div 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20"
                                >
                                  <Check className="w-5 h-5 text-white" />
                                </motion.div>
                                <div>
                                <p className="font-semibold text-purple-600">Your Merged Preset</p>
                                <p className="text-xs text-muted-foreground">Hover over items to remove • Items are numbered by order</p>
                                </div>
                              </div>
                              <motion.div 
                                key={cherryPickSelections[conflict.imported.name].insights.length + cherryPickSelections[conflict.imported.name].takeaways.length + cherryPickSelections[conflict.imported.name].actions.length}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-2"
                              >
                                <span className="text-3xl font-bold text-purple-500">
                                  {cherryPickSelections[conflict.imported.name].insights.length + 
                                   cherryPickSelections[conflict.imported.name].takeaways.length + 
                                   cherryPickSelections[conflict.imported.name].actions.length}
                                </span>
                                <span className="text-xs text-muted-foreground">total<br/>items</span>
                              </motion.div>
                            </div>
                            
                            {/* Merged items grid */}
                            <div className="p-4 grid grid-cols-3 gap-4">
                              {/* Insights */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                                  <Lightbulb className="w-4 h-4" />
                                  <span>Insights ({cherryPickSelections[conflict.imported.name].insights.length})</span>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {cherryPickSelections[conflict.imported.name].insights.map((item, i) => (
                                    <motion.div
                                      key={item}
                                      layout
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 10 }}
                                      transition={{ delay: i * 0.02 }}
                                      className="group flex items-start gap-2 p-2 bg-card rounded-lg border text-xs hover:shadow-md transition-shadow"
                                    >
                                      <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                        {i + 1}
                                      </span>
                                      <span className="flex-1 line-clamp-2">{item}</span>
                                      <button 
                                        onClick={() => toggleCherryPickItem(conflict.imported.name, 'insights', item)}
                                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-0.5 transition-opacity"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </motion.div>
                                  ))}
                                  {cherryPickSelections[conflict.imported.name].insights.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic py-2">No insights selected</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Takeaways */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                                  <Target className="w-4 h-4" />
                                  <span>Takeaways ({cherryPickSelections[conflict.imported.name].takeaways.length})</span>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {cherryPickSelections[conflict.imported.name].takeaways.map((item, i) => (
                                    <motion.div
                                      key={item}
                                      layout
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 10 }}
                                      transition={{ delay: i * 0.02 }}
                                      className="group flex items-start gap-2 p-2 bg-card rounded-lg border text-xs hover:shadow-md transition-shadow"
                                    >
                                      <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                        {i + 1}
                                      </span>
                                      <span className="flex-1 line-clamp-2">{item}</span>
                                      <button 
                                        onClick={() => toggleCherryPickItem(conflict.imported.name, 'takeaways', item)}
                                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-0.5 transition-opacity"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </motion.div>
                                  ))}
                                  {cherryPickSelections[conflict.imported.name].takeaways.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic py-2">No takeaways selected</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                                  <ArrowRight className="w-4 h-4" />
                                  <span>Actions ({cherryPickSelections[conflict.imported.name].actions.length})</span>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {cherryPickSelections[conflict.imported.name].actions.map((item, i) => (
                                    <motion.div
                                      key={item}
                                      layout
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 10 }}
                                      transition={{ delay: i * 0.02 }}
                                      className="group flex items-start gap-2 p-2 bg-card rounded-lg border text-xs hover:shadow-md transition-shadow"
                                    >
                                      <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                        {i + 1}
                                      </span>
                                      <span className="flex-1 line-clamp-2">{item}</span>
                                      <button 
                                        onClick={() => toggleCherryPickItem(conflict.imported.name, 'actions', item)}
                                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-0.5 transition-opacity"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </motion.div>
                                  ))}
                                  {cherryPickSelections[conflict.imported.name].actions.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic py-2">No actions selected</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="border-t bg-muted/30 px-6 py-4">
          {pendingImport && pendingImport.presets.length > 0 && (
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                +{pendingImport.presets.length}
              </span>
              {pendingImport.presets.length} non-conflicting preset{pendingImport.presets.length !== 1 ? 's' : ''} will also be imported
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => { setShowConflictDialog(false); setPendingImport(null); }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApplyConflictResolutions}
              className="rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-md shadow-primary/20"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply & Import
            </Button>
          </div>
        </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
    </>
  );
};
