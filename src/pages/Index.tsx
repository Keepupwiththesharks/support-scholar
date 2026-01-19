import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RecordingControls } from '@/components/RecordingControls';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { SessionCard } from '@/components/SessionCard';
import { ArticleGenerator } from '@/components/ArticleGenerator';
import { useRecording } from '@/hooks/useRecording';
import { useArticleLibrary } from '@/hooks/useArticleLibrary';
import { RecordingSession } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, History, FileText, Trash2, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    captureTab,
    captureCode,
    captureNote,
    captureMeeting,
    captureFromClipboard,
  } = useRecording();

  const {
    articles,
    allArticles,
    saveArticle,
    deleteArticle,
  } = useArticleLibrary();

  const [selectedSession, setSelectedSession] = useState<RecordingSession | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Navigation to Template Library */}
        <motion.div 
          className="mb-6 flex justify-end"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="outline" asChild className="gap-2">
            <Link to="/templates">
              <Layout className="w-4 h-4" />
              Template Library
            </Link>
          </Button>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Recording Controls */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
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
                onCaptureTab={captureTab}
                onCaptureCode={captureCode}
                onCaptureNote={captureNote}
                onCaptureMeeting={captureMeeting}
                onCaptureClipboard={async () => { await captureFromClipboard(); }}
              />
            </div>

            <AnimatePresence>
              {currentSession && (
                <motion.div 
                  className="bg-card border rounded-2xl p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Live Activity</h3>
                    <span className="text-sm text-muted-foreground">
                      {currentSession.events.length} events
                    </span>
                  </div>
                  <ActivityTimeline events={currentSession.events} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Panel - Sessions & Articles */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="sessions" className="gap-2">
                  <History className="w-4 h-4" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="articles" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Recaps ({allArticles.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="mt-6">
                {sessions.length === 0 ? (
                  <motion.div 
                    className="bg-card border rounded-2xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium mb-2">No Sessions Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Start recording to capture your workflow and generate recaps.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SessionCard
                          session={session}
                          onGenerateArticle={setSelectedSession}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="articles" className="mt-6">
                {allArticles.length === 0 ? (
                  <motion.div 
                    className="bg-card border rounded-2xl p-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium mb-2">Your Recaps</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Generate a recap from a session to see it here.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {articles.map((article, index) => (
                      <motion.div 
                        key={article.id} 
                        className="bg-card border rounded-xl p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <motion.div 
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-primary">{sessions.length}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-primary">
                  {sessions.reduce((acc, s) => acc + s.events.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Events</p>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-primary">{allArticles.length}</p>
                <p className="text-sm text-muted-foreground">Recaps</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {selectedSession && (
        <ArticleGenerator
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSaveArticle={saveArticle}
        />
      )}
    </div>
  );
};

export default Index;
