import { useState } from 'react';
import { ExtensionPopup, FloatingWidget, ExtensionSettings } from '@/components/extension';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Chrome, Puzzle } from 'lucide-react';
import { Link } from 'react-router-dom';

type View = 'popup' | 'settings' | 'widget';

const ExtensionDemo = () => {
  const [currentView, setCurrentView] = useState<View>('popup');
  const [showWidget, setShowWidget] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Puzzle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Browser Extension UI</h1>
                  <p className="text-sm text-muted-foreground">Design preview for Recap extension</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Chrome className="w-4 h-4" />
                Add to Chrome
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* View Selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant={currentView === 'popup' ? 'default' : 'outline'}
            onClick={() => setCurrentView('popup')}
          >
            Extension Popup
          </Button>
          <Button
            variant={currentView === 'settings' ? 'default' : 'outline'}
            onClick={() => setCurrentView('settings')}
          >
            Settings Panel
          </Button>
          <Button
            variant={currentView === 'widget' ? 'default' : 'outline'}
            onClick={() => {
              setCurrentView('widget');
              setShowWidget(true);
            }}
          >
            Floating Widget
          </Button>
        </div>

        {/* Browser mockup */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border-2 border-border bg-card shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="bg-muted/50 border-b px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                {/* Address bar */}
                <div className="flex-1 max-w-xl mx-auto">
                  <div className="bg-background rounded-lg px-4 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>react.dev/learn/hooks</span>
                  </div>
                </div>
                {/* Extension icon */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    title="Recap Extension"
                  >
                    <span className="text-primary-foreground text-sm">⚡</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Browser content */}
            <div className="relative min-h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
              {/* Simulated page content */}
              <div className="max-w-2xl opacity-30">
                <div className="h-8 bg-foreground/20 rounded w-3/4 mb-4" />
                <div className="h-4 bg-foreground/10 rounded w-full mb-2" />
                <div className="h-4 bg-foreground/10 rounded w-5/6 mb-2" />
                <div className="h-4 bg-foreground/10 rounded w-4/6 mb-6" />
                <div className="h-32 bg-foreground/5 rounded mb-6" />
                <div className="h-4 bg-foreground/10 rounded w-full mb-2" />
                <div className="h-4 bg-foreground/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-foreground/10 rounded w-5/6 mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-foreground/5 rounded" />
                  <div className="h-24 bg-foreground/5 rounded" />
                </div>
              </div>

              {/* Extension UI overlay */}
              {currentView === 'popup' && (
                <div className="absolute top-4 right-4 animate-fade-in">
                  <ExtensionPopup 
                    onOpenSettings={() => setCurrentView('settings')}
                    onOpenDashboard={() => {}}
                  />
                </div>
              )}

              {currentView === 'settings' && (
                <div className="absolute top-4 right-4 animate-fade-in">
                  <ExtensionSettings onBack={() => setCurrentView('popup')} />
                </div>
              )}

              {currentView === 'widget' && showWidget && (
                <FloatingWidget 
                  position="bottom-right"
                  onClose={() => setShowWidget(false)}
                  onOpenPopup={() => setCurrentView('popup')}
                />
              )}
            </div>
          </div>
        </div>

        {/* Features description */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-3 gap-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold mb-2">Smart Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Automatically captures tab switches, clipboard actions, and page content as you browse.
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              Exclude sensitive sites, encrypt data end-to-end, and keep everything local if you prefer.
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold mb-2">Minimal Footprint</h3>
            <p className="text-sm text-muted-foreground">
              Lightweight floating widget stays out of your way while capturing everything important.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionDemo;
