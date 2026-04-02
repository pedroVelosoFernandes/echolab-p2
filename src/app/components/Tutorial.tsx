import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePopper } from 'react-popper';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export interface TutorialStep {
  title: string;
  description: string;
  targetSelector?: string; // CSS selector do elemento alvo
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightElement?: boolean;
}

interface TutorialProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
}

export function Tutorial({ steps, isOpen, onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    let element: Element | null = null;

    if (step.targetSelector) {
      element = document.querySelector(step.targetSelector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        if (step.highlightElement) {
          element.classList.add('tutorial-highlight');
        }
      }
    }

    const updateRect = () => {
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        }
      } else {
        setTargetRect(null);
      }
    };

    // Initial delay to allow scroll to complete
    const timeout = setTimeout(updateRect, 300);
    updateRect();
    
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      if (element && step.highlightElement) {
        element.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStep, steps, isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const virtualElement = useMemo(() => {
    if (!targetRect) return null;
    return {
      getBoundingClientRect: () => targetRect,
      clientWidth: targetRect.width,
      clientHeight: targetRect.height,
    };
  }, [targetRect]);

  const step = steps[currentStep] || steps[0];
  const { styles, attributes } = usePopper(virtualElement, popperElement, {
    placement: step.position || 'right',
    modifiers: [
      { name: 'offset', options: { offset: [0, 24] } },
      { name: 'preventOverflow', options: { padding: 24, boundary: 'clippingParents' } },
      { name: 'flip', options: { padding: 24, boundary: 'clippingParents' } },
    ],
  });

  if (!isOpen) return null;

  const isLastStep = currentStep === steps.length - 1;

  // Centro absoluto para passos sem elemento alvo (fallback)
  const defaultStyles = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'fixed' as const,
  };

  const appliedStyles = targetRect ? styles.popper : defaultStyles;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      <motion.div
        ref={setPopperElement}
        key="tutorial-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="fixed z-[60] bg-[#1a1a1a] border border-[#5e6ad2] rounded-xl shadow-2xl"
        style={{
          ...appliedStyles,
          maxWidth: '400px',
          width: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 60, // Ensure it's above the overlay
        }}
        {...(targetRect ? attributes.popper : {})}
      >
        <div className="p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{currentStep + 1}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors ml-3"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {step.description}
          </p>

          <div className="h-1 bg-[#242526] rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-[#5e6ad2]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-[#5e6ad2] hover:bg-[#6b76db] text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const TUTORIAL_SEQUENCE = [
  { key: 'synthesize', path: '/app/synthesize' },
  { key: 'voices', path: '/app/voices' },
  { key: 'presets', path: '/app/presets' },
  { key: 'message-packs', path: '/app/message-packs' },
  { key: 'live-announcements', path: '/app/live-announcements' },
  { key: 'scheduling', path: '/app/scheduling' },
  { key: 'receiver', path: '/app/receiver' },
  { key: 'settings', path: '/app/settings' },
];

export function useTutorial(storageKey: string) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we are currently running the tutorial sequence
    const seqIndexStr = localStorage.getItem('tutorial_sequence_index');
    if (seqIndexStr !== null) {
      const seqIndex = parseInt(seqIndexStr, 10);
      if (TUTORIAL_SEQUENCE[seqIndex]?.key === storageKey) {
        // Auto open if it's our turn in the sequence
        const timer = setTimeout(() => setIsOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [storageKey]);

  const handleClose = () => {
    localStorage.setItem(`tutorial_${storageKey}`, 'true');
    setIsOpen(false);

    // Handle sequence chaining
    const seqIndexStr = localStorage.getItem('tutorial_sequence_index');
    if (seqIndexStr !== null) {
      const seqIndex = parseInt(seqIndexStr, 10);
      if (TUTORIAL_SEQUENCE[seqIndex]?.key === storageKey) {
        const nextIndex = seqIndex + 1;
        if (nextIndex < TUTORIAL_SEQUENCE.length) {
          localStorage.setItem('tutorial_sequence_index', nextIndex.toString());
          navigate(TUTORIAL_SEQUENCE[nextIndex].path);
        } else {
          localStorage.removeItem('tutorial_sequence_index');
          navigate('/app');
          toast.success("Walkthrough completed!");
        }
      }
    }
  };

  const openTutorial = () => {
    setIsOpen(true);
  };

  return { isOpen, openTutorial, handleClose };
}