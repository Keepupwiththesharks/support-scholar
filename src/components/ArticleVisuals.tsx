import { useState, useEffect } from 'react';
import { RecordingSession, UserProfileType } from '@/types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, CheckCircle2, Lightbulb, Target, BookOpen, Brain, Zap,
  Settings2, Eye, EyeOff, ChevronUp, ChevronDown, Pencil, Check, X,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  useVisualCustomization, 
  VisualType, 
  VisualConfig,
  EditableContent 
} from '@/hooks/useVisualCustomization';

interface ArticleVisualsProps {
  session: RecordingSession;
  profileType: UserProfileType;
  templateType: string;
}

// Color palette using semantic tokens
const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))',
  'hsl(210, 100%, 50%)',
  'hsl(280, 70%, 60%)',
  'hsl(160, 60%, 45%)',
];

// Data generation functions
const getActivityDistribution = (session: RecordingSession) => {
  const sources = session.events.reduce((acc, event) => {
    acc[event.source] = (acc[event.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(sources).map(([name, value]) => ({ name, value }));
};

const getTimelineData = (session: RecordingSession) => {
  const eventsByMinute: Record<number, number> = {};
  const startTime = session.events[0]?.timestamp.getTime() || Date.now();
  session.events.forEach(event => {
    const minute = Math.floor((event.timestamp.getTime() - startTime) / 60000);
    eventsByMinute[minute] = (eventsByMinute[minute] || 0) + 1;
  });
  return Object.entries(eventsByMinute)
    .map(([minute, count]) => ({ minute: `${minute}m`, count }))
    .slice(0, 10);
};

const getTopicBreakdown = (session: RecordingSession) => {
  const topics = session.events
    .filter(e => e.content?.text)
    .slice(0, 5)
    .map((e) => ({
      topic: e.title.split(' ').slice(0, 3).join(' '),
      importance: Math.floor(Math.random() * 40 + 60),
      understanding: Math.floor(Math.random() * 40 + 50),
    }));
  return topics.length > 0 ? topics : [
    { topic: 'Core Concepts', importance: 85, understanding: 70 },
    { topic: 'Examples', importance: 75, understanding: 80 },
    { topic: 'Theory', importance: 90, understanding: 60 },
  ];
};

// Editable text component
const EditableText = ({ 
  value, 
  onChange, 
  isEditing, 
  className = '',
  inputClassName = '',
}: { 
  value: string; 
  onChange: (value: string) => void; 
  isEditing: boolean;
  className?: string;
  inputClassName?: string;
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  if (!isEditing) {
    return <span className={className}>{value}</span>;
  }

  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onChange(localValue)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onChange(localValue);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={cn("h-auto py-1 px-2 text-sm", inputClassName)}
    />
  );
};

// Visual wrapper with controls
const VisualWrapper = ({
  id,
  label,
  isEditMode,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  children,
}: {
  id: VisualType;
  label: string;
  isEditMode: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className={cn(
      "relative group transition-all",
      isEditMode && "ring-2 ring-primary/20 ring-dashed rounded-xl"
    )}>
      {isEditMode && (
        <div className="absolute -top-3 left-4 flex items-center gap-1 bg-background px-2 py-0.5 rounded-full border text-xs z-10">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
          <span className="font-medium">{label}</span>
          <div className="flex items-center gap-0.5 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={onMoveUp}
              disabled={!canMoveUp}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={onMoveDown}
              disabled={!canMoveDown}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

// Concept Map Component
const ConceptMap = ({ 
  session, 
  isEditing,
  editableContent,
  onUpdateTitle,
  onUpdateItem,
}: { 
  session: RecordingSession;
  isEditing: boolean;
  editableContent: EditableContent;
  onUpdateTitle: (title: string) => void;
  onUpdateItem: (index: number, value: string) => void;
}) => {
  const concepts = editableContent.conceptMapItems.length > 0 
    ? editableContent.conceptMapItems 
    : session.events
        .filter(e => e.content?.text || e.content?.highlights?.length)
        .slice(0, 6)
        .map(e => e.content?.highlights?.[0] || e.content?.text?.slice(0, 30) || e.title);

  const mainTopic = editableContent.conceptMapTitle || session.name.split(' ').slice(0, 3).join(' ');

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/20">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4" />
        Concept Map
        {isEditing && <Pencil className="w-3 h-3 ml-1 text-primary" />}
      </h4>
      <div className="relative">
        <div className="flex justify-center mb-6">
          <div className={cn(
            "bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium text-sm shadow-lg",
            isEditing && "ring-2 ring-offset-2 ring-primary"
          )}>
            <EditableText
              value={mainTopic}
              onChange={onUpdateTitle}
              isEditing={isEditing}
              inputClassName="bg-primary text-primary-foreground border-primary-foreground/50"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {concepts.map((concept, i) => (
            <div key={i} className="relative">
              <div className="absolute top-0 left-1/2 w-px h-3 bg-primary/30 -translate-x-1/2 -translate-y-full" />
              <div className={cn(
                "bg-card border rounded-lg p-3 text-center text-xs shadow-sm hover:shadow-md transition-shadow",
                i % 2 === 0 ? "border-primary/30" : "border-accent/30",
                isEditing && "ring-1 ring-primary/30"
              )}>
                <EditableText
                  value={concept}
                  onChange={(v) => onUpdateItem(i, v)}
                  isEditing={isEditing}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Learning Flow Diagram
const LearningFlowDiagram = ({ 
  session,
  isEditing,
  editableContent,
  onUpdateStep,
}: { 
  session: RecordingSession;
  isEditing: boolean;
  editableContent: EditableContent;
  onUpdateStep: (index: number, value: string) => void;
}) => {
  const steps = editableContent.flowSteps.length > 0 
    ? editableContent.flowSteps
    : session.events
        .filter(e => e.type === 'action')
        .slice(0, 5)
        .map(e => e.content?.text?.slice(0, 40) || e.title);

  const defaultSteps = steps.length > 2 ? steps : [
    'Understand the basics',
    'Study examples',
    'Practice problems',
    'Review & reflect',
    'Apply knowledge',
  ];

  return (
    <div className="bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl p-6 border">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Learning Flow
        {isEditing && <Pencil className="w-3 h-3 ml-1 text-primary" />}
      </h4>
      <div className="flex flex-col gap-3">
        {defaultSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              i === defaultSteps.length - 1 
                ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                : "bg-primary/20 text-primary"
            )}>
              {i + 1}
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className={cn(
              "bg-card border rounded-lg px-4 py-2 text-sm flex-1 shadow-sm",
              isEditing && "ring-1 ring-primary/30"
            )}>
              <EditableText
                value={step}
                onChange={(v) => onUpdateStep(i, v)}
                isEditing={isEditing}
              />
            </div>
            {i === defaultSteps.length - 1 && (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Key Insights Cards
const InsightCards = ({ 
  session,
  isEditing,
  editableContent,
  onUpdateItem,
}: { 
  session: RecordingSession;
  isEditing: boolean;
  editableContent: EditableContent;
  onUpdateItem: (index: number, value: string) => void;
}) => {
  const insights = editableContent.insightItems.length > 0 
    ? editableContent.insightItems
    : session.events.flatMap(e => e.content?.highlights || []).slice(0, 4);

  const defaultInsights = insights.length > 2 ? insights : [
    'Core principle understanding is essential',
    'Practical application reinforces theory',
    'Regular review improves retention',
    'Connecting concepts builds expertise',
  ];

  const icons = [Lightbulb, Target, BookOpen, Brain];

  return (
    <div className="grid grid-cols-2 gap-4">
      {defaultInsights.map((insight, i) => {
        const Icon = icons[i % icons.length];
        return (
          <div 
            key={i} 
            className={cn(
              "p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow",
              i % 4 === 0 ? "bg-yellow-500/10 border-yellow-500/30" :
              i % 4 === 1 ? "bg-blue-500/10 border-blue-500/30" :
              i % 4 === 2 ? "bg-green-500/10 border-green-500/30" :
              "bg-purple-500/10 border-purple-500/30",
              isEditing && "ring-1 ring-primary/30"
            )}
          >
            <Icon className={cn(
              "w-5 h-5 mb-2",
              i % 4 === 0 ? "text-yellow-600 dark:text-yellow-400" :
              i % 4 === 1 ? "text-blue-600 dark:text-blue-400" :
              i % 4 === 2 ? "text-green-600 dark:text-green-400" :
              "text-purple-600 dark:text-purple-400"
            )} />
            <EditableText
              value={insight}
              onChange={(v) => onUpdateItem(i, v)}
              isEditing={isEditing}
              className="text-sm font-medium"
            />
          </div>
        );
      })}
    </div>
  );
};

// Research Process Flowchart
const ResearchFlowchart = ({ 
  isEditing,
  editableContent,
  onUpdateStage,
}: { 
  isEditing: boolean;
  editableContent: EditableContent;
  onUpdateStage: (index: number, updates: Partial<EditableContent['researchStages'][0]>) => void;
}) => {
  const stages = editableContent.researchStages;

  return (
    <div className="bg-gradient-to-br from-accent/5 to-secondary/5 rounded-xl p-6 border">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Target className="w-4 h-4" />
        Research Progress
        {isEditing && <Pencil className="w-3 h-3 ml-1 text-primary" />}
      </h4>
      <div className="flex items-center justify-between">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md cursor-pointer",
                  stage.status === 'complete' ? "bg-green-500/20 ring-2 ring-green-500" :
                  stage.status === 'current' ? "bg-primary/20 ring-2 ring-primary animate-pulse" :
                  "bg-muted"
                )}
                onClick={() => {
                  if (isEditing) {
                    const statusCycle: ('complete' | 'current' | 'pending')[] = ['pending', 'current', 'complete'];
                    const currentIndex = statusCycle.indexOf(stage.status);
                    const nextStatus = statusCycle[(currentIndex + 1) % 3];
                    onUpdateStage(i, { status: nextStatus });
                  }
                }}
              >
                {stage.icon}
              </div>
              <div className={cn("mt-2", isEditing && "ring-1 ring-primary/30 rounded px-1")}>
                <EditableText
                  value={stage.label}
                  onChange={(v) => onUpdateStage(i, { label: v })}
                  isEditing={isEditing}
                  className="text-xs font-medium"
                />
              </div>
            </div>
            {i < stages.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                stage.status === 'complete' ? "bg-green-500" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Source Analysis Chart
const SourceAnalysisChart = ({ session }: { session: RecordingSession }) => {
  const data = getActivityDistribution(session);

  return (
    <div className="bg-card rounded-xl p-6 border">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Sources Analyzed
      </h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Activity Timeline Chart
const ActivityTimelineChart = ({ session }: { session: RecordingSession }) => {
  const data = getTimelineData(session);

  return (
    <div className="bg-card rounded-xl p-6 border">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Activity Over Time
      </h4>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="minute" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorActivity)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Topic Mastery Radar
const TopicMasteryRadar = ({ session }: { session: RecordingSession }) => {
  const data = getTopicBreakdown(session);

  return (
    <div className="bg-card rounded-xl p-6 border">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4" />
        Topic Coverage
      </h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fontSize: 8 }} />
            <Radar
              name="Importance"
              dataKey="importance"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
            <Radar
              name="Understanding"
              dataKey="understanding"
              stroke="hsl(var(--accent))"
              fill="hsl(var(--accent))"
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Progress Bar Visualization
const ProgressVisualization = ({ session }: { session: RecordingSession }) => {
  const metrics = [
    { label: 'Sources Reviewed', value: session.events.filter(e => e.type === 'tab').length, max: 20 },
    { label: 'Notes Captured', value: session.events.filter(e => e.type === 'note').length, max: 10 },
    { label: 'Actions Taken', value: session.events.filter(e => e.type === 'action').length, max: 15 },
  ];

  return (
    <div className="bg-card rounded-xl p-6 border">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4">Session Metrics</h4>
      <div className="space-y-4">
        {metrics.map((metric, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span>{metric.label}</span>
              <span className="font-medium">{metric.value}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  i === 0 ? "bg-primary" : i === 1 ? "bg-accent" : "bg-green-500"
                )}
                style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Get available visuals based on profile and template
const getAvailableVisuals = (profileType: UserProfileType, templateType: string): VisualType[] => {
  if (profileType === 'student') {
    switch (templateType) {
      case 'microsoft': return ['conceptMap', 'radar', 'progress', 'insights'];
      case 'confluence': return ['learningFlow', 'timeline', 'progress'];
      case 'custom': return ['insights', 'radar'];
      case 'salesforce': return ['sourceChart', 'timeline'];
      default: return ['timeline', 'progress'];
    }
  }
  if (profileType === 'researcher') {
    switch (templateType) {
      case 'microsoft': return ['researchFlow', 'sourceChart', 'progress', 'insights'];
      case 'confluence': return ['sourceChart', 'timeline', 'conceptMap'];
      case 'salesforce': return ['researchFlow', 'radar', 'progress'];
      case 'custom': return ['sourceChart', 'progress'];
      default: return ['timeline', 'progress'];
    }
  }
  if (profileType === 'custom') {
    return ['timeline', 'progress'];
  }
  return [];
};

// Main export component
export const ArticleVisuals = ({ session, profileType, templateType }: ArticleVisualsProps) => {
  // Only show visuals for non-professional profiles
  if (profileType === 'support' || profileType === 'developer') {
    return null;
  }

  const availableVisuals = getAvailableVisuals(profileType, templateType);
  
  const {
    visuals,
    enabledVisuals,
    editableContent,
    isEditMode,
    setIsEditMode,
    toggleVisual,
    moveVisualUp,
    moveVisualDown,
    updateConceptMapTitle,
    updateConceptMapItem,
    updateFlowStep,
    updateInsightItem,
    updateResearchStage,
    initializeContent,
  } = useVisualCustomization(availableVisuals);

  // Initialize content from session
  useEffect(() => {
    const concepts = session.events
      .filter(e => e.content?.text || e.content?.highlights?.length)
      .slice(0, 6)
      .map(e => e.content?.highlights?.[0] || e.content?.text?.slice(0, 30) || e.title);

    const steps = session.events
      .filter(e => e.type === 'action')
      .slice(0, 5)
      .map(e => e.content?.text?.slice(0, 40) || e.title);

    const insights = session.events
      .flatMap(e => e.content?.highlights || [])
      .slice(0, 4);

    initializeContent({
      conceptMapTitle: session.name.split(' ').slice(0, 3).join(' '),
      conceptMapItems: concepts,
      flowSteps: steps.length > 2 ? steps : [
        'Understand the basics',
        'Study examples',
        'Practice problems',
        'Review & reflect',
        'Apply knowledge',
      ],
      insightItems: insights.length > 2 ? insights : [
        'Core principle understanding is essential',
        'Practical application reinforces theory',
        'Regular review improves retention',
        'Connecting concepts builds expertise',
      ],
    });
  }, [session, initializeContent]);

  const renderVisual = (visual: VisualConfig, index: number) => {
    const commonProps = {
      isEditMode,
      canMoveUp: index > 0,
      canMoveDown: index < enabledVisuals.length - 1,
      onMoveUp: () => moveVisualUp(visual.id),
      onMoveDown: () => moveVisualDown(visual.id),
    };

    switch (visual.id) {
      case 'conceptMap':
        return (
          <VisualWrapper key={visual.id} id={visual.id} label={visual.label} {...commonProps}>
            <ConceptMap 
              session={session} 
              isEditing={isEditMode}
              editableContent={editableContent}
              onUpdateTitle={updateConceptMapTitle}
              onUpdateItem={updateConceptMapItem}
            />
          </VisualWrapper>
        );
      case 'learningFlow':
        return (
          <VisualWrapper key={visual.id} id={visual.id} label={visual.label} {...commonProps}>
            <LearningFlowDiagram 
              session={session}
              isEditing={isEditMode}
              editableContent={editableContent}
              onUpdateStep={updateFlowStep}
            />
          </VisualWrapper>
        );
      case 'insights':
        return (
          <VisualWrapper key={visual.id} id={visual.id} label={visual.label} {...commonProps}>
            <InsightCards 
              session={session}
              isEditing={isEditMode}
              editableContent={editableContent}
              onUpdateItem={updateInsightItem}
            />
          </VisualWrapper>
        );
      case 'researchFlow':
        return (
          <VisualWrapper key={visual.id} id={visual.id} label={visual.label} {...commonProps}>
            <ResearchFlowchart 
              isEditing={isEditMode}
              editableContent={editableContent}
              onUpdateStage={updateResearchStage}
            />
          </VisualWrapper>
        );
      case 'sourceChart':
        return (
          <VisualWrapper key={visual.id} id={visual.id} label={visual.label} {...commonProps}>
            <SourceAnalysisChart session={session} />
          </VisualWrapper>
        );
      case 'timeline':
        return (
          <VisualWrapper key={visual.id} id={visual.id} label={visual.label} {...commonProps}>
            <ActivityTimelineChart session={session} />
          </VisualWrapper>
        );
      case 'radar':
        return (
          <VisualWrapper key={visual.id} id={visual.id} label={visual.label} {...commonProps}>
            <TopicMasteryRadar session={session} />
          </VisualWrapper>
        );
      case 'progress':
        return (
          <VisualWrapper key={visual.id} id={visual.id} label={visual.label} {...commonProps}>
            <ProgressVisualization session={session} />
          </VisualWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <span className="h-px w-8 bg-border" />
          <span>📊 Visual Summary</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Edit mode toggle */}
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="h-8"
          >
            {isEditMode ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Done
              </>
            ) : (
              <>
                <Pencil className="w-3 h-3 mr-1" />
                Edit
              </>
            )}
          </Button>

          {/* Visibility popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Settings2 className="w-3 h-3 mr-1" />
                Customize
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div className="font-medium text-sm">Toggle Visuals</div>
                <div className="space-y-3">
                  {visuals.map((visual) => (
                    <div key={visual.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {visual.enabled ? (
                          <Eye className="w-4 h-4 text-primary" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={cn(
                          "text-sm",
                          !visual.enabled && "text-muted-foreground"
                        )}>
                          {visual.label}
                        </span>
                      </div>
                      <Switch
                        checked={visual.enabled}
                        onCheckedChange={() => toggleVisual(visual.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Render enabled visuals */}
      <div className="space-y-4">
        {enabledVisuals.map((visual, index) => renderVisual(visual, index))}
      </div>

      {enabledVisuals.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">All visuals are hidden. Click Customize to enable them.</p>
        </div>
      )}
    </div>
  );
};
