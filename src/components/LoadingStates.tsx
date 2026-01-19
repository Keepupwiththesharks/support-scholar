import { useState, useEffect } from 'react';
import { 
  Skeleton, 
  SkeletonSessionCard, 
  SkeletonArticleCard, 
  SkeletonStats, 
  SkeletonTimeline 
} from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
  minLoadTime?: number;
}

export const LoadingState = ({ 
  isLoading, 
  children, 
  skeleton,
  minLoadTime = 0 
}: LoadingStateProps) => {
  const [showLoading, setShowLoading] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
    } else if (minLoadTime > 0) {
      const timer = setTimeout(() => setShowLoading(false), minLoadTime);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading, minLoadTime]);

  return showLoading ? <>{skeleton}</> : <>{children}</>;
};

// Session list loading state
export const SessionListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonSessionCard key={i} />
    ))}
  </div>
);

// Article list loading state
export const ArticleListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonArticleCard key={i} />
    ))}
  </div>
);

// Recording panel loading state
export const RecordingPanelSkeleton = () => (
  <div className="bg-card border rounded-2xl p-8 space-y-6">
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-5 w-40" />
    </div>
    
    {/* Profile selector skeleton */}
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
    </div>

    <Skeleton className="h-px w-full" />

    {/* Recording controls skeleton */}
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

// Full page loading state
export const PageSkeleton = () => (
  <div className="min-h-screen bg-background">
    {/* Header skeleton */}
    <div className="border-b bg-card/50 h-16 flex items-center px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>

    {/* Content skeleton */}
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <RecordingPanelSkeleton />
        <div className="space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
          <SessionListSkeleton count={2} />
          <SkeletonStats />
        </div>
      </div>
    </div>
  </div>
);

// Demo component to showcase loading states
export const LoadingDemo = () => {
  const [isLoading, setIsLoading] = useState(true);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Loading States Demo</h2>
        <Button onClick={simulateLoading} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Reload
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-4">Session Cards</h3>
          <LoadingState
            isLoading={isLoading}
            skeleton={<SessionListSkeleton count={2} />}
          >
            <div className="text-muted-foreground text-center py-8">
              Content loaded!
            </div>
          </LoadingState>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Article Cards</h3>
          <LoadingState
            isLoading={isLoading}
            skeleton={<ArticleListSkeleton count={2} />}
          >
            <div className="text-muted-foreground text-center py-8">
              Content loaded!
            </div>
          </LoadingState>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Timeline</h3>
          <LoadingState
            isLoading={isLoading}
            skeleton={<SkeletonTimeline count={3} />}
          >
            <div className="text-muted-foreground text-center py-8">
              Content loaded!
            </div>
          </LoadingState>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Stats</h3>
          <LoadingState
            isLoading={isLoading}
            skeleton={<SkeletonStats />}
          >
            <div className="text-muted-foreground text-center py-8">
              Content loaded!
            </div>
          </LoadingState>
        </div>
      </div>
    </div>
  );
};
