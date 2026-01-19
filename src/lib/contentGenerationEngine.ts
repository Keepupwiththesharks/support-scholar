import { ActivityEvent, RecordingSession } from '@/types';

// Extract keywords from text
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'this', 'that', 'these', 'those', 'and', 'but', 'or', 'i', 'my', 'me', 'we', 'our', 'you', 'your', 'it', 'they', 'them']);
  
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
  
  const contentLength = getEventContentLength(event);
  if (contentLength > 0) score += 0.5;
  if (contentLength > 100) score += 0.3;
  
  if (event.type === 'action') score += 0.4;
  if (event.type === 'note') score += 0.6;
  if (event.type === 'app') score += 0.3;
  
  return score;
}

// Group events by source
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

// Generate smart summary
function generateSmartSummary(events: ActivityEvent[]): string {
  const groups = groupEventsByTopic(events);
  const sourceList = Array.from(groups.keys()).slice(0, 4).join(', ');
  const eventTypes = new Set(events.map(e => e.type));
  const duration = events.length > 0 
    ? Math.round((new Date(events[events.length - 1].timestamp).getTime() - new Date(events[0].timestamp).getTime()) / 60000)
    : 0;
  
  return `Session captured ${events.length} events across ${groups.size} sources (${sourceList}) over approximately ${duration} minutes. Activities included ${Array.from(eventTypes).join(', ')} interactions.`;
}

// Generate insights
function generateInsights(events: ActivityEvent[]): string[] {
  const insights: string[] = [];
  const groups = groupEventsByTopic(events);
  const allText = events.map(e => `${e.title} ${getEventTextContent(e)}`).join(' ');
  const keywords = extractKeywords(allText);
  
  const wordFreq = new Map<string, number>();
  keywords.forEach(word => wordFreq.set(word, (wordFreq.get(word) || 0) + 1));
  
  const topWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  if (topWords.length > 0) {
    insights.push(`Primary focus areas: ${topWords.join(', ')}`);
  }
  
  const actionEvents = events.filter(e => e.type === 'action');
  if (actionEvents.length > 2) {
    insights.push(`Significant activity detected with ${actionEvents.length} action events`);
  }
  
  const noteEvents = events.filter(e => e.type === 'note');
  if (noteEvents.length > 0) {
    insights.push(`${noteEvents.length} manual notes captured during the session`);
  }
  
  const largestGroup = Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length)[0];
  if (largestGroup && largestGroup[1].length > events.length * 0.3) {
    insights.push(`Heavy focus on ${largestGroup[0]} (${Math.round(largestGroup[1].length / events.length * 100)}% of activity)`);
  }
  
  return insights.slice(0, 5);
}

// Generate key takeaways
function generateKeyTakeaways(events: ActivityEvent[]): string[] {
  const takeaways: string[] = [];
  const sortedEvents = [...events].sort((a, b) => calculateEventImportance(b) - calculateEventImportance(a));
  
  for (const event of sortedEvents.slice(0, 8)) {
    const textContent = getEventTextContent(event);
    if (textContent && textContent.length > 20) {
      const firstSentence = textContent.split(/[.!?]/)[0].trim();
      if (firstSentence.length > 10 && firstSentence.length < 150) {
        takeaways.push(firstSentence);
      }
    }
  }
  
  if (takeaways.length < 3) {
    takeaways.push('Review captured activities for key points');
    takeaways.push('Document solutions found for future reference');
  }
  
  return takeaways.slice(0, 6);
}

// Generate action items
function generateActionItems(events: ActivityEvent[]): string[] {
  const actions: string[] = [];
  
  if (events.length > 10) {
    actions.push('🔍 Review and consolidate key findings');
  }
  
  actions.push('📝 Document the key changes made during this session');
  actions.push('✅ Identify follow-up tasks');
  actions.push('📅 Schedule next session');
  
  return actions.slice(0, 5);
}

// Generate related topics
function generateRelatedTopics(events: ActivityEvent[]): string[] {
  const allText = events.map(e => `${e.title} ${getEventTextContent(e)}`).join(' ');
  const keywords = extractKeywords(allText);
  
  const wordFreq = new Map<string, number>();
  keywords.forEach(word => wordFreq.set(word, (wordFreq.get(word) || 0) + 1));
  
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([word]) => word);
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
  confidence: number;
}

// Main generation function
export function generateSmartContent(session: RecordingSession): GeneratedContent {
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
  
  const avgContentLength = events.reduce((sum, e) => sum + getEventContentLength(e), 0) / events.length;
  const uniqueSources = new Set(events.map(e => e.source)).size;
  const confidence = Math.min(100, Math.round(
    (events.length * 3) + 
    (avgContentLength * 0.1) + 
    (uniqueSources * 10)
  ));
  
  const timeline = events.slice(-10).map(event => ({
    time: new Date(event.timestamp).toLocaleTimeString(),
    event: event.title,
    importance: calculateEventImportance(event) > 2 ? 'high' as const : 
                calculateEventImportance(event) > 1.5 ? 'medium' as const : 'low' as const,
  }));
  
  const allText = events.map(e => `${e.title} ${getEventTextContent(e)}`).join(' ');
  const keywords = extractKeywords(allText);
  const wordFreq = new Map<string, number>();
  keywords.forEach(word => wordFreq.set(word, (wordFreq.get(word) || 0) + 1));
  const tags = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
  
  const sources = Array.from(new Set(events.map(e => e.source))).slice(0, 2);
  const title = `Session Notes: ${sources.join(' & ')} - ${new Date(session.startTime).toLocaleDateString()}`;
  
  return {
    title,
    summary: generateSmartSummary(events),
    insights: generateInsights(events),
    keyTakeaways: generateKeyTakeaways(events),
    actionItems: generateActionItems(events),
    relatedTopics: generateRelatedTopics(events),
    timeline,
    tags,
    confidence,
  };
}

export { extractKeywords, calculateEventImportance, groupEventsByTopic };
