import { useState } from 'react';
import { Globe, Code, FileText, Users, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaptureTabInput, CaptureCodeInput, CaptureNoteInput, CaptureMeetingInput } from '@/hooks/useRecording';

type CaptureType = 'tab' | 'code' | 'note' | 'meeting';

interface ActivityCaptureModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: CaptureType;
  onCaptureTab: (input: CaptureTabInput) => Promise<void>;
  onCaptureCode: (input: CaptureCodeInput) => void;
  onCaptureNote: (input: CaptureNoteInput) => void;
  onCaptureMeeting: (input: CaptureMeetingInput) => void;
}

export const ActivityCaptureModal = ({
  open,
  onClose,
  defaultType = 'tab',
  onCaptureTab,
  onCaptureCode,
  onCaptureNote,
  onCaptureMeeting,
}: ActivityCaptureModalProps) => {
  const [activeTab, setActiveTab] = useState<CaptureType>(defaultType);
  const [isLoading, setIsLoading] = useState(false);

  // Tab form
  const [tabUrl, setTabUrl] = useState('');
  const [tabTitle, setTabTitle] = useState('');
  const [tabDescription, setTabDescription] = useState('');

  // Code form
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeSource, setCodeSource] = useState('VS Code');
  const [codeDescription, setCodeDescription] = useState('');

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');

  // Meeting form
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingAttendees, setMeetingAttendees] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingActionItems, setMeetingActionItems] = useState('');

  const resetForms = () => {
    setTabUrl('');
    setTabTitle('');
    setTabDescription('');
    setCodeContent('');
    setCodeLanguage('typescript');
    setCodeSource('VS Code');
    setCodeDescription('');
    setNoteTitle('');
    setNoteText('');
    setMeetingTitle('');
    setMeetingAttendees('');
    setMeetingNotes('');
    setMeetingActionItems('');
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'tab':
          if (!tabUrl.trim()) return;
          await onCaptureTab({
            url: tabUrl.trim(),
            title: tabTitle.trim() || undefined,
            description: tabDescription.trim() || undefined,
          });
          break;
        case 'code':
          if (!codeContent.trim()) return;
          onCaptureCode({
            code: codeContent,
            language: codeLanguage,
            source: codeSource,
            description: codeDescription.trim() || undefined,
          });
          break;
        case 'note':
          if (!noteText.trim()) return;
          onCaptureNote({
            text: noteText.trim(),
            title: noteTitle.trim() || undefined,
          });
          break;
        case 'meeting':
          if (!meetingTitle.trim()) return;
          onCaptureMeeting({
            title: meetingTitle.trim(),
            attendees: meetingAttendees.trim() || undefined,
            notes: meetingNotes.trim() || undefined,
            actionItems: meetingActionItems.trim()
              ? meetingActionItems.split('\n').filter(item => item.trim())
              : undefined,
          });
          break;
      }
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const tabIcons = {
    tab: Globe,
    code: Code,
    note: FileText,
    meeting: Users,
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Capture Activity
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CaptureType)}>
          <TabsList className="w-full grid grid-cols-4">
            {(['tab', 'code', 'note', 'meeting'] as const).map((type) => {
              const Icon = tabIcons[type];
              return (
                <TabsTrigger key={type} value={type} className="gap-1.5 text-xs">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline capitalize">{type === 'tab' ? 'URL' : type}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="tab" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com/article"
                value={tabUrl}
                onChange={(e) => setTabUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste a URL and we'll fetch the page title automatically
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tabTitle">Custom Title (optional)</Label>
              <Input
                id="tabTitle"
                placeholder="Override the page title"
                value={tabTitle}
                onChange={(e) => setTabTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tabDesc">Notes (optional)</Label>
              <Textarea
                id="tabDesc"
                placeholder="Why is this relevant?"
                value={tabDescription}
                onChange={(e) => setTabDescription(e.target.value)}
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                    <SelectItem value="bash">Bash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={codeSource} onValueChange={setCodeSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VS Code">VS Code</SelectItem>
                    <SelectItem value="GitHub">GitHub</SelectItem>
                    <SelectItem value="Terminal">Terminal</SelectItem>
                    <SelectItem value="Stack Overflow">Stack Overflow</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Textarea
                id="code"
                placeholder="Paste your code here..."
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeDesc">Description (optional)</Label>
              <Input
                id="codeDesc"
                placeholder="What does this code do?"
                value={codeDescription}
                onChange={(e) => setCodeDescription(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="note" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="noteTitle">Title (optional)</Label>
              <Input
                id="noteTitle"
                placeholder="Give your note a title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noteText">Note *</Label>
              <Textarea
                id="noteText"
                placeholder="Write your thoughts, observations, or ideas..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={5}
              />
            </div>
          </TabsContent>

          <TabsContent value="meeting" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="meetingTitle">Meeting Title *</Label>
              <Input
                id="meetingTitle"
                placeholder="e.g., Sprint Planning, 1:1 with Manager"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendees">Attendees (optional)</Label>
              <Input
                id="attendees"
                placeholder="John, Sarah, Mike"
                value={meetingAttendees}
                onChange={(e) => setMeetingAttendees(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingNotes">Meeting Notes (optional)</Label>
              <Textarea
                id="meetingNotes"
                placeholder="Key discussion points and decisions..."
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionItems">Action Items (one per line, optional)</Label>
              <Textarea
                id="actionItems"
                placeholder="Follow up with design team&#10;Schedule user testing&#10;Update documentation"
                value={meetingActionItems}
                onChange={(e) => setMeetingActionItems(e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add to Timeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
