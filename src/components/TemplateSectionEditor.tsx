import { useState } from 'react';
import { AnimatePresence, Reorder } from 'framer-motion';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Pencil, 
  Check, 
  X,
  Settings2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useTemplateSections, TemplateSection } from '@/hooks/useTemplateSections';
import { UserProfileType, KnowledgeArticle } from '@/types';
import { cn } from '@/lib/utils';

interface TemplateSectionEditorProps {
  profileType: UserProfileType;
  templateKey: KnowledgeArticle['template'];
  templateLabel: string;
}

export const TemplateSectionEditor = ({
  profileType,
  templateKey,
}: TemplateSectionEditorProps) => {
  const {
    getSections,
    toggleSection,
    reorderSections,
    addSection,
    removeSection,
    renameSection,
    resetToDefaults,
    hasCustomizations,
  } = useTemplateSections();

  const sections = getSections(profileType, templateKey);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  const handleStartEdit = (section: TemplateSection) => {
    setEditingId(section.id);
    setEditValue(section.label);
  };

  const handleSaveEdit = () => {
    if (editingId && editValue.trim()) {
      renameSection(profileType, templateKey, editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleAddSection = () => {
    if (newSectionLabel.trim()) {
      addSection(profileType, templateKey, newSectionLabel.trim());
      setNewSectionLabel('');
      setShowAddSection(false);
    }
  };

  const handleReorder = (reorderedSections: TemplateSection[]) => {
    // Find what changed and update
    reorderedSections.forEach((section, newIndex) => {
      const oldIndex = sections.findIndex(s => s.id === section.id);
      if (oldIndex !== newIndex && oldIndex !== -1) {
        reorderSections(profileType, templateKey, oldIndex, newIndex);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Customize Sections</h3>
          <p className="text-xs text-muted-foreground">
            Drag to reorder, toggle to show/hide
          </p>
        </div>
        {hasCustomizations(profileType, templateKey) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetToDefaults(profileType, templateKey)}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>

      <ScrollArea className="h-[300px] pr-2">
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={handleReorder}
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {sections.map((section) => (
              <Reorder.Item
                key={section.id}
                value={section}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border bg-background",
                  "cursor-grab active:cursor-grabbing",
                  !section.enabled && "opacity-50"
                )}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                
                {editingId === section.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveEdit}>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEdit}>
                      <X className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {section.label}
                      </span>
                      {section.description && (
                        <span className="text-xs text-muted-foreground truncate block">
                          {section.description}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleStartEdit(section)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => toggleSection(profileType, templateKey, section.id)}
                      >
                        {section.enabled ? (
                          <Eye className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeSection(profileType, templateKey, section.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </ScrollArea>

      <Collapsible open={showAddSection} onOpenChange={setShowAddSection}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Custom Section
            {showAddSection ? (
              <ChevronUp className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-auto" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="flex gap-2">
            <Input
              placeholder="Section name..."
              value={newSectionLabel}
              onChange={(e) => setNewSectionLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSection();
              }}
              className="flex-1"
            />
            <Button onClick={handleAddSection} disabled={!newSectionLabel.trim()}>
              Add
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Dialog wrapper for easy integration
interface TemplateSectionDialogProps {
  profileType: UserProfileType;
  templateKey: KnowledgeArticle['template'];
  templateLabel: string;
  trigger?: React.ReactNode;
}

export const TemplateSectionDialog = ({
  profileType,
  templateKey,
  templateLabel,
  trigger,
}: TemplateSectionDialogProps) => {
  const [open, setOpen] = useState(false);
  const { hasCustomizations } = useTemplateSections();
  const isCustomized = hasCustomizations(profileType, templateKey);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Settings2 className="w-4 h-4" />
            Customize
            {isCustomized && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                Modified
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            {templateLabel} Structure
          </DialogTitle>
        </DialogHeader>
        <TemplateSectionEditor
          profileType={profileType}
          templateKey={templateKey}
          templateLabel={templateLabel}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
