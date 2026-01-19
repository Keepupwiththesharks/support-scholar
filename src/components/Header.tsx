import { Sparkles, Settings, HelpCircle, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Recap</h1>
            <p className="text-xs text-muted-foreground">Capture • Learn • Share</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:flex gap-1.5 py-1.5 px-3">
            <Puzzle className="w-3.5 h-3.5" />
            Extension Ready
          </Badge>
          <Button variant="ghost" size="icon">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
