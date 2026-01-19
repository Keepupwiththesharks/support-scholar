import { useState, useRef, useEffect } from 'react';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { Header } from '@/components/Header';
import { RecordingControls } from '@/components/RecordingControls';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { SessionCard } from '@/components/SessionCard';
import { ArticleGenerator } from '@/components/ArticleGenerator';
import { ProfileSelector } from '@/components/ProfileSelector';
import { ProductTour } from '@/components/ProductTour';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useRecording } from '@/hooks/useRecording';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useArticleLibrary } from '@/hooks/useArticleLibrary';
import { RecordingSession, UserProfileType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, History, FileText, Trash2, Sparkles, BookOpen, Zap, Shield, ArrowRight, Play, Users, Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Animation variants for scroll reveal
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax transforms for background elements
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
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
  const [showApp, setShowApp] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Check if user has seen the tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('recap-tour-completed');
    if (!hasSeenTour) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem('recap-tour-completed', 'true');
    setShowTour(false);
  };

  const handleTourSkip = () => {
    localStorage.setItem('recap-tour-completed', 'true');
    setShowTour(false);
  };

  const profileLabels: Record<UserProfileType | 'all', string> = {
    all: 'All Profiles',
    student: '📚 Student',
    developer: '💻 Developer',
    support: '🎧 Support',
    researcher: '🔬 Researcher',
    custom: '⚙️ Custom',
  };

  const features = [
    {
      icon: Zap,
      title: "Capture Everything",
      description: "Automatically record your workflow across apps and browsers. Never lose a valuable insight again.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: BookOpen,
      title: "Smart Recaps",
      description: "Transform your sessions into beautiful, structured notes tailored to your role and learning style.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays yours. Control exactly what gets captured with granular privacy settings.",
      color: "from-violet-500 to-purple-500"
    }
  ];

  const testimonials = [
    { name: "Sarah K.", role: "Graduate Student", quote: "Recap turned my chaotic research sessions into organized study guides!", avatar: "👩‍🎓" },
    { name: "Marcus T.", role: "Software Engineer", quote: "Finally, documentation that writes itself. Game changer for debugging.", avatar: "👨‍💻" },
    { name: "Priya M.", role: "Support Lead", quote: "Our team's knowledge base improved dramatically. Love the templates!", avatar: "👩‍💼" },
  ];

  if (showApp) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setShowApp(false)} className="gap-2 text-muted-foreground hover:text-foreground">
              ← Back to Home
            </Button>
          </div>
          
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
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Warm gradient background with parallax */}
      <div className="fixed inset-0 -z-10 overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 dark:from-amber-950/20 dark:via-background dark:to-rose-950/20" />
        <motion.div 
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-amber-200/30 to-orange-200/20 dark:from-amber-800/10 dark:to-orange-800/5 rounded-full blur-3xl"
          style={{ y: bgY1, scale: bgScale, opacity: bgOpacity }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-rose-200/30 to-pink-200/20 dark:from-rose-800/10 dark:to-pink-800/5 rounded-full blur-3xl"
          style={{ y: bgY2, scale: bgScale, opacity: bgOpacity }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-violet-200/10 to-purple-200/10 dark:from-violet-800/5 dark:to-purple-800/5 rounded-full blur-3xl"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 200]), opacity: bgOpacity }}
        />
      </div>

      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge className="mb-6 px-4 py-2 text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200 dark:border-amber-800">
            <Sparkles className="w-4 h-4 mr-2" />
            Your Personal Knowledge Companion
          </Badge>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Capture Ideas,
            </span>
            <br />
            <span className="text-foreground">Create Knowledge</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Recap automatically captures your workflow and transforms it into beautiful, 
            structured notes. Perfect for students, developers, and anyone who wants to 
            learn smarter, not harder.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 px-8 py-6 text-lg"
              onClick={() => setShowApp(true)}
            >
              <Play className="w-5 h-5" />
              Start Capturing
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 px-8 py-6 text-lg border-2"
            >
              Watch Demo
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Free to use
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              No account needed
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Privacy focused
            </div>
          </div>
        </motion.div>

        {/* App Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl border-2 border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-orange-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-rose-500/5" />
            <div className="p-1.5 bg-muted/50 border-b flex items-center gap-2">
              <div className="flex gap-1.5 ml-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-background/50 rounded-md text-xs text-muted-foreground">
                  recap.app
                </div>
              </div>
            </div>
            <div className="p-8 relative">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-800/30 dark:to-orange-800/30 rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-sm">Smart Insights</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-amber-200/50 dark:bg-amber-800/30 rounded w-full" />
                      <div className="h-2 bg-amber-200/50 dark:bg-amber-800/30 rounded w-4/5" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Recording...</span>
                      <span className="ml-auto text-xs text-emerald-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded" />
                      <div className="h-2 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-amber-500">12</p>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-orange-500">89</p>
                      <p className="text-xs text-muted-foreground">Events</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-rose-500">5</p>
                      <p className="text-xs text-muted-foreground">Articles</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-transparent via-muted/30 to-transparent overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Everything you need to <span className="text-amber-500">learn smarter</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Powerful features designed with simplicity in mind. No learning curve, just results.
            </motion.p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-2xl bg-card border shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <motion.div 
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div 
              className="flex items-center justify-center gap-1 mb-4"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, rotate: -30 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </motion.div>
              ))}
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by <span className="text-amber-500">learners everywhere</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands who've transformed how they capture and retain knowledge.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={index === 0 ? slideInLeft : index === 2 ? slideInRight : fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-2xl"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-12 mt-12"
          >
            <motion.div 
              variants={fadeInScale}
              className="flex items-center gap-3 text-foreground"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="w-6 h-6 text-amber-500" />
              <div className="text-left">
                <AnimatedCounter end={10000} suffix="+" className="text-2xl font-bold" />
                <p className="text-sm text-muted-foreground">Active users</p>
              </div>
            </motion.div>
            <motion.div 
              variants={fadeInScale}
              className="flex items-center gap-3 text-foreground"
              whileHover={{ scale: 1.05 }}
            >
              <FileText className="w-6 h-6 text-orange-500" />
              <div className="text-left">
                <AnimatedCounter end={50000} suffix="+" delay={0.2} className="text-2xl font-bold" />
                <p className="text-sm text-muted-foreground">Recaps created</p>
              </div>
            </motion.div>
            <motion.div 
              variants={fadeInScale}
              className="flex items-center gap-3 text-foreground"
              whileHover={{ scale: 1.05 }}
            >
              <Clock className="w-6 h-6 text-rose-500" />
              <div className="text-left">
                <AnimatedCounter end={100000} suffix="+" delay={0.4} className="text-2xl font-bold" />
                <p className="text-sm text-muted-foreground">Hours saved</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02 }}
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 shadow-2xl shadow-orange-500/25 relative overflow-hidden"
          >
            {/* Animated background circles */}
            <motion.div 
              className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
              animate={{ 
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"
              animate={{ 
                x: [0, -30, 0],
                y: [0, -40, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <div className="relative z-10">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Ready to transform how you learn?
              </motion.h2>
              <motion.p 
                className="text-lg text-white/80 mb-8 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Start capturing your workflow today. It's free, private, and takes just seconds to get started.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-orange-600 hover:bg-white/90 shadow-lg px-8 py-6 text-lg font-semibold"
                  onClick={() => setShowApp(true)}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="py-8 border-t"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Recap</span>
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ for curious minds everywhere
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              {['Privacy', 'Terms', 'Support'].map((link) => (
                <motion.a 
                  key={link}
                  href="#" 
                  className="hover:text-foreground transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Product Tour */}
      {showTour && (
        <ProductTour onComplete={handleTourComplete} onSkip={handleTourSkip} />
      )}
    </div>
  );
};

export default Index;
