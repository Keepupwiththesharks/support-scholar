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
  Save,
  FolderOpen,
  Copy,
  Download,
  Upload,
  Star,
  StarOff,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useTemplateSections, TemplateSection } from '@/hooks/useTemplateSections';
import { useTemplatePresets, TemplatePreset } from '@/hooks/useTemplatePresets';
import { UserProfileType, KnowledgeArticle } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TemplateSectionEditorProps {
  profileType: UserProfileType;
  templateKey: KnowledgeArticle['template'];
  templateLabel: string;
}

export const TemplateSectionEditor = ({
  profileType,
  templateKey,
  templateLabel,
}: TemplateSectionEditorProps) => {
  const {
    getSections,
    updateSections,
    toggleSection,
    reorderSections,
    addSection,
    removeSection,
    renameSection,
    resetToDefaults,
    hasCustomizations,
  } = useTemplateSections();

  const {
    getPresetsForTemplate,
    savePreset,
    deletePreset,
    duplicatePreset,
    exportPreset,
    exportPresetAsJSON,
    importPreset,
    setDefaultPreset,
    getDefaultPreset,
  } = useTemplatePresets();

  const { toast } = useToast();

  const sections = getSections(profileType, templateKey);
  const presets = getPresetsForTemplate(profileType, templateKey);
  const defaultPreset = getDefaultPreset(profileType, templateKey);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  
  // Preset management state
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [presetTags, setPresetTags] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [activeTab, setActiveTab] = useState<'sections' | 'presets'>('sections');

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
    reorderedSections.forEach((section, newIndex) => {
      const oldIndex = sections.findIndex(s => s.id === section.id);
      if (oldIndex !== newIndex && oldIndex !== -1) {
        reorderSections(profileType, templateKey, oldIndex, newIndex);
      }
    });
  };

  const handleSaveAsPreset = () => {
    if (!presetName.trim()) return;
    
    const tags = presetTags.split(',').map(t => t.trim()).filter(Boolean);
    savePreset(
      presetName.trim(),
      profileType,
      templateKey,
      sections,
      presetDescription.trim() || undefined,
      tags.length > 0 ? tags : undefined
    );
    
    toast({
      title: 'Preset saved',
      description: `"${presetName}" has been saved to your presets`,
    });
    
    setPresetName('');
    setPresetDescription('');
    setPresetTags('');
    setShowSavePreset(false);
  };

  const handleLoadPreset = (preset: TemplatePreset) => {
    updateSections(profileType, templateKey, preset.sections.map(s => ({ ...s })));
    toast({
      title: 'Preset loaded',
      description: `Applied "${preset.name}" configuration`,
    });
  };

  const handleDeletePreset = (preset: TemplatePreset) => {
    deletePreset(preset.id);
    toast({
      title: 'Preset deleted',
      description: `"${preset.name}" has been removed`,
    });
  };

  const handleDuplicatePreset = (preset: TemplatePreset) => {
    const duplicate = duplicatePreset(preset.id, `${preset.name} (Copy)`);
    if (duplicate) {
      toast({
        title: 'Preset duplicated',
        description: `Created "${duplicate.name}"`,
      });
    }
  };

  const handleExportPreset = (preset: TemplatePreset) => {
    const data = exportPresetAsJSON(preset.id);
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${preset.name.replace(/\s+/g, '_').toLowerCase()}_preset.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Preset exported',
        description: 'Download started',
      });
    }
  };

  const handleSharePreset = (preset: TemplatePreset) => {
    const shareCode = exportPreset(preset.id);
    if (shareCode) {
      navigator.clipboard.writeText(shareCode);
      toast({
        title: 'Share code copied',
        description: 'Share this code with others to import your preset',
      });
    }
  };

  const handleSetDefault = (preset: TemplatePreset) => {
    setDefaultPreset(preset.id, profileType, templateKey);
    toast({
      title: 'Default preset updated',
      description: `"${preset.name}" will be used by default`,
    });
  };

  const handleImportPreset = () => {
    if (!importData.trim()) return;
    
    const imported = importPreset(importData.trim());
    if (imported) {
      toast({
        title: 'Preset imported',
        description: `Successfully imported "${imported.name}"`,
      });
      setImportData('');
      setShowImportDialog(false);
    } else {
      toast({
        title: 'Import failed',
        description: 'Invalid preset data. Please check the format.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sections' | 'presets')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sections" className="gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" />
            Presets
            {presets.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {presets.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Customize Sections</h3>
              <p className="text-xs text-muted-foreground">
                Drag to reorder, toggle to show/hide
              </p>
            </div>
            <div className="flex items-center gap-1">
              {hasCustomizations(profileType, templateKey) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetToDefaults(profileType, templateKey)}
                  className="gap-1 text-xs h-8"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavePreset(true)}
                className="gap-1 text-xs h-8"
              >
                <Save className="w-3 h-3" />
                Save as Preset
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[260px] pr-2">
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

          {/* Save Preset Dialog */}
          <Dialog open={showSavePreset} onOpenChange={setShowSavePreset}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Save as Preset</DialogTitle>
                <DialogDescription>
                  Save your current section configuration as a reusable preset
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preset Name *</label>
                  <Input
                    placeholder="e.g., My Custom KB Format"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Optional description..."
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    placeholder="e.g., support, technical, detailed (comma-separated)"
                    value={presetTags}
                    onChange={(e) => setPresetTags(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSavePreset(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAsPreset} disabled={!presetName.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="presets" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Saved Presets</h3>
              <p className="text-xs text-muted-foreground">
                Load, share, or manage your presets
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
              className="gap-1 text-xs h-8"
            >
              <Upload className="w-3 h-3" />
              Import
            </Button>
          </div>

          <ScrollArea className="h-[300px] pr-2">
            {presets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium">No presets yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Customize sections and save them as presets
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className={cn(
                      "p-3 rounded-lg border bg-background",
                      preset.isDefault && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {preset.name}
                          </span>
                          {preset.isDefault && (
                            <Badge variant="secondary" className="h-5 text-[10px]">
                              Default
                            </Badge>
                          )}
                        </div>
                        {preset.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {preset.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-muted-foreground">
                            {preset.sections.filter(s => s.enabled).length} sections
                          </span>
                          {preset.tags && preset.tags.length > 0 && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex gap-1 flex-wrap">
                                {preset.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="outline" className="h-4 text-[9px] px-1">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleLoadPreset(preset)}
                        >
                          <FolderOpen className="w-3 h-3 mr-1" />
                          Load
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleSetDefault(preset)}>
                              {preset.isDefault ? (
                                <StarOff className="w-4 h-4 mr-2" />
                              ) : (
                                <Star className="w-4 h-4 mr-2" />
                              )}
                              {preset.isDefault ? 'Remove Default' : 'Set as Default'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicatePreset(preset)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSharePreset(preset)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Copy Share Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportPreset(preset)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export as JSON
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeletePreset(preset)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Import Preset Dialog */}
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Import Preset</DialogTitle>
                <DialogDescription>
                  Paste a share code or JSON data to import a preset
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <Textarea
                  placeholder="Paste share code or JSON here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImportPreset} disabled={!importData.trim()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
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
  const { getPresetsForTemplate } = useTemplatePresets();
  const isCustomized = hasCustomizations(profileType, templateKey);
  const presetCount = getPresetsForTemplate(profileType, templateKey).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Settings2 className="w-4 h-4" />
            Customize
            {(isCustomized || presetCount > 0) && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {isCustomized ? 'Modified' : `${presetCount} presets`}
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
