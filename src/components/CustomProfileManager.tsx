import { useState, useMemo } from 'react';
import { CustomProfile, useCustomProfiles, AVAILABLE_TEMPLATES, PROFILE_ICONS, PROFILE_TEMPLATES, ProfileTemplate } from '@/hooks/useCustomProfiles';
import { RecordingPreferences, DEFAULT_PROFILES, UserProfileType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Copy, 
  Share2, 
  Download, 
  Upload,
  MoreVertical,
  Check,
  ChevronRight,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CustomProfileManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProfile?: (profileId: string) => void;
  selectedCustomProfileId?: string;
  currentProfileType?: 'student' | 'developer' | 'support' | 'researcher' | 'custom';
}

type BaseProfileType = 'student' | 'developer' | 'support' | 'researcher' | 'custom';

// Recommendation scoring based on various signals
const getRecommendationScore = (
  template: ProfileTemplate,
  currentProfileType: BaseProfileType | undefined,
  existingProfiles: CustomProfile[],
  hour: number
): number => {
  let score = 0;
  
  // 1. Match current profile type (strong signal)
  if (currentProfileType && template.basedOn === currentProfileType) {
    score += 30;
  }
  
  // 2. Category affinity based on existing profiles
  const existingCategories = existingProfiles.map(p => {
    const matchingTemplate = PROFILE_TEMPLATES.find(t => t.name === p.name);
    return matchingTemplate?.category;
  }).filter(Boolean);
  
  if (existingCategories.includes(template.category)) {
    score += 20;
  }
  
  // 3. Time-based relevance
  const isWorkHours = hour >= 9 && hour < 18;
  const isStudyTime = hour >= 18 && hour < 22;
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
  
  if (isWorkHours && !isWeekend) {
    if (['Development', 'Support', 'Business'].includes(template.category)) score += 15;
  } else if (isStudyTime) {
    if (['Education', 'Research'].includes(template.category)) score += 15;
  } else if (isWeekend) {
    if (['Personal', 'Creative', 'Education'].includes(template.category)) score += 10;
  }
  
  // 4. Complementary profiles (if they have dev, suggest devops/code reviewer)
  const existingNames = existingProfiles.map(p => p.name);
  const complementaryPairs: Record<string, string[]> = {
    'Frontend Developer': ['Backend Engineer', 'Designer', 'Code Reviewer'],
    'Backend Engineer': ['Frontend Developer', 'DevOps Engineer', 'Bug Hunter'],
    'DevOps Engineer': ['Backend Engineer', 'Technical Support'],
    'Data Analyst': ['UX Researcher', 'Market Analyst'],
    'Content Writer': ['Designer', 'Podcaster'],
    'Project Manager': ['Product Manager', 'Consultant'],
    'Online Course Learner': ['Exam Prep', 'Language Learner'],
  };
  
  for (const [existing, complements] of Object.entries(complementaryPairs)) {
    if (existingNames.includes(existing) && complements.includes(template.name)) {
      score += 25;
    }
  }
  
  // 5. Popularity boost for versatile profiles
  const popularProfiles = ['Frontend Developer', 'Project Manager', 'Content Writer', 'Online Course Learner', 'Data Analyst'];
  if (popularProfiles.includes(template.name)) {
    score += 5;
  }
  
  // 6. New user boost - suggest starter profiles
  if (existingProfiles.length === 0) {
    const starterProfiles = ['Online Course Learner', 'Frontend Developer', 'Content Writer', 'Hobbyist'];
    if (starterProfiles.includes(template.name)) {
      score += 20;
    }
  }
  
  return score;
};

const getRecommendationReason = (
  template: ProfileTemplate,
  currentProfileType: BaseProfileType | undefined,
  existingProfiles: CustomProfile[]
): string => {
  if (currentProfileType && template.basedOn === currentProfileType) {
    return `Matches your ${currentProfileType} profile`;
  }
  
  const existingNames = existingProfiles.map(p => p.name);
  const complementaryPairs: Record<string, string> = {
    'Frontend Developer': 'Complements your Frontend Developer profile',
    'Backend Engineer': 'Great pair with Frontend Developer',
    'Code Reviewer': 'Works well with your dev profiles',
    'DevOps Engineer': 'Extends your engineering toolkit',
    'Data Analyst': 'Adds analytics capabilities',
  };
  
  for (const [trigger, reason] of Object.entries(complementaryPairs)) {
    if (existingNames.includes(trigger.split(' ')[0] + ' ' + (trigger.split(' ')[1] || ''))) {
      return reason;
    }
  }
  
  const hour = new Date().getHours();
  if (hour >= 9 && hour < 18 && ['Development', 'Support', 'Business'].includes(template.category)) {
    return 'Popular during work hours';
  }
  if (hour >= 18 && hour < 22 && ['Education', 'Research'].includes(template.category)) {
    return 'Great for evening learning';
  }
  
  if (existingProfiles.length === 0) {
    return 'Great starter profile';
  }
  
  return 'Recommended for you';
};

export const CustomProfileManager = ({
  open,
  onOpenChange,
  onSelectProfile,
  selectedCustomProfileId,
  currentProfileType,
}: CustomProfileManagerProps) => {
  const {
    customProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    duplicateProfile,
    exportProfile,
    importProfile,
    setDefaultProfile,
    getDefaultProfile,
  } = useCustomProfiles();

  const [activeTab, setActiveTab] = useState<'profiles' | 'templates' | 'create'>('profiles');
  const [editingProfile, setEditingProfile] = useState<CustomProfile | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

  // Form state for creating/editing
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('👤');
  const [formDescription, setFormDescription] = useState('');
  const [formBasedOn, setFormBasedOn] = useState<BaseProfileType>('developer');
  const [formPreferences, setFormPreferences] = useState<RecordingPreferences>(
    DEFAULT_PROFILES.developer.preferences
  );
  const [formTemplates, setFormTemplates] = useState<string[]>(['simple', 'detailed']);

  // Get unique categories from templates
  const templateCategories = useMemo(() => {
    const cats = [...new Set(PROFILE_TEMPLATES.map(t => t.category))];
    return ['all', ...cats];
  }, []);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return PROFILE_TEMPLATES.filter(t => {
      const matchesSearch = templateSearch === '' || 
        t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(templateSearch.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templateSearch, selectedCategory]);

  // Group filtered templates by category
  const templatesByCategory = useMemo(() => {
    return filteredTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, ProfileTemplate[]>);
  }, [filteredTemplates]);

  // Generate personalized recommendations
  const recommendations = useMemo(() => {
    const hour = new Date().getHours();
    const availableForRecommendation = PROFILE_TEMPLATES.filter(
      t => !customProfiles.some(p => p.name === t.name)
    );
    
    const scored = availableForRecommendation.map(template => ({
      template,
      score: getRecommendationScore(template, currentProfileType, customProfiles, hour),
      reason: getRecommendationReason(template, currentProfileType, customProfiles),
    }));
    
    // Sort by score and take top 4
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .filter(r => r.score > 0); // Only show if there's a reason
  }, [customProfiles, currentProfileType]);

  const handleAddFromTemplate = (template: ProfileTemplate) => {
    const basePrefs = DEFAULT_PROFILES[template.basedOn].preferences;
    createProfile(
      template.name,
      template.icon,
      template.description,
      template.basedOn,
      { ...basePrefs, ...template.preferences },
      template.outputTemplates
    );
    toast.success(`Added "${template.name}" profile`);
  };

  // Bulk selection helpers
  const availableTemplates = useMemo(() => {
    return filteredTemplates.filter(t => !customProfiles.some(p => p.name === t.name));
  }, [filteredTemplates, customProfiles]);

  const toggleTemplateSelection = (templateName: string) => {
    setSelectedTemplates(prev => {
      const next = new Set(prev);
      if (next.has(templateName)) {
        next.delete(templateName);
      } else {
        next.add(templateName);
      }
      return next;
    });
  };

  const selectAllAvailable = () => {
    setSelectedTemplates(new Set(availableTemplates.map(t => t.name)));
  };

  const clearSelection = () => {
    setSelectedTemplates(new Set());
  };

  const handleBulkAdd = () => {
    const templatesToAdd = PROFILE_TEMPLATES.filter(t => selectedTemplates.has(t.name));
    templatesToAdd.forEach(template => {
      const basePrefs = DEFAULT_PROFILES[template.basedOn].preferences;
      createProfile(
        template.name,
        template.icon,
        template.description,
        template.basedOn,
        { ...basePrefs, ...template.preferences },
        template.outputTemplates
      );
    });
    toast.success(`Added ${templatesToAdd.length} profiles`);
    setSelectedTemplates(new Set());
  };

  const resetForm = () => {
    setFormName('');
    setFormIcon('👤');
    setFormDescription('');
    setFormBasedOn('developer');
    setFormPreferences(DEFAULT_PROFILES.developer.preferences);
    setFormTemplates(['simple', 'detailed']);
    setEditingProfile(null);
  };

  const handleBaseProfileChange = (baseType: BaseProfileType) => {
    setFormBasedOn(baseType);
    setFormPreferences(DEFAULT_PROFILES[baseType].preferences);
    setFormTemplates(DEFAULT_PROFILES[baseType].outputTemplates);
  };

  const handlePreferenceToggle = (key: keyof RecordingPreferences) => {
    const current = formPreferences[key];
    if (typeof current === 'boolean') {
      setFormPreferences({
        ...formPreferences,
        [key]: !current,
      });
    }
  };

  const handleTemplateToggle = (templateId: string) => {
    if (formTemplates.includes(templateId)) {
      setFormTemplates(formTemplates.filter(t => t !== templateId));
    } else {
      setFormTemplates([...formTemplates, templateId]);
    }
  };

  const handleSaveProfile = () => {
    if (!formName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }
    if (formTemplates.length === 0) {
      toast.error('Please select at least one template');
      return;
    }

    if (editingProfile) {
      updateProfile(editingProfile.id, {
        name: formName,
        icon: formIcon,
        description: formDescription,
        basedOn: formBasedOn,
        preferences: formPreferences,
        outputTemplates: formTemplates,
      });
      toast.success('Profile updated successfully');
    } else {
      createProfile(formName, formIcon, formDescription, formBasedOn, formPreferences, formTemplates);
      toast.success('Profile created successfully');
    }

    resetForm();
    setActiveTab('profiles');
  };

  const handleEditProfile = (profile: CustomProfile) => {
    setEditingProfile(profile);
    setFormName(profile.name);
    setFormIcon(profile.icon);
    setFormDescription(profile.description);
    setFormBasedOn(profile.basedOn);
    setFormPreferences(profile.preferences);
    setFormTemplates(profile.outputTemplates);
    setActiveTab('create');
  };

  const handleDuplicate = (profile: CustomProfile) => {
    duplicateProfile(profile.id, `${profile.name} (Copy)`);
    toast.success('Profile duplicated');
  };

  const handleSetDefault = (profile: CustomProfile) => {
    if (profile.isDefault) {
      setDefaultProfile(null);
      toast.success('Default profile cleared');
    } else {
      setDefaultProfile(profile.id);
      toast.success(`"${profile.name}" set as default`);
    }
  };

  const handleExport = (profile: CustomProfile) => {
    const data = exportProfile(profile.id);
    if (data) {
      navigator.clipboard.writeText(data);
      toast.success('Share code copied to clipboard');
    }
  };

  const handleImport = () => {
    const imported = importProfile(importData);
    if (imported) {
      toast.success(`Imported "${imported.name}"`);
      setShowImportDialog(false);
      setImportData('');
    } else {
      toast.error('Invalid import data');
    }
  };

  const handleDelete = (profile: CustomProfile) => {
    deleteProfile(profile.id);
    toast.success('Profile deleted');
  };

  const availableTemplatesByCategory = AVAILABLE_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_TEMPLATES>);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ⚙️ Custom Profiles
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'profiles' | 'templates' | 'create')} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profiles">My Profiles ({customProfiles.length})</TabsTrigger>
              <TabsTrigger value="templates">Browse Templates</TabsTrigger>
              <TabsTrigger value="create">
                {editingProfile ? 'Edit' : 'Custom'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profiles" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {customProfiles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg mb-2">No custom profiles yet</p>
                    <p className="text-sm mb-4">Browse templates or create your own profile</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => setActiveTab('templates')}>
                        Browse Templates
                      </Button>
                      <Button onClick={() => setActiveTab('create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Custom
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className={cn(
                          "p-4 rounded-lg border bg-card transition-all hover:shadow-sm",
                          selectedCustomProfileId === profile.id && "ring-2 ring-primary"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{profile.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{profile.name}</h4>
                              {profile.isDefault && (
                                <Badge variant="default" className="text-xs gap-1">
                                  <Star className="w-3 h-3" />
                                  Default
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Based on {profile.basedOn}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {profile.description || 'No description'}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {profile.outputTemplates.slice(0, 4).map((template) => (
                                <Badge key={template} variant="secondary" className="text-xs capitalize">
                                  {template.replace('-', ' ')}
                                </Badge>
                              ))}
                              {profile.outputTemplates.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{profile.outputTemplates.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {onSelectProfile && (
                              <Button
                                size="sm"
                                variant={selectedCustomProfileId === profile.id ? "default" : "outline"}
                                onClick={() => onSelectProfile(profile.id)}
                              >
                                {selectedCustomProfileId === profile.id ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Active
                                  </>
                                ) : (
                                  'Use'
                                )}
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(profile)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport(profile)}>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Copy Share Code
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleSetDefault(profile)}
                                >
                                  <Star className={cn("w-4 h-4 mr-2", profile.isDefault && "fill-current")} />
                                  {profile.isDefault ? 'Remove as Default' : 'Set as Default'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(profile)}
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

              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportDialog(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <div className="flex-1" />
                <Button onClick={() => { resetForm(); setActiveTab('create'); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="flex-1 min-h-0 mt-4">
              <div className="space-y-4">
                {/* Search, Filter, and Bulk Actions */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search templates..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat === 'all' ? 'All Categories' : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Selection Bar */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={availableTemplates.length > 0 && selectedTemplates.size === availableTemplates.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAllAvailable();
                        } else {
                          clearSelection();
                        }
                      }}
                      disabled={availableTemplates.length === 0}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedTemplates.size === 0 
                        ? `${availableTemplates.length} available to add`
                        : `${selectedTemplates.size} selected`}
                    </span>
                    {selectedTemplates.size > 0 && selectedTemplates.size < availableTemplates.length && (
                      <Button variant="ghost" size="sm" onClick={selectAllAvailable} className="h-7 text-xs">
                        Select All ({availableTemplates.length})
                      </Button>
                    )}
                    {selectedTemplates.size > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearSelection} className="h-7 text-xs">
                        Clear
                      </Button>
                    )}
                  </div>
                  {selectedTemplates.size > 0 && (
                    <Button size="sm" onClick={handleBulkAdd} className="gap-1">
                      <Plus className="w-4 h-4" />
                      Add {selectedTemplates.size} Profile{selectedTemplates.size > 1 ? 's' : ''}
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  {/* Recommended for You Section */}
                  {recommendations.length > 0 && templateSearch === '' && selectedCategory === 'all' && (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <h4 className="text-sm font-semibold">Recommended for You</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {recommendations.map(({ template, reason }) => {
                          const alreadyAdded = customProfiles.some(p => p.name === template.name);
                          const isSelected = selectedTemplates.has(template.name);
                          return (
                            <div
                              key={template.name}
                              className={cn(
                                "p-3 rounded-lg border bg-card/80 backdrop-blur transition-all hover:shadow-md cursor-pointer",
                                isSelected && "ring-2 ring-primary bg-primary/10"
                              )}
                              onClick={() => !alreadyAdded && toggleTemplateSelection(template.name)}
                            >
                              <div className="flex items-start gap-2">
                                {!alreadyAdded && (
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleTemplateSelection(template.name)}
                                    className="mt-0.5"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                )}
                                <span className="text-xl">{template.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm truncate">{template.name}</h5>
                                  <p className="text-xs text-primary mt-0.5">{reason}</p>
                                </div>
                              </div>
                              <div className="mt-2 flex gap-1">
                                <Badge variant="outline" className="text-xs">{template.category}</Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No templates match your search</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(templatesByCategory).map(([category, templates]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            {category}
                            <Badge variant="secondary" className="text-xs">{templates.length}</Badge>
                          </h4>
                          <div className="grid gap-2">
                            {templates.map((template) => {
                              const alreadyAdded = customProfiles.some(p => p.name === template.name);
                              const isSelected = selectedTemplates.has(template.name);
                              return (
                                <div
                                  key={template.name}
                                  className={cn(
                                    "p-3 rounded-lg border bg-card transition-all hover:shadow-sm",
                                    alreadyAdded && "opacity-60",
                                    isSelected && !alreadyAdded && "ring-2 ring-primary bg-primary/5"
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    {!alreadyAdded && (
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleTemplateSelection(template.name)}
                                        className="mt-1"
                                      />
                                    )}
                                    <span className="text-2xl">{template.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-medium">{template.name}</h5>
                                        <Badge variant="outline" className="text-xs">
                                          {template.basedOn}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-0.5">
                                        {template.description}
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {template.outputTemplates.slice(0, 3).map((t) => (
                                          <Badge key={t} variant="secondary" className="text-xs capitalize">
                                            {t.replace('-', ' ')}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant={alreadyAdded ? "outline" : isSelected ? "secondary" : "default"}
                                      onClick={() => {
                                        if (alreadyAdded) return;
                                        if (isSelected) {
                                          toggleTemplateSelection(template.name);
                                        } else {
                                          handleAddFromTemplate(template);
                                        }
                                      }}
                                      disabled={alreadyAdded}
                                    >
                                      {alreadyAdded ? (
                                        <>
                                          <Check className="w-4 h-4 mr-1" />
                                          Added
                                        </>
                                      ) : isSelected ? (
                                        'Deselect'
                                      ) : (
                                        <>
                                          <Plus className="w-4 h-4 mr-1" />
                                          Add
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="create" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Profile Info</h4>
                    
                    <div className="flex gap-4">
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-16 h-16 text-2xl">
                              {formIcon}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-64 p-2">
                            <div className="grid grid-cols-5 gap-1">
                              {PROFILE_ICONS.map((icon) => (
                                <Button
                                  key={icon}
                                  variant={formIcon === icon ? "secondary" : "ghost"}
                                  className="w-10 h-10 text-xl p-0"
                                  onClick={() => setFormIcon(icon)}
                                >
                                  {icon}
                                </Button>
                              ))}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="profile-name">Name</Label>
                          <Input
                            id="profile-name"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g., My Research Profile"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profile-desc">Description</Label>
                          <Textarea
                            id="profile-desc"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="What is this profile for?"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Based On</Label>
                      <Select value={formBasedOn} onValueChange={(v) => handleBaseProfileChange(v as BaseProfileType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(['student', 'developer', 'support', 'researcher', 'custom'] as const).map((type) => (
                            <SelectItem key={type} value={type}>
                              <span className="flex items-center gap-2">
                                <span>{DEFAULT_PROFILES[type].icon}</span>
                                <span>{DEFAULT_PROFILES[type].name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Start with settings from an existing profile
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Tracking Preferences */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">What to Track</h4>
                    <div className="grid gap-3">
                      {[
                        { key: 'trackBrowserTabs', label: 'Browser Tabs', desc: 'Track open tabs and URLs' },
                        { key: 'trackApplications', label: 'Applications', desc: 'Track app usage' },
                        { key: 'trackTerminal', label: 'Terminal/CLI', desc: 'Track command line' },
                        { key: 'trackMessaging', label: 'Messaging', desc: 'Slack, Discord, etc.' },
                        { key: 'trackMeetings', label: 'Meetings', desc: 'Video calls' },
                        { key: 'trackDocuments', label: 'Documents', desc: 'File activity' },
                        { key: 'trackMedia', label: 'Media', desc: 'Video/audio' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <Label htmlFor={key} className="text-sm">{label}</Label>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                          <Switch
                            id={key}
                            checked={formPreferences[key as keyof RecordingPreferences] as boolean}
                            onCheckedChange={() => handlePreferenceToggle(key as keyof RecordingPreferences)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="screenshots" className="text-sm">Capture Screenshots</Label>
                          <p className="text-xs text-muted-foreground">Auto-capture periodically</p>
                        </div>
                        <Switch
                          id="screenshots"
                          checked={formPreferences.captureScreenshots}
                          onCheckedChange={() => handlePreferenceToggle('captureScreenshots')}
                        />
                      </div>
                      {formPreferences.captureScreenshots && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Capture Interval</span>
                            <span className="text-muted-foreground">{formPreferences.captureInterval}s</span>
                          </div>
                          <Slider
                            value={[formPreferences.captureInterval]}
                            onValueChange={(v) => setFormPreferences({ ...formPreferences, captureInterval: v[0] })}
                            min={5}
                            max={60}
                            step={5}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Output Templates */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Article Templates</h4>
                      <span className="text-xs text-muted-foreground">
                        {formTemplates.length} selected
                      </span>
                    </div>
                    
                    {Object.entries(availableTemplatesByCategory).map(([category, templates]) => (
                      <div key={category} className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          {category}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {templates.map((template) => (
                            <div
                              key={template.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors",
                                formTemplates.includes(template.id)
                                  ? "bg-primary/10 border-primary"
                                  : "hover:bg-muted"
                              )}
                              onClick={() => handleTemplateToggle(template.id)}
                            >
                              <Checkbox
                                checked={formTemplates.includes(template.id)}
                                className="pointer-events-none"
                              />
                              <span className="text-sm">{template.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="mt-4 pt-4 border-t">
                <Button variant="ghost" onClick={() => { resetForm(); setActiveTab('profiles'); }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  {editingProfile ? 'Save Changes' : 'Create Profile'}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Share Code or JSON</Label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste share code or JSON data here..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importData.trim()}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
