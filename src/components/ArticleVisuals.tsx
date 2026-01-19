import { RecordingSession, UserProfileType } from '@/types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowDown, CheckCircle2, Circle, Lightbulb, Target, BookOpen, Brain, Zap } from 'lucide-react';

interface ArticleVisualsProps {
  session: RecordingSession;
  profileType: UserProfileType;
  templateType: string;
}

// Color palette using semantic tokens converted to HSL values
const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))',
  'hsl(210, 100%, 50%)',
  'hsl(280, 70%, 60%)',
  'hsl(160, 60%, 45%)',
];

// Generate activity distribution data from session
const getActivityDistribution = (session: RecordingSession) => {
  const sources = session.events.reduce((acc, event) => {
    acc[event.source] = (acc[event.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(sources).map(([name, value]) => ({ name, value }));
};

// Generate timeline data from session
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

// Generate topic breakdown for students
const getTopicBreakdown = (session: RecordingSession) => {
  const topics = session.events
    .filter(e => e.content?.text)
    .slice(0, 5)
    .map((e, i) => ({
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

// Concept Map Component for Students
const ConceptMap = ({ session }: { session: RecordingSession }) => {
  const concepts = session.events
    .filter(e => e.content?.text || e.content?.highlights?.length)
    .slice(0, 6)
    .map(e => e.content?.highlights?.[0] || e.content?.text?.slice(0, 30) || e.title);

  const mainTopic = session.name.split(' ').slice(0, 3).join(' ');

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/20">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4" />
        Concept Map
      </h4>
      <div className="relative">
        {/* Central concept */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium text-sm shadow-lg">
            {mainTopic}
          </div>
        </div>
        
        {/* Connecting lines and sub-concepts */}
        <div className="grid grid-cols-3 gap-3">
          {concepts.map((concept, i) => (
            <div key={i} className="relative">
              <div className="absolute top-0 left-1/2 w-px h-3 bg-primary/30 -translate-x-1/2 -translate-y-full" />
              <div className={cn(
                "bg-card border rounded-lg p-3 text-center text-xs shadow-sm hover:shadow-md transition-shadow",
                i % 2 === 0 ? "border-primary/30" : "border-accent/30"
              )}>
                {concept}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Learning Flow Diagram for Students
const LearningFlowDiagram = ({ session }: { session: RecordingSession }) => {
  const steps = session.events
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
            <div className="bg-card border rounded-lg px-4 py-2 text-sm flex-1 shadow-sm">
              {step}
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

// Key Insights Cards for Students/Researchers
const InsightCards = ({ session }: { session: RecordingSession }) => {
  const insights = session.events
    .flatMap(e => e.content?.highlights || [])
    .slice(0, 4);

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
              "bg-purple-500/10 border-purple-500/30"
            )}
          >
            <Icon className={cn(
              "w-5 h-5 mb-2",
              i % 4 === 0 ? "text-yellow-600 dark:text-yellow-400" :
              i % 4 === 1 ? "text-blue-600 dark:text-blue-400" :
              i % 4 === 2 ? "text-green-600 dark:text-green-400" :
              "text-purple-600 dark:text-purple-400"
            )} />
            <p className="text-sm font-medium">{insight}</p>
          </div>
        );
      })}
    </div>
  );
};

// Research Process Flowchart
const ResearchFlowchart = ({ session }: { session: RecordingSession }) => {
  const stages = [
    { label: 'Question', icon: '❓', status: 'complete' },
    { label: 'Research', icon: '🔍', status: 'complete' },
    { label: 'Analyze', icon: '📊', status: 'current' },
    { label: 'Conclude', icon: '✅', status: 'pending' },
  ];

  return (
    <div className="bg-gradient-to-br from-accent/5 to-secondary/5 rounded-xl p-6 border">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Target className="w-4 h-4" />
        Research Progress
      </h4>
      <div className="flex items-center justify-between">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md",
                stage.status === 'complete' ? "bg-green-500/20 ring-2 ring-green-500" :
                stage.status === 'current' ? "bg-primary/20 ring-2 ring-primary animate-pulse" :
                "bg-muted"
              )}>
                {stage.icon}
              </div>
              <span className="text-xs mt-2 font-medium">{stage.label}</span>
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

// Source Analysis Chart for Researchers
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

// Topic Mastery Radar for Students
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

// Main export component
export const ArticleVisuals = ({ session, profileType, templateType }: ArticleVisualsProps) => {
  // Only show visuals for non-professional profiles
  if (profileType === 'support' || profileType === 'developer') {
    return null;
  }

  return (
    <div className="space-y-6 mb-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>📊 Visual Summary</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {profileType === 'student' && (
        <>
          {/* Study Guide visuals */}
          {templateType === 'microsoft' && (
            <div className="space-y-4">
              <ConceptMap session={session} />
              <div className="grid grid-cols-2 gap-4">
                <TopicMasteryRadar session={session} />
                <ProgressVisualization session={session} />
              </div>
              <InsightCards session={session} />
            </div>
          )}

          {/* Lecture Notes visuals */}
          {templateType === 'confluence' && (
            <div className="space-y-4">
              <LearningFlowDiagram session={session} />
              <div className="grid grid-cols-2 gap-4">
                <ActivityTimelineChart session={session} />
                <ProgressVisualization session={session} />
              </div>
            </div>
          )}

          {/* Flashcards visuals */}
          {templateType === 'custom' && (
            <div className="space-y-4">
              <InsightCards session={session} />
              <TopicMasteryRadar session={session} />
            </div>
          )}

          {/* Summary visuals */}
          {templateType === 'salesforce' && (
            <div className="grid grid-cols-2 gap-4">
              <SourceAnalysisChart session={session} />
              <ActivityTimelineChart session={session} />
            </div>
          )}
        </>
      )}

      {profileType === 'researcher' && (
        <>
          {/* Research Notes visuals */}
          {templateType === 'microsoft' && (
            <div className="space-y-4">
              <ResearchFlowchart session={session} />
              <div className="grid grid-cols-2 gap-4">
                <SourceAnalysisChart session={session} />
                <ProgressVisualization session={session} />
              </div>
              <InsightCards session={session} />
            </div>
          )}

          {/* Literature Review visuals */}
          {templateType === 'confluence' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SourceAnalysisChart session={session} />
                <ActivityTimelineChart session={session} />
              </div>
              <ConceptMap session={session} />
            </div>
          )}

          {/* Findings visuals */}
          {templateType === 'salesforce' && (
            <div className="space-y-4">
              <ResearchFlowchart session={session} />
              <div className="grid grid-cols-2 gap-4">
                <TopicMasteryRadar session={session} />
                <ProgressVisualization session={session} />
              </div>
            </div>
          )}

          {/* Bibliography visuals */}
          {templateType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <SourceAnalysisChart session={session} />
              <ProgressVisualization session={session} />
            </div>
          )}
        </>
      )}

      {profileType === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <ActivityTimelineChart session={session} />
          <ProgressVisualization session={session} />
        </div>
      )}
    </div>
  );
};
