import { useState } from 'react';
import { UserProfile, UserProfileType, DEFAULT_PROFILES, RecordingPreferences } from '@/types';
import { CustomProfile, useCustomProfiles } from '@/hooks/useCustomProfiles';
import { CustomProfileManager } from '@/components/CustomProfileManager';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Settings2, Check, ChevronDown, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSelectorProps {
  selectedProfile: UserProfileType;
  onProfileChange: (profile: UserProfileType) => void;
  customPreferences?: RecordingPreferences;
  onPreferencesChange?: (preferences: RecordingPreferences) => void;
  selectedCustomProfileId?: string;
  onCustomProfileChange?: (profileId: string | null, profile: CustomProfile | null) => void;
}

const presetProfileTypes: UserProfileType[] = ['student', 'developer', 'support', 'researcher'];

export const ProfileSelector = ({
  selectedProfile,
  onProfileChange,
  customPreferences,
  onPreferencesChange,
  selectedCustomProfileId,
  onCustomProfileChange,
}: ProfileSelectorProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomManager, setShowCustomManager] = useState(false);
  const { customProfiles, getProfileById } = useCustomProfiles();

  // Get the active profile (either preset or custom)
  const activeCustomProfile = selectedCustomProfileId ? getProfileById(selectedCustomProfileId) : null;
  const currentProfile = activeCustomProfile 
    ? { 
        name: activeCustomProfile.name, 
        icon: activeCustomProfile.icon, 
        description: activeCustomProfile.description,
        preferences: activeCustomProfile.preferences,
        outputTemplates: activeCustomProfile.outputTemplates,
        type: 'custom' as UserProfileType,
      }
    : DEFAULT_PROFILES[selectedProfile];
  
  const preferences = activeCustomProfile
    ? activeCustomProfile.preferences
    : selectedProfile === 'custom' && customPreferences 
      ? customPreferences 
      : currentProfile.preferences;

  const handlePreferenceToggle = (key: keyof RecordingPreferences) => {
    if (!onPreferencesChange) return;
    const current = preferences[key];
    if (typeof current === 'boolean') {
      onPreferencesChange({
        ...preferences,
        [key]: !current,
      });
    }
  };

  const handleIntervalChange = (value: number[]) => {
    if (!onPreferencesChange) return;
    onPreferencesChange({
      ...preferences,
      captureInterval: value[0],
    });
  };

  const handleSelectPresetProfile = (type: UserProfileType) => {
    onProfileChange(type);
    onCustomProfileChange?.(null, null);
  };

  const handleSelectCustomProfile = (profileId: string) => {
    const profile = getProfileById(profileId);
    if (profile) {
      onProfileChange('custom');
      onCustomProfileChange?.(profileId, profile);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="text-lg">{currentProfile.icon}</span>
                <span>{currentProfile.name}</span>
                {activeCustomProfile && (
                  <Badge variant="secondary" className="text-xs">Custom</Badge>
                )}
              </span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Preset Profiles</DropdownMenuLabel>
            {presetProfileTypes.map((type) => {
              const profile = DEFAULT_PROFILES[type];
              const isSelected = selectedProfile === type && !selectedCustomProfileId;
              
              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleSelectPresetProfile(type)}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    isSelected && "bg-accent"
                  )}
                >
                  <span className="text-lg">{profile.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium">{profile.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}

            {customProfiles.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  My Custom Profiles
                </DropdownMenuLabel>
                {customProfiles.map((profile) => {
                  const isSelected = selectedCustomProfileId === profile.id;
                  
                  return (
                    <DropdownMenuItem
                      key={profile.id}
                      onClick={() => handleSelectCustomProfile(profile.id)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isSelected && "bg-accent"
                      )}
                    >
                      <span className="text-lg">{profile.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{profile.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowCustomManager(true)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Manage Custom Profiles...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings2 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{currentProfile.icon}</span>
                {currentProfile.name} Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">What to Track</h4>
                <div className="grid gap-3">
                  {[
                    { key: 'trackBrowserTabs', label: 'Browser Tabs', desc: 'Track open tabs and URLs' },
                    { key: 'trackApplications', label: 'Applications', desc: 'Track app usage' },
                    { key: 'trackTerminal', label: 'Terminal/CLI', desc: 'Track command line activity' },
                    { key: 'trackMessaging', label: 'Messaging', desc: 'Track Slack, Discord, etc.' },
                    { key: 'trackMeetings', label: 'Meetings', desc: 'Track video calls' },
                    { key: 'trackDocuments', label: 'Documents', desc: 'Track file activity' },
                    { key: 'trackMedia', label: 'Media', desc: 'Track video/audio consumption' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={key} className="text-sm">{label}</Label>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        id={key}
                        checked={preferences[key as keyof RecordingPreferences] as boolean}
                        onCheckedChange={() => handlePreferenceToggle(key as keyof RecordingPreferences)}
                        disabled={selectedProfile !== 'custom'}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Screenshots</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screenshots" className="text-sm">Capture Screenshots</Label>
                    <p className="text-xs text-muted-foreground">Auto-capture screen periodically</p>
                  </div>
                  <Switch
                    id="screenshots"
                    checked={preferences.captureScreenshots}
                    onCheckedChange={() => handlePreferenceToggle('captureScreenshots')}
                    disabled={selectedProfile !== 'custom'}
                  />
                </div>
                {preferences.captureScreenshots && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Capture Interval</span>
                      <span className="text-muted-foreground">{preferences.captureInterval}s</span>
                    </div>
                    <Slider
                      value={[preferences.captureInterval]}
                      onValueChange={handleIntervalChange}
                      min={5}
                      max={60}
                      step={5}
                      disabled={selectedProfile !== 'custom'}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Output Templates</h4>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.outputTemplates.map((template) => (
                    <Badge key={template} variant="secondary" className="capitalize">
                      {template.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedProfile !== 'custom' && (
                <p className="text-xs text-muted-foreground text-center">
                  Switch to Custom profile to modify settings
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {currentProfile.description}
      </p>

      <CustomProfileManager
        open={showCustomManager}
        onOpenChange={setShowCustomManager}
        selectedCustomProfileId={selectedCustomProfileId}
        onSelectProfile={(profileId) => {
          handleSelectCustomProfile(profileId);
          setShowCustomManager(false);
        }}
      />
    </div>
  );
};
