import { useState, useEffect } from 'react';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
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
  Copy,
  Download,
  MoreHorizontal,
  Wand2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { CustomTemplate, TemplateSection, SUGGESTED_SECTIONS, TEMPLATE_ICONS, DEFAULT_TEMPLATES } from '@/types/templates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface TemplateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTemplate?: CustomTemplate;
  onTemplateCreated?: (template: CustomTemplate) => void;
}

export const TemplateBuilder = ({
  open,
  onOpenChange,
  editingTemplate,
  onTemplateCreated,
}: TemplateBuilderProps) => {
  const { createTemplate, updateTemplate, duplicateTemplate } = useCustomTemplates();
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
  };

  const handleAddSuggestedSection = (label: string, description?: string) => {
    // Don't add if already exists
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
      // For now, handle JSON files directly
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
        // For other file types, call the edge function
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
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

          <TabsContent value="build" className="flex-1 overflow-hidden flex flex-col mt-4 space-y-4">
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

            <Separator />

            {/* Sections Editor */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Sections</h3>
                <Badge variant="secondary">{sections.filter(s => s.enabled).length} active</Badge>
              </div>

              <ScrollArea className="flex-1 pr-2">
                {sections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sections yet</p>
                    <p className="text-xs">Add sections below or pick from suggestions</p>
                  </div>
                ) : (
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
                          
                          {editingSectionId === section.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') setEditingSectionId(null);
                                }}
                              />
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveEdit}>
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingSectionId(null)}>
                                <X className="w-3.5 h-3.5 text-destructive" />
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
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleStartEdit(section)}>
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleToggleSection(section.id)}>
                                  {section.enabled ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveSection(section.id)}
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
                          "cursor-pointer hover:bg-primary/10 transition-colors",
                          sections.some(sec => sec.label.toLowerCase() === s.label.toLowerCase()) && "opacity-50"
                        )}
                        onClick={() => handleAddSuggestedSection(s.label, s.description)}
                      >
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>
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
