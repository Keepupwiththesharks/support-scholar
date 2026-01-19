import { useState } from 'react';
import { UserProfile, UserProfileType, DEFAULT_PROFILES, RecordingPreferences } from '@/types';
import { Card } from '@/components/ui/card';
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
import { Settings2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSelectorProps {
  selectedProfile: UserProfileType;
  onProfileChange: (profile: UserProfileType) => void;
  customPreferences?: RecordingPreferences;
  onPreferencesChange?: (preferences: RecordingPreferences) => void;
}

const profileTypes: UserProfileType[] = ['student', 'developer', 'support', 'researcher', 'custom'];

export const ProfileSelector = ({
  selectedProfile,
  onProfileChange,
  customPreferences,
  onPreferencesChange,
}: ProfileSelectorProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const currentProfile = DEFAULT_PROFILES[selectedProfile];
  const preferences = selectedProfile === 'custom' && customPreferences 
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Profile</h3>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Settings
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

      <div className="grid grid-cols-5 gap-2">
        {profileTypes.map((type) => {
          const profile = DEFAULT_PROFILES[type];
          const isSelected = selectedProfile === type;
          
          return (
            <button
              key={type}
              onClick={() => onProfileChange(type)}
              className={cn(
                "relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-transparent bg-muted/30"
              )}
            >
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <span className="text-2xl">{profile.icon}</span>
              <span className="text-xs font-medium truncate w-full text-center">
                {profile.name}
              </span>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        {currentProfile.description}
      </p>
    </div>
  );
};
