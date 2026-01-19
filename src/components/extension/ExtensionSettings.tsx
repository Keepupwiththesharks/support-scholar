import { useState } from 'react';
import { 
  ArrowLeft, Globe, Bell, Shield, Database, Keyboard, Palette,
  User, LogOut, ChevronRight, Check, HelpCircle, ExternalLink,
  Monitor, Smartphone, Laptop, Cloud, Lock, Eye, EyeOff,
  Trash2, Download, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface ExtensionSettingsProps {
  onBack?: () => void;
}

type SettingsSection = 'general' | 'capture' | 'privacy' | 'sync' | 'shortcuts' | 'account';

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'slider' | 'action' | 'info';
  value?: boolean | string | number;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
}

const SECTIONS: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
  { id: 'capture', label: 'Capture', icon: <Monitor className="w-4 h-4" /> },
  { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
  { id: 'sync', label: 'Sync & Data', icon: <Cloud className="w-4 h-4" /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard className="w-4 h-4" /> },
  { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
];

export const ExtensionSettings = ({ onBack }: ExtensionSettingsProps) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  
  // Settings state
  const [settings, setSettings] = useState({
    // General
    autoStart: true,
    showFloatingWidget: true,
    startMinimized: false,
    theme: 'system',
    language: 'en',
    
    // Capture
    captureTabChanges: true,
    captureClipboard: true,
    captureScrollPosition: false,
    captureKeystrokes: false,
    captureScreenshots: true,
    screenshotInterval: 30,
    captureAudio: false,
    
    // Privacy
    excludedDomains: ['bank.com', 'mail.google.com'],
    incognitoTracking: false,
    anonymizeData: false,
    localStorageOnly: false,
    
    // Sync
    cloudSync: true,
    autoBackup: true,
    backupFrequency: 'daily',
    storageLimit: 50,
    
    // Account
    email: 'user@example.com',
    plan: 'pro',
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Startup</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-start recording</p>
              <p className="text-xs text-muted-foreground">Start recording when browser opens</p>
            </div>
            <Switch 
              checked={settings.autoStart} 
              onCheckedChange={(v) => updateSetting('autoStart', v)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show floating widget</p>
              <p className="text-xs text-muted-foreground">Display mini controls on pages</p>
            </div>
            <Switch 
              checked={settings.showFloatingWidget} 
              onCheckedChange={(v) => updateSetting('showFloatingWidget', v)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Start minimized</p>
              <p className="text-xs text-muted-foreground">Collapse widget on start</p>
            </div>
            <Switch 
              checked={settings.startMinimized} 
              onCheckedChange={(v) => updateSetting('startMinimized', v)} 
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
            </div>
            <Select value={settings.theme} onValueChange={(v) => updateSetting('theme', v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Language</p>
              <p className="text-xs text-muted-foreground">Display language</p>
            </div>
            <Select value={settings.language} onValueChange={(v) => updateSetting('language', v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCaptureSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Activity Capture</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tab changes</p>
              <p className="text-xs text-muted-foreground">Track when you switch tabs</p>
            </div>
            <Switch 
              checked={settings.captureTabChanges} 
              onCheckedChange={(v) => updateSetting('captureTabChanges', v)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Clipboard activity</p>
              <p className="text-xs text-muted-foreground">Capture copy/paste actions</p>
            </div>
            <Switch 
              checked={settings.captureClipboard} 
              onCheckedChange={(v) => updateSetting('captureClipboard', v)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Scroll position</p>
              <p className="text-xs text-muted-foreground">Track reading progress</p>
            </div>
            <Switch 
              checked={settings.captureScrollPosition} 
              onCheckedChange={(v) => updateSetting('captureScrollPosition', v)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Keystroke patterns</p>
              <Badge variant="outline" className="text-xs">Beta</Badge>
            </div>
            <Switch 
              checked={settings.captureKeystrokes} 
              onCheckedChange={(v) => updateSetting('captureKeystrokes', v)} 
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Screenshots</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-capture screenshots</p>
              <p className="text-xs text-muted-foreground">Periodically capture visible content</p>
            </div>
            <Switch 
              checked={settings.captureScreenshots} 
              onCheckedChange={(v) => updateSetting('captureScreenshots', v)} 
            />
          </div>
          {settings.captureScreenshots && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Capture interval</p>
                <span className="text-sm font-medium">{settings.screenshotInterval}s</span>
              </div>
              <Slider
                value={[settings.screenshotInterval]}
                onValueChange={([v]) => updateSetting('screenshotInterval', v)}
                min={10}
                max={120}
                step={10}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Audio</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Capture audio</p>
            <p className="text-xs text-muted-foreground">Record audio from tabs (meetings, videos)</p>
          </div>
          <Switch 
            checked={settings.captureAudio} 
            onCheckedChange={(v) => updateSetting('captureAudio', v)} 
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Excluded Sites</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Activity on these domains will never be recorded
        </p>
        <div className="space-y-2">
          {settings.excludedDomains.map((domain, i) => (
            <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{domain}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2">
            + Add domain
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Privacy Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Incognito tracking</p>
              <p className="text-xs text-muted-foreground">Record in private windows</p>
            </div>
            <Switch 
              checked={settings.incognitoTracking} 
              onCheckedChange={(v) => updateSetting('incognitoTracking', v)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Anonymize URLs</p>
              <p className="text-xs text-muted-foreground">Remove query parameters & IDs</p>
            </div>
            <Switch 
              checked={settings.anonymizeData} 
              onCheckedChange={(v) => updateSetting('anonymizeData', v)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Local storage only</p>
              <Badge variant="secondary" className="text-xs">Offline</Badge>
            </div>
            <Switch 
              checked={settings.localStorageOnly} 
              onCheckedChange={(v) => updateSetting('localStorageOnly', v)} 
            />
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Privacy First</p>
            <p className="text-xs text-muted-foreground">
              Your data is encrypted end-to-end. We never sell or share your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSyncSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Cloud Sync</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable cloud sync</p>
              <p className="text-xs text-muted-foreground">Sync across devices</p>
            </div>
            <Switch 
              checked={settings.cloudSync} 
              onCheckedChange={(v) => updateSetting('cloudSync', v)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto backup</p>
              <p className="text-xs text-muted-foreground">Automatic cloud backups</p>
            </div>
            <Switch 
              checked={settings.autoBackup} 
              onCheckedChange={(v) => updateSetting('autoBackup', v)} 
            />
          </div>
          {settings.autoBackup && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Backup frequency</p>
              <Select value={settings.backupFrequency} onValueChange={(v) => updateSetting('backupFrequency', v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Storage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm">Local storage</p>
              <span className="text-sm font-medium">2.4 MB / {settings.storageLimit} MB</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${(2.4 / settings.storageLimit) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
          <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear all data
          </Button>
        </div>
      </div>
    </div>
  );

  const renderShortcutsSettings = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Customize keyboard shortcuts for quick access
      </p>
      
      {[
        { action: 'Start/Stop Recording', shortcut: 'Ctrl + Shift + R' },
        { action: 'Pause Recording', shortcut: 'Ctrl + Shift + P' },
        { action: 'Open Popup', shortcut: 'Ctrl + Shift + E' },
        { action: 'Quick Note', shortcut: 'Ctrl + Shift + N' },
        { action: 'Toggle Widget', shortcut: 'Ctrl + Shift + W' },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <span className="text-sm">{item.action}</span>
          <Button variant="outline" size="sm" className="font-mono text-xs h-8">
            {item.shortcut}
          </Button>
        </div>
      ))}

      <div className="bg-muted/50 rounded-lg p-3 mt-4">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Click on a shortcut to customize it. Some shortcuts may conflict with browser defaults.
          </p>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold">
          {settings.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{settings.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-gradient-to-r from-primary to-primary/80">Pro Plan</Badge>
            <span className="text-xs text-muted-foreground">Since Jan 2024</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-between">
          Manage subscription
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="w-full justify-between">
          Connected devices
          <Badge variant="secondary" className="ml-2">3</Badge>
        </Button>
        <Button variant="outline" className="w-full justify-between">
          Help & Support
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      <Separator />

      <Button variant="outline" className="w-full text-destructive hover:text-destructive">
        <LogOut className="w-4 h-4 mr-2" />
        Sign out
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'capture': return renderCaptureSettings();
      case 'privacy': return renderPrivacySettings();
      case 'sync': return renderSyncSettings();
      case 'shortcuts': return renderShortcutsSettings();
      case 'account': return renderAccountSettings();
    }
  };

  return (
    <div className="w-[420px] bg-background border rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-semibold text-lg">Settings</h2>
      </div>

      <div className="flex h-[500px]">
        {/* Sidebar */}
        <div className="w-36 border-r p-2 shrink-0">
          <div className="space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                  activeSection === section.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </h3>
            {renderContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
