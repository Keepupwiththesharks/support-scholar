import { useState } from 'react';
import { Header } from '@/components/Header';
import { RecordingControls } from '@/components/RecordingControls';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { SessionCard } from '@/components/SessionCard';
import { ArticleGenerator } from '@/components/ArticleGenerator';
import { ProfileSelector } from '@/components/ProfileSelector';
import { useRecording } from '@/hooks/useRecording';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useArticleLibrary } from '@/hooks/useArticleLibrary';
import { RecordingSession, UserProfileType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, History, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const {
    profileType,
    customPreferences,
    changeProfile,
    updateCustomPreferences,
  } = useUserProfile();

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
  } = useRecording({ profileType, customPreferences });

  const {
    articles,
    allArticles,
    filterProfile,
    setFilterProfile,
    saveArticle,
    deleteArticle,
  } = useArticleLibrary();

  const [selectedSession, setSelectedSession] = useState<RecordingSession | null>(null);

  const profileLabels: Record<UserProfileType | 'all', string> = {
    all: 'All Profiles',
    student: '📚 Student',
    developer: '💻 Developer',
    support: '🎧 Support',
    researcher: '🔬 Researcher',
    custom: '⚙️ Custom',
  };

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
              
              <ProfileSelector
                selectedProfile={profileType}
                onProfileChange={changeProfile}
                customPreferences={customPreferences}
                onPreferencesChange={updateCustomPreferences}
              />

              <div className="my-6 border-t" />
              
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

          {/* Right Panel - Sessions & Articles */}
          <div className="space-y-6">
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="sessions" className="gap-2">
                  <History className="w-4 h-4" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="articles" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Articles ({allArticles.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="mt-6">
                {sessions.length === 0 ? (
                  <div className="bg-card border rounded-2xl p-12 text-center">
                    <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium mb-2">No Sessions Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Start capturing to record your workflow.
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
                {allArticles.length === 0 ? (
                  <div className="bg-card border rounded-2xl p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium mb-2">Your Recaps</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Saved articles will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Select value={filterProfile} onValueChange={(v) => setFilterProfile(v as UserProfileType | 'all')}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(profileLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {articles.map(article => (
                      <div key={article.id} className="bg-card border rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{article.title}</h4>
                            <p className="text-sm text-muted-foreground">{article.templateLabel}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteArticle(article.id)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{article.summary}</p>
                        <div className="flex gap-1 flex-wrap">
                          {article.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">#{tag}</span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{article.createdAt.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

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
                <p className="text-3xl font-bold text-gradient">{allArticles.length}</p>
                <p className="text-sm text-muted-foreground">Articles</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedSession && (
        <ArticleGenerator
          session={selectedSession}
          profileType={profileType}
          onClose={() => setSelectedSession(null)}
          onSaveArticle={saveArticle}
        />
      )}
    </div>
  );
};

export default Index;
