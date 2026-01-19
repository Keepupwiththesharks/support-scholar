import { useState } from 'react';
import { CustomProfile, useCustomProfiles, AVAILABLE_TEMPLATES, PROFILE_ICONS } from '@/hooks/useCustomProfiles';
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
}

type BaseProfileType = 'student' | 'developer' | 'support' | 'researcher' | 'custom';

export const CustomProfileManager = ({
  open,
  onOpenChange,
  onSelectProfile,
  selectedCustomProfileId,
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

  const [activeTab, setActiveTab] = useState<'profiles' | 'create'>('profiles');
  const [editingProfile, setEditingProfile] = useState<CustomProfile | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');

  // Form state for creating/editing
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('👤');
  const [formDescription, setFormDescription] = useState('');
  const [formBasedOn, setFormBasedOn] = useState<BaseProfileType>('developer');
  const [formPreferences, setFormPreferences] = useState<RecordingPreferences>(
    DEFAULT_PROFILES.developer.preferences
  );
  const [formTemplates, setFormTemplates] = useState<string[]>(['simple', 'detailed']);

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

  const templatesByCategory = AVAILABLE_TEMPLATES.reduce((acc, template) => {
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

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'profiles' | 'create')} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profiles">My Profiles ({customProfiles.length})</TabsTrigger>
              <TabsTrigger value="create">
                {editingProfile ? 'Edit Profile' : 'Create New'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profiles" className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {customProfiles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg mb-2">No custom profiles yet</p>
                    <p className="text-sm mb-4">Create your first profile to customize tracking and templates</p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Profile
                    </Button>
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
                    
                    {Object.entries(templatesByCategory).map(([category, templates]) => (
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
