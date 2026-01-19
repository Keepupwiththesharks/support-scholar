import { useState } from 'react';
import { Header } from '@/components/Header';
import { RecordingControls } from '@/components/RecordingControls';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { SessionCard } from '@/components/SessionCard';
import { ArticleGenerator } from '@/components/ArticleGenerator';
import { useRecording } from '@/hooks/useRecording';
import { RecordingSession } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, History, FileText } from 'lucide-react';

const Index = () => {
  const {
    status,
    currentSession,
    sessions,
    elapsedTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    addNote,
  } = useRecording();

  const [selectedSession, setSelectedSession] = useState<RecordingSession | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Recording Controls */}
          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Recording Session</h2>
              </div>
              
              <RecordingControls
                status={status}
                elapsedTime={elapsedTime}
                onStart={startRecording}
                onPause={pauseRecording}
                onResume={resumeRecording}
                onStop={stopRecording}
                onAddNote={addNote}
              />
            </div>

            {/* Activity Timeline */}
            {currentSession && (
              <div className="bg-card border rounded-2xl p-6 shadow-sm animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Live Activity</h3>
                  <span className="text-sm text-muted-foreground">
                    {currentSession.events.length} events
                  </span>
                </div>
                <ActivityTimeline events={currentSession.events} />
              </div>
            )}
          </div>

          {/* Right Panel - Sessions & History */}
          <div className="space-y-6">
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="sessions" className="gap-2">
                  <History className="w-4 h-4" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="articles" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Articles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="mt-6">
              {sessions.length === 0 ? (
                  <div className="bg-card border rounded-2xl p-12 text-center">
                    <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium mb-2">No Sessions Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Start capturing to record your workflow — studying, coding, researching, or anything else.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map(session => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onGenerateArticle={setSelectedSession}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="articles" className="mt-6">
                <div className="bg-card border rounded-2xl p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium mb-2">Your Recaps</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Summaries and notes generated from your sessions will appear here — perfect for study guides, documentation, or sharing.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-gradient">{sessions.length}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-gradient">
                  {sessions.reduce((acc, s) => acc + s.events.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Events</p>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-gradient">0</p>
                <p className="text-sm text-muted-foreground">Articles</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Article Generator Modal */}
      {selectedSession && (
        <ArticleGenerator
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

export default Index;
