import { ActivityEvent, RecordingSession, UserProfileType } from '@/types';

// Pattern recognition for event categorization
interface EventPattern {
  category: 'learning' | 'coding' | 'research' | 'communication' | 'debugging' | 'documentation';
  weight: number;
  keywords: string[];
}

const EVENT_PATTERNS: EventPattern[] = [
  { category: 'learning', weight: 1.2, keywords: ['tutorial', 'course', 'lesson', 'learn', 'study', 'education', 'youtube', 'udemy'] },
  { category: 'coding', weight: 1.5, keywords: ['code', 'function', 'component', 'api', 'github', 'vscode', 'debug', 'commit', 'pull request'] },
  { category: 'research', weight: 1.3, keywords: ['paper', 'article', 'study', 'analysis', 'data', 'findings', 'hypothesis', 'methodology'] },
  { category: 'communication', weight: 1.0, keywords: ['slack', 'email', 'message', 'chat', 'discussion', 'meeting', 'call'] },
  { category: 'debugging', weight: 1.4, keywords: ['error', 'bug', 'fix', 'issue', 'stack trace', 'console', 'log', 'exception'] },
  { category: 'documentation', weight: 1.1, keywords: ['docs', 'readme', 'wiki', 'guide', 'manual', 'reference', 'notion'] },
];

// Extract keywords from text
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'and', 'but', 'or', 'because', 'until', 'while', 'this', 'that', 'these', 'those', 'am', 'i', 'my', 'me', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them', 'what', 'which', 'who', 'whom']);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

// Get text content from event
function getEventTextContent(event: ActivityEvent): string {
  return event.content?.text || event.content?.summary || '';
}

// Get content length
function getEventContentLength(event: ActivityEvent): number {
  const text = getEventTextContent(event);
  const code = event.content?.code || '';
  return text.length + code.length;
}

// Calculate event importance score
function calculateEventImportance(event: ActivityEvent): number {
  let score = 1;
  
  // Boost for content presence
  const contentLength = getEventContentLength(event);
  if (contentLength > 0) {
    score += 0.5;
    if (contentLength > 100) score += 0.3;
  }
  
  // Boost for specific event types
  if (event.type === 'action') score += 0.4;
  if (event.type === 'note') score += 0.6;
  if (event.type === 'app') score += 0.3;
  
  // Boost for pattern matching
  const text = `${event.title} ${getEventTextContent(event)} ${event.source}`.toLowerCase();
  for (const pattern of EVENT_PATTERNS) {
    if (pattern.keywords.some(kw => text.includes(kw))) {
      score += pattern.weight * 0.2;
    }
  }
  
  return score;
}

// Group events by topic/source
function groupEventsByTopic(events: ActivityEvent[]): Map<string, ActivityEvent[]> {
  const groups = new Map<string, ActivityEvent[]>();
  
  for (const event of events) {
    const source = event.source.toLowerCase();
    if (!groups.has(source)) {
      groups.set(source, []);
    }
    groups.get(source)!.push(event);
  }
  
  return groups;
}

// Generate smart summary from events
function generateSmartSummary(events: ActivityEvent[], profileType: UserProfileType): string {
  const sortedEvents = [...events].sort((a, b) => calculateEventImportance(b) - calculateEventImportance(a));
  const topEvents = sortedEvents.slice(0, 5);
  const groups = groupEventsByTopic(events);
  
  const sourceList = Array.from(groups.keys()).slice(0, 4).join(', ');
  const eventTypes = new Set(events.map(e => e.type));
  
  const profileContexts: Record<UserProfileType, string> = {
    student: 'learning session',
    developer: 'development workflow',
    support: 'support case investigation',
    researcher: 'research exploration',
    custom: 'work session',
  };
  
  const context = profileContexts[profileType];
  const duration = events.length > 0 
    ? Math.round((new Date(events[events.length - 1].timestamp).getTime() - new Date(events[0].timestamp).getTime()) / 60000)
    : 0;
  
  return `This ${context} captured ${events.length} events across ${groups.size} sources (${sourceList}) over approximately ${duration} minutes. Key activities included ${Array.from(eventTypes).join(', ')} interactions, with notable focus on ${topEvents[0]?.title || 'various topics'}.`;
}

// Generate insights based on event patterns
function generateInsights(events: ActivityEvent[], profileType: UserProfileType): string[] {
  const insights: string[] = [];
  const groups = groupEventsByTopic(events);
  const allText = events.map(e => `${e.title} ${getEventTextContent(e)}`).join(' ');
  const keywords = extractKeywords(allText);
  
  // Frequency analysis
  const wordFreq = new Map<string, number>();
  keywords.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  const topWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  if (topWords.length > 0) {
    insights.push(`Primary focus areas: ${topWords.join(', ')}`);
  }
  
  // Pattern-specific insights
  const actionEvents = events.filter(e => e.type === 'action');
  if (actionEvents.length > 2) {
    insights.push(`Significant activity detected with ${actionEvents.length} action events`);
  }
  
  const noteEvents = events.filter(e => e.type === 'note');
  if (noteEvents.length > 0) {
    insights.push(`${noteEvents.length} manual notes captured during the session`);
  }
  
  // Source distribution insight
  const largestGroup = Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length)[0];
  if (largestGroup && largestGroup[1].length > events.length * 0.3) {
    insights.push(`Heavy focus on ${largestGroup[0]} (${Math.round(largestGroup[1].length / events.length * 100)}% of activity)`);
  }
  
  // Profile-specific insights
  if (profileType === 'developer' && events.some(e => e.source.toLowerCase().includes('github'))) {
    insights.push('GitHub collaboration detected - consider documenting code changes');
  }
  
  if (profileType === 'student') {
    const tabEvents = events.filter(e => e.type === 'tab');
    if (tabEvents.length > 3) {
      insights.push(`${tabEvents.length} resources browsed - great for comprehensive learning`);
    }
  }
  
  if (profileType === 'researcher') {
    const uniqueSources = new Set(events.map(e => e.source)).size;
    if (uniqueSources > 3) {
      insights.push(`Multi-source research approach with ${uniqueSources} different sources`);
    }
  }
  
  return insights.slice(0, 5);
}

// Generate key takeaways
function generateKeyTakeaways(events: ActivityEvent[], profileType: UserProfileType): string[] {
  const takeaways: string[] = [];
  const sortedEvents = [...events].sort((a, b) => calculateEventImportance(b) - calculateEventImportance(a));
  
  // Extract from high-importance events
  for (const event of sortedEvents.slice(0, 8)) {
    const textContent = getEventTextContent(event);
    if (textContent && textContent.length > 20) {
      // Extract first sentence or phrase
      const firstSentence = textContent.split(/[.!?]/)[0].trim();
      if (firstSentence.length > 10 && firstSentence.length < 150) {
        takeaways.push(firstSentence);
      }
    }
  }
  
  // Add synthesized takeaways based on patterns
  if (profileType === 'student') {
    takeaways.push('Review highlighted concepts within 24 hours for better retention');
    const tabEvents = events.filter(e => e.type === 'tab');
    if (tabEvents.length > 2) {
      takeaways.push('Consider creating flashcards from notes');
    }
  }
  
  if (profileType === 'developer') {
    if (events.some(e => e.source.toLowerCase().includes('stack'))) {
      takeaways.push('Document solutions found for future reference');
    }
    takeaways.push('Consider writing tests for any new functionality implemented');
  }
  
  if (profileType === 'support') {
    takeaways.push('Update knowledge base with resolution steps');
    takeaways.push('Tag common patterns for faster future resolution');
  }
  
  if (profileType === 'researcher') {
    takeaways.push('Cross-reference findings with primary sources');
    takeaways.push('Document methodology for reproducibility');
  }
  
  return takeaways.slice(0, 6);
}

// Generate action items
function generateActionItems(events: ActivityEvent[], profileType: UserProfileType): string[] {
  const actions: string[] = [];
  const groups = groupEventsByTopic(events);
  
  // Analyze incomplete patterns
  const hasCode = events.some(e => e.content?.code);
  const hasDocs = events.some(e => e.source.toLowerCase().includes('doc') || e.source.toLowerCase().includes('notion'));
  
  if (hasCode && !hasDocs && profileType === 'developer') {
    actions.push('📝 Document the code changes made during this session');
  }
  
  if (events.length > 10) {
    actions.push('🔍 Review and consolidate key findings');
  }
  
  // Profile-specific actions
  const profileActions: Record<UserProfileType, string[]> = {
    student: [
      '📚 Create study notes from highlighted content',
      '✅ Test understanding with practice questions',
      '🔄 Schedule review session in 2-3 days',
    ],
    developer: [
      '🧪 Write unit tests for new implementations',
      '📋 Update project documentation',
      '🔀 Create pull request with descriptive message',
    ],
    support: [
      '📊 Update ticket with resolution summary',
      '📖 Add solution to knowledge base',
      '🏷️ Tag case for future reference',
    ],
    researcher: [
      '📑 Organize sources with proper citations',
      '🔗 Cross-reference with existing literature',
      '📊 Create data visualization for findings',
    ],
    custom: [
      '📋 Organize notes by topic',
      '✅ Identify follow-up tasks',
      '📅 Schedule next session',
    ],
  };
  
  actions.push(...profileActions[profileType].slice(0, 2));
  
  return actions.slice(0, 5);
}

// Generate related topics for further exploration
function generateRelatedTopics(events: ActivityEvent[]): string[] {
  const allText = events.map(e => `${e.title} ${getEventTextContent(e)}`).join(' ');
  const keywords = extractKeywords(allText);
  
  const wordFreq = new Map<string, number>();
  keywords.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  const topKeywords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
  
  // Generate related topic suggestions
  const topics: string[] = [];
  
  if (topKeywords.includes('react') || topKeywords.includes('component')) {
    topics.push('React best practices and patterns');
  }
  if (topKeywords.includes('api') || topKeywords.includes('fetch')) {
    topics.push('API design and RESTful principles');
  }
  if (topKeywords.includes('test') || topKeywords.includes('testing')) {
    topics.push('Testing strategies and TDD');
  }
  if (topKeywords.includes('data') || topKeywords.includes('analysis')) {
    topics.push('Data analysis techniques');
  }
  if (topKeywords.includes('learn') || topKeywords.includes('study')) {
    topics.push('Effective learning strategies');
  }
  
  // Add generic related topics
  topics.push('Deep dive into primary concepts');
  topics.push('Practical applications and examples');
  
  return topics.slice(0, 4);
}

// Main content generation interface
export interface GeneratedContent {
  title: string;
  summary: string;
  insights: string[];
  keyTakeaways: string[];
  actionItems: string[];
  relatedTopics: string[];
  timeline: { time: string; event: string; importance: 'high' | 'medium' | 'low' }[];
  tags: string[];
  confidence: number; // 0-100 score indicating content quality
}

// Main generation function
export function generateSmartContent(
  session: RecordingSession,
  profileType: UserProfileType
): GeneratedContent {
  const events = session.events;
  
  if (events.length === 0) {
    return {
      title: 'Empty Session',
      summary: 'No events were captured in this session.',
      insights: [],
      keyTakeaways: [],
      actionItems: ['Start capturing activity to generate content'],
      relatedTopics: [],
      timeline: [],
      tags: [],
      confidence: 0,
    };
  }
  
  // Calculate confidence based on data quality
  const avgContentLength = events.reduce((sum, e) => sum + getEventContentLength(e), 0) / events.length;
  const uniqueSources = new Set(events.map(e => e.source)).size;
  const confidence = Math.min(100, Math.round(
    (events.length * 3) + 
    (avgContentLength * 0.1) + 
    (uniqueSources * 10)
  ));
  
  // Generate timeline with importance scoring
  const timeline = events.slice(-10).map(event => ({
    time: new Date(event.timestamp).toLocaleTimeString(),
    event: event.title,
    importance: calculateEventImportance(event) > 2 ? 'high' as const : 
                calculateEventImportance(event) > 1.5 ? 'medium' as const : 'low' as const,
  }));
  
  // Extract tags from content
  const allText = events.map(e => `${e.title} ${getEventTextContent(e)}`).join(' ');
  const keywords = extractKeywords(allText);
  const wordFreq = new Map<string, number>();
  keywords.forEach(word => wordFreq.set(word, (wordFreq.get(word) || 0) + 1));
  const tags = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
  
  // Generate title
  const sources = Array.from(new Set(events.map(e => e.source))).slice(0, 2);
  const profileLabels: Record<UserProfileType, string> = {
    student: 'Study Session',
    developer: 'Dev Log',
    support: 'Case Notes',
    researcher: 'Research Notes',
    custom: 'Session Notes',
  };
  const title = `${profileLabels[profileType]}: ${sources.join(' & ')} - ${new Date(session.startTime).toLocaleDateString()}`;
  
  return {
    title,
    summary: generateSmartSummary(events, profileType),
    insights: generateInsights(events, profileType),
    keyTakeaways: generateKeyTakeaways(events, profileType),
    actionItems: generateActionItems(events, profileType),
    relatedTopics: generateRelatedTopics(events),
    timeline,
    tags,
    confidence,
  };
}

// Export utility functions for testing
export { extractKeywords, calculateEventImportance, groupEventsByTopic };
