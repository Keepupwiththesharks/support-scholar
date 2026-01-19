import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Zap, BookOpen, Shield, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  highlight?: string;
  position: 'center' | 'top' | 'bottom';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Recap! 👋',
    description: 'Your personal knowledge companion that captures your workflow and transforms it into beautiful, structured notes.',
    icon: Sparkles,
    position: 'center'
  },
  {
    id: 'capture',
    title: 'Capture Everything',
    description: 'Start a recording session to automatically capture your browsing activity, code changes, and research across tabs.',
    icon: Zap,
    position: 'center'
  },
  {
    id: 'smart-recaps',
    title: 'Smart Recaps',
    description: 'When you\'re done, Recap generates intelligent summaries tailored to your role - whether you\'re a student, developer, or researcher.',
    icon: BookOpen,
    position: 'center'
  },
  {
    id: 'privacy',
    title: 'Privacy First',
    description: 'Your data stays private. Control exactly what gets captured and keep everything local if you prefer.',
    icon: Shield,
    position: 'center'
  },
  {
    id: 'get-started',
    title: 'Ready to Start?',
    description: 'Click "Start Capturing" to begin your first session. You can always revisit this tour from the help menu.',
    icon: Play,
    position: 'center'
  }
];

interface ProductTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const ProductTour = ({ onComplete, onSkip }: ProductTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="bg-card border-2 border-border rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto overflow-hidden">
              {/* Header gradient */}
              <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
              
              {/* Content */}
              <div className="p-6">
                {/* Close button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Icon */}
                <motion.div
                  key={step.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25"
                >
                  <StepIcon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Text content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="text-center"
                  >
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  {tourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStep 
                          ? 'w-6 bg-gradient-to-r from-amber-500 to-orange-500' 
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={isFirstStep}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-muted-foreground"
                  >
                    Skip tour
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    {isLastStep ? "Get Started" : "Next"}
                    {!isLastStep && <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
