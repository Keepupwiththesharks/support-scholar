import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Plus,
  FileText,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { CustomTemplate, DEFAULT_TEMPLATES } from '@/types/templates';
import { TemplateBuilder } from './TemplateBuilder';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelectTemplate: (template: CustomTemplate) => void;
}

export const TemplateSelector = ({
  selectedTemplateId,
  onSelectTemplate,
}: TemplateSelectorProps) => {
  const { getAllTemplates, getCustomTemplates } = useCustomTemplates();
  const [open, setOpen] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const allTemplates = getAllTemplates();
  const customTemplates = getCustomTemplates();
  
  const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0];

  const handleSelect = (template: CustomTemplate) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between min-w-[200px] gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedTemplate.icon}</span>
              <span className="truncate">{selectedTemplate.name}</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <div className="p-3 border-b">
            <h4 className="font-medium text-sm">Select Template</h4>
            <p className="text-xs text-muted-foreground">Choose a template for your output</p>
          </div>
          
          <ScrollArea className="max-h-[300px]">
            {/* Default Templates */}
            <div className="p-2">
              <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Default Templates
              </div>
              {DEFAULT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors",
                    selectedTemplateId === template.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="text-lg">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{template.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {template.sections.length} sections
                    </p>
                  </div>
                  {selectedTemplateId === template.id && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Templates */}
            {customTemplates.length > 0 && (
              <>
                <Separator />
                <div className="p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground">
                    <FileText className="w-3 h-3" />
                    Your Templates
                  </div>
                  {customTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors",
                        selectedTemplateId === template.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="text-lg">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{template.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {template.sections.filter(s => s.enabled).length} sections
                        </p>
                      </div>
                      {selectedTemplateId === template.id && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </ScrollArea>

          <Separator />
          
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                setOpen(false);
                setShowBuilder(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Template
            </button>
            <Link
              to="/templates"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="w-4 h-4" />
              Manage Templates
            </Link>
          </div>
        </PopoverContent>
      </Popover>

      <TemplateBuilder
        open={showBuilder}
        onOpenChange={setShowBuilder}
        onTemplateCreated={(template) => {
          onSelectTemplate(template);
        }}
      />
    </>
  );
};
