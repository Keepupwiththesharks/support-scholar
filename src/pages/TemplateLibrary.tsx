import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  FileText,
  Trash2,
  Copy,
  Download,
  Edit,
  MoreHorizontal,
  ArrowLeft,
  Sparkles,
  Clock,
  CheckCircle2,
  Upload,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { CustomTemplate, DEFAULT_TEMPLATES } from '@/types/templates';
import { TemplateBuilder } from '@/components/TemplateBuilder';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TemplateLibrary = () => {
  const {
    getAllTemplates,
    getCustomTemplates,
    deleteTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
  } = useCustomTemplates();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | undefined>();
  const [previewTemplate, setPreviewTemplate] = useState<CustomTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');

  const allTemplates = getAllTemplates();
  const customTemplates = getCustomTemplates();

  // Filter templates by search
  const filteredTemplates = allTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultTemplates = filteredTemplates.filter(t => t.isDefault);
  const userTemplates = filteredTemplates.filter(t => !t.isDefault);

  const handleDuplicate = (template: CustomTemplate) => {
    const newTemplate = duplicateTemplate(template.id, `${template.name} (Copy)`);
    if (newTemplate) {
      toast({
        title: 'Template duplicated',
        description: `Created "${newTemplate.name}"`,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setDeleteConfirm(null);
    toast({
      title: 'Template deleted',
      description: 'The template has been removed',
    });
  };

  const handleExport = (template: CustomTemplate) => {
    const json = exportTemplate(template.id);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, '_').toLowerCase()}_template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Template exported',
        description: 'Download started',
      });
    }
  };

  const handleImport = () => {
    if (!importData.trim()) return;
    const imported = importTemplate(importData.trim());
    if (imported) {
      toast({
        title: 'Template imported',
        description: `Added "${imported.name}"`,
      });
      setImportData('');
      setShowImportDialog(false);
    } else {
      toast({
        title: 'Import failed',
        description: 'Invalid template format',
        variant: 'destructive',
      });
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = importTemplate(text);
      if (imported) {
        toast({
          title: 'Template imported',
          description: `Added "${imported.name}"`,
        });
        setShowImportDialog(false);
      } else {
        throw new Error('Invalid format');
      }
    } catch {
      toast({
        title: 'Import failed',
        description: 'Could not parse the template file',
        variant: 'destructive',
      });
    }
  };

  const TemplateCard = ({ template, isDefault }: { template: CustomTemplate; isDefault: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Card className={cn(
        "group hover:shadow-lg transition-all cursor-pointer",
        "hover:border-primary/50"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{template.icon}</span>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {template.name}
                  {isDefault && (
                    <Badge variant="secondary" className="text-[10px]">Default</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {template.sections.filter(s => s.enabled).length} sections
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                {!isDefault && (
                  <DropdownMenuItem onClick={() => {
                    setEditingTemplate(template);
                    setShowBuilder(true);
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(template)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
                {!isDefault && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteConfirm(template.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {template.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {template.sections.slice(0, 4).map((s) => (
              <Badge key={s.id} variant="outline" className="text-[10px]">
                {s.label}
              </Badge>
            ))}
            {template.sections.length > 4 && (
              <Badge variant="outline" className="text-[10px]">
                +{template.sections.length - 4} more
              </Badge>
            )}
          </div>
          {!isDefault && template.createdAt && (
            <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Created {new Date(template.createdAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Template Library
                </h1>
                <p className="text-sm text-muted-foreground">
                  {allTemplates.length} templates • {customTemplates.length} custom
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => {
                setEditingTemplate(undefined);
                setShowBuilder(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Default Templates */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Default Templates</h2>
            <Badge variant="secondary">{defaultTemplates.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {defaultTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} isDefault />
              ))}
            </AnimatePresence>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Custom Templates */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="font-semibold">Your Templates</h2>
              <Badge variant="secondary">{userTemplates.length}</Badge>
            </div>
          </div>
          {userTemplates.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-medium mb-1">No custom templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first template with drag-and-drop or import from a URL
              </p>
              <Button onClick={() => {
                setEditingTemplate(undefined);
                setShowBuilder(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {userTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} isDefault={false} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      {/* Template Builder Dialog */}
      <TemplateBuilder
        open={showBuilder}
        onOpenChange={setShowBuilder}
        editingTemplate={editingTemplate}
        onTemplateCreated={() => {}}
      />

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{previewTemplate?.icon}</span>
              {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-2">
            <div className="space-y-2">
              {previewTemplate?.sections.map((section, i) => (
                <div
                  key={section.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    !section.enabled && "opacity-50"
                  )}
                >
                  <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{section.label}</p>
                    {section.description && (
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    )}
                  </div>
                  {section.enabled ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Disabled</span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Template</DialogTitle>
            <DialogDescription>
              Upload a template JSON file or paste the template data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Upload File</label>
              <Input
                type="file"
                accept=".json"
                onChange={handleFileImport}
              />
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium mb-2 block">Or Paste JSON</label>
              <textarea
                className="w-full h-32 p-3 rounded-md border bg-background text-sm font-mono"
                placeholder='{"name": "My Template", "sections": [...]}'
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
              <Button onClick={handleImport} disabled={!importData.trim()} className="mt-2">
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The template will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplateLibrary;
