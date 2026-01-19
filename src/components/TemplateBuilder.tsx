import { useState, useEffect } from 'react';
import { AnimatePresence, Reorder, motion, useDragControls } from 'framer-motion';
import {
  GripVertical,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
  Link,
  Upload,
  FileText,
  Sparkles,
  ChevronDown,
  Save,
  Loader2,
  Wand2,
  LayoutTemplate,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { CustomTemplate, TemplateSection, SUGGESTED_SECTIONS, TEMPLATE_ICONS } from '@/types/templates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface TemplateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTemplate?: CustomTemplate;
  onTemplateCreated?: (template: CustomTemplate) => void;
}

// Draggable Section Item Component
const DraggableSectionItem = ({
  section,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggle,
  onRemove,
  isDragging,
}: {
  section: TemplateSection;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggle: () => void;
  onRemove: () => void;
  isDragging: boolean;
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={section}
      dragControls={dragControls}
      dragListener={false}
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border bg-card transition-all",
        isDragging && "shadow-lg ring-2 ring-primary/50 scale-[1.02] z-50",
        !section.enabled && "opacity-50 bg-muted/30"
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      layout
    >
      {/* Drag Handle */}
      <motion.div
        className={cn(
          "p-1 rounded cursor-grab active:cursor-grabbing hover:bg-muted transition-colors",
          isDragging && "cursor-grabbing bg-muted"
        )}
        onPointerDown={(e) => dragControls.start(e)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </motion.div>
      
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onSaveEdit}>
            <Check className="w-4 h-4 text-green-500" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onCancelEdit}>
            <X className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium truncate block">{section.label}</span>
            {section.description && (
              <span className="text-xs text-muted-foreground truncate block">{section.description}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 hover:bg-muted" 
              onClick={onStartEdit}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 hover:bg-muted" 
              onClick={onToggle}
            >
              {section.enabled ? (
                <Eye className="w-4 h-4 text-primary" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </Reorder.Item>
  );
};

// Live Preview Component
const TemplatePreview = ({
  name,
  icon,
  sections,
  isExpanded,
  onToggle,
}: {
  name: string;
  icon: string;
  sections: TemplateSection[];
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const enabledSections = sections.filter(s => s.enabled);

  return (
    <motion.div 
      className="border rounded-lg bg-muted/30 overflow-hidden"
      layout
    >
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Live Preview</span>
          <Badge variant="secondary" className="text-[10px]">
            {enabledSections.length} sections
          </Badge>
        </div>
        <ChevronRight className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isExpanded && "rotate-90"
        )} />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 pb-3 border-t bg-background/50">
              <div className="py-3 border-b mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-semibold text-sm">
                    {name || 'Untitled Template'}
                  </span>
                </div>
              </div>
              
              {enabledSections.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">
                  No sections added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {enabledSections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{section.label}</h4>
                          <div className="mt-1 space-y-1">
                            <div className="h-2 bg-muted rounded w-full" />
                            <div className="h-2 bg-muted rounded w-4/5" />
                            <div className="h-2 bg-muted rounded w-3/5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const TemplateBuilder = ({
  open,
  onOpenChange,
  editingTemplate,
  onTemplateCreated,
}: TemplateBuilderProps) => {
  const { createTemplate, updateTemplate } = useCustomTemplates();
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📝');
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [activeTab, setActiveTab] = useState<'build' | 'import'>('build');
  
  // Section editing
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // URL/File import
  const [importUrl, setImportUrl] = useState('');
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  // Initialize form when editing
  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name);
      setDescription(editingTemplate.description);
      setIcon(editingTemplate.icon);
      setSections(editingTemplate.sections.map(s => ({ ...s })));
    } else {
      resetForm();
    }
  }, [editingTemplate, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIcon('📝');
    setSections([]);
    setActiveTab('build');
    setImportUrl('');
    setImportedFile(null);
    setShowPreview(true);
  };

  const handleAddSection = () => {
    if (!newSectionLabel.trim()) return;
    
    const newSection: TemplateSection = {
      id: `section_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: newSectionLabel.trim(),
      description: newSectionDescription.trim() || undefined,
      order: sections.length,
      enabled: true,
    };
    
    setSections(prev => [...prev, newSection]);
    setNewSectionLabel('');
    setNewSectionDescription('');
    setShowAddSection(false);
    
    toast({
      title: 'Section added',
      description: `Added "${newSection.label}"`,
    });
  };

  const handleAddSuggestedSection = (label: string, description?: string) => {
    if (sections.some(s => s.label.toLowerCase() === label.toLowerCase())) {
      toast({
        title: 'Section already exists',
        description: `"${label}" is already in your template`,
        variant: 'destructive',
      });
      return;
    }
    
    const newSection: TemplateSection = {
      id: `section_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label,
      description,
      order: sections.length,
      enabled: true,
    };
    
    setSections(prev => [...prev, newSection]);
    toast({
      title: 'Section added',
      description: `Added "${label}" to your template`,
    });
  };

  const handleRemoveSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
  };

  const handleToggleSection = (id: string) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleStartEdit = (section: TemplateSection) => {
    setEditingSectionId(section.id);
    setEditValue(section.label);
  };

  const handleSaveEdit = () => {
    if (editingSectionId && editValue.trim()) {
      setSections(prev => prev.map(s => 
        s.id === editingSectionId ? { ...s, label: editValue.trim() } : s
      ));
    }
    setEditingSectionId(null);
    setEditValue('');
  };

  const handleReorder = (reorderedSections: TemplateSection[]) => {
    setSections(reorderedSections.map((s, i) => ({ ...s, order: i })));
  };

  const handleParseUrl = async () => {
    if (!importUrl.trim()) return;
    
    setIsParsingUrl(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-document-structure', {
        body: { url: importUrl.trim() },
      });
      
      if (error) throw error;
      
      if (data?.sections && Array.isArray(data.sections)) {
        setSections(data.sections.map((label: string, i: number) => ({
          id: `section_${Date.now()}_${i}`,
          label,
          order: i,
          enabled: true,
        })));
        
        if (data.title) setName(data.title);
        if (data.description) setDescription(data.description);
        
        toast({
          title: 'Structure extracted',
          description: `Found ${data.sections.length} sections from the document`,
        });
        setActiveTab('build');
      } else {
        throw new Error('Could not extract document structure');
      }
    } catch (error) {
      console.error('Failed to parse URL:', error);
      toast({
        title: 'Failed to parse URL',
        description: 'Could not extract structure from that URL. Try a different page or build manually.',
        variant: 'destructive',
      });
    } finally {
      setIsParsingUrl(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportedFile(file);
    setIsParsingFile(true);
    
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        
        if (parsed.sections && Array.isArray(parsed.sections)) {
          setSections(parsed.sections.map((s: TemplateSection | string, i: number) => ({
            id: `section_${Date.now()}_${i}`,
            label: typeof s === 'string' ? s : s.label,
            description: typeof s === 'string' ? undefined : s.description,
            order: i,
            enabled: true,
          })));
          if (parsed.name) setName(parsed.name);
          if (parsed.description) setDescription(parsed.description);
          if (parsed.icon) setIcon(parsed.icon);
          
          toast({
            title: 'Template imported',
            description: `Loaded ${parsed.sections.length} sections`,
          });
          setActiveTab('build');
        }
      } else {
        const formData = new FormData();
        formData.append('file', file);
        
        const { data, error } = await supabase.functions.invoke('parse-document-structure', {
          body: formData,
        });
        
        if (error) throw error;
        
        if (data?.sections) {
          setSections(data.sections.map((label: string, i: number) => ({
            id: `section_${Date.now()}_${i}`,
            label,
            order: i,
            enabled: true,
          })));
          if (data.title) setName(data.title);
          toast({
            title: 'Structure extracted',
            description: `Found ${data.sections.length} sections`,
          });
          setActiveTab('build');
        }
      }
    } catch (error) {
      console.error('Failed to parse file:', error);
      toast({
        title: 'Failed to parse file',
        description: 'Could not extract structure. Try a JSON template file.',
        variant: 'destructive',
      });
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your template',
        variant: 'destructive',
      });
      return;
    }
    
    if (sections.length === 0) {
      toast({
        title: 'Sections required',
        description: 'Add at least one section to your template',
        variant: 'destructive',
      });
      return;
    }
    
    const enabledSections = sections.filter(s => s.enabled);
    
    if (editingTemplate && !editingTemplate.isDefault) {
      updateTemplate(editingTemplate.id, {
        name: name.trim(),
        description: description.trim(),
        icon,
        sections,
      });
      toast({
        title: 'Template updated',
        description: `"${name}" has been saved`,
      });
    } else {
      const newTemplate = createTemplate(
        name.trim(),
        description.trim(),
        icon,
        enabledSections.map(s => ({ label: s.label, description: s.description })),
        importUrl ? 'url' : importedFile ? 'file' : 'scratch',
        importUrl || undefined
      );
      onTemplateCreated?.(newTemplate);
      toast({
        title: 'Template created',
        description: `"${name}" is ready to use`,
      });
    }
    
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            {editingTemplate ? 'Edit Template' : 'Create Custom Template'}
          </DialogTitle>
          <DialogDescription>
            Build your own template structure with drag-and-drop, or import from a URL/file
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'build' | 'import')} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="build" className="gap-1.5">
              <FileText className="w-4 h-4" />
              Build Manually
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-1.5">
              <Sparkles className="w-4 h-4" />
              Import Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="flex-1 overflow-hidden flex flex-col mt-4 gap-4">
            <div className="flex gap-4 flex-1 overflow-hidden">
              {/* Left: Editor */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Template Details */}
                <div className="grid grid-cols-[auto,1fr] gap-3 items-start">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 text-2xl"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                    >
                      {icon}
                    </Button>
                    {showIconPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-14 left-0 z-50 p-2 bg-popover border rounded-lg shadow-lg grid grid-cols-6 gap-1"
                      >
                        {TEMPLATE_ICONS.map((i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-lg"
                            onClick={() => {
                              setIcon(i);
                              setShowIconPicker(false);
                            }}
                          >
                            {i}
                          </Button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Template name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="font-medium"
                    />
                    <Input
                      placeholder="Short description (optional)..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Sections Editor */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Sections</h3>
                    <Badge variant="secondary">{sections.filter(s => s.enabled).length} active</Badge>
                  </div>

                  <ScrollArea className="flex-1 pr-2">
                    {sections.length === 0 ? (
                      <motion.div 
                        className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No sections yet</p>
                        <p className="text-xs mt-1">Add sections below or pick from suggestions</p>
                      </motion.div>
                    ) : (
                      <Reorder.Group
                        axis="y"
                        values={sections}
                        onReorder={handleReorder}
                        className="space-y-2"
                      >
                        <AnimatePresence mode="popLayout">
                          {sections.map((section) => (
                            <DraggableSectionItem
                              key={section.id}
                              section={section}
                              isEditing={editingSectionId === section.id}
                              editValue={editValue}
                              onEditValueChange={setEditValue}
                              onStartEdit={() => handleStartEdit(section)}
                              onSaveEdit={handleSaveEdit}
                              onCancelEdit={() => setEditingSectionId(null)}
                              onToggle={() => handleToggleSection(section.id)}
                              onRemove={() => handleRemoveSection(section.id)}
                              isDragging={draggingId === section.id}
                            />
                          ))}
                        </AnimatePresence>
                      </Reorder.Group>
                    )}
                  </ScrollArea>

                  {/* Add Section */}
                  <div className="mt-3 space-y-2">
                    <Collapsible open={showAddSection} onOpenChange={setShowAddSection}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Plus className="w-4 h-4" />
                          Add Custom Section
                          <ChevronDown className={cn("w-4 h-4 ml-auto transition-transform", showAddSection && "rotate-180")} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-3 space-y-2">
                        <Input
                          placeholder="Section name..."
                          value={newSectionLabel}
                          onChange={(e) => setNewSectionLabel(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                        />
                        <Input
                          placeholder="Description (optional)..."
                          value={newSectionDescription}
                          onChange={(e) => setNewSectionDescription(e.target.value)}
                          className="text-sm"
                        />
                        <Button onClick={handleAddSection} disabled={!newSectionLabel.trim()} className="w-full">
                          Add Section
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Suggested Sections */}
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                      <div className="flex flex-wrap gap-1">
                        {SUGGESTED_SECTIONS.slice(0, 10).map((s) => (
                          <Badge
                            key={s.label}
                            variant="outline"
                            className={cn(
                              "cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all",
                              sections.some(sec => sec.label.toLowerCase() === s.label.toLowerCase()) && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => handleAddSuggestedSection(s.label, s.description)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {s.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="w-64 flex-shrink-0">
                <TemplatePreview
                  name={name}
                  icon={icon}
                  sections={sections}
                  isExpanded={showPreview}
                  onToggle={() => setShowPreview(!showPreview)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="flex-1 overflow-hidden mt-4 space-y-4">
            <div className="space-y-4">
              {/* URL Import */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-primary" />
                  <h4 className="font-medium">Import from URL</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Paste a link to a document (Google Docs, Notion, web page) and we'll extract its structure
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://docs.google.com/document/..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleParseUrl} disabled={!importUrl.trim() || isParsingUrl}>
                    {isParsingUrl ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span className="ml-2">Extract</span>
                  </Button>
                </div>
              </div>

              {/* File Upload */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  <h4 className="font-medium">Upload File</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a .docx, .pdf, or .json template file to extract its structure
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept=".json,.docx,.pdf,.doc,.txt"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  {isParsingFile && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {importedFile && (
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="w-3 h-3" />
                    {importedFile.name}
                  </Badge>
                )}
              </div>

              {/* Tips */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">💡 Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use headings (H1, H2, H3) in your document - we'll detect them as sections</li>
                  <li>• For best results, use clearly formatted documents</li>
                  <li>• You can always edit the extracted structure afterwards</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || sections.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {editingTemplate ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
