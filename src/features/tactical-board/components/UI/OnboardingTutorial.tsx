// Onboarding Tutorial - Interactive walkthrough for new users
import { useState, useEffect, useCallback } from 'react'

interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'drag' | 'observe'
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Tactical Board!',
    description: 'Create professional soccer tactics, formations, and animated plays. Let\'s take a quick tour of the features.',
    position: 'center',
  },
  {
    id: 'toolbar',
    title: 'Main Toolbar',
    description: 'Use these tools to select, draw, and add elements to your tactical board. Hover over each tool to see its keyboard shortcut.',
    target: 'aside:first-of-type',
    position: 'right',
  },
  {
    id: 'players',
    title: 'Adding Players',
    description: 'Click the Home Player or Away Player tool, then click on the pitch to add players. You can drag them to reposition.',
    target: 'aside:first-of-type',
    position: 'right',
  },
  {
    id: 'drawing',
    title: 'Drawing Tools',
    description: 'Draw arrows, lines, and shapes to illustrate player movements and tactical instructions.',
    target: 'aside:first-of-type',
    position: 'right',
  },
  {
    id: 'sidebar',
    title: 'Formations & Templates',
    description: 'Quickly load preset formations or use set-piece templates from the sidebar.',
    target: 'aside:last-of-type',
    position: 'left',
  },
  {
    id: 'animation',
    title: 'Animation Timeline',
    description: 'Click "Show Timeline" to create animated sequences. Position players, add keyframes, and play back your tactical animations.',
    target: 'header button:nth-of-type(2)',
    position: 'bottom',
  },
  {
    id: 'save',
    title: 'Save & Export',
    description: 'Save your tactics locally, export as PNG images, or share via URL with your team.',
    target: 'header button:nth-of-type(3)',
    position: 'bottom',
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press "?" at any time to see all available keyboard shortcuts. Most tools have single-key shortcuts for quick access.',
    position: 'center',
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    description: 'Start creating your tactical masterpiece. You can always access help by pressing "?" or clicking the keyboard icon in the bottom left.',
    position: 'center',
  },
]

const STORAGE_KEY = 'tactical-board-onboarding-complete'

interface OnboardingTutorialProps {
  forceShow?: boolean
  onComplete?: () => void
}

export function OnboardingTutorial({ forceShow = false, onComplete }: OnboardingTutorialProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)

  // Check if user has completed onboarding
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed || forceShow) {
      setIsVisible(true)
    }
  }, [forceShow])

  // Update highlight position when step changes
  useEffect(() => {
    const step = TUTORIAL_STEPS[currentStep]
    if (step.target) {
      const element = document.querySelector(step.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        setHighlightRect(rect)
      } else {
        setHighlightRect(null)
      }
    } else {
      setHighlightRect(null)
    }
  }, [currentStep])

  const handleNext = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    handleComplete()
  }, [])

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsVisible(false)
    onComplete?.()
  }, [onComplete])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'Escape') {
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, handleNext, handlePrev, handleSkip])

  if (!isVisible) return null

  const step = TUTORIAL_STEPS[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === TUTORIAL_STEPS.length - 1

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (step.position === 'center' || !highlightRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const padding = 20

    switch (step.position) {
      case 'right':
        return {
          top: highlightRect.top + highlightRect.height / 2,
          left: highlightRect.right + padding,
          transform: 'translateY(-50%)',
        }
      case 'left':
        return {
          top: highlightRect.top + highlightRect.height / 2,
          right: window.innerWidth - highlightRect.left + padding,
          transform: 'translateY(-50%)',
        }
      case 'bottom':
        return {
          top: highlightRect.bottom + padding,
          left: highlightRect.left + highlightRect.width / 2,
          transform: 'translateX(-50%)',
        }
      case 'top':
        return {
          bottom: window.innerHeight - highlightRect.top + padding,
          left: highlightRect.left + highlightRect.width / 2,
          transform: 'translateX(-50%)',
        }
      default:
        return {}
    }
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Onboarding tutorial">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Highlight cutout */}
      {highlightRect && (
        <div
          className="absolute border-4 border-blue-500 rounded-lg pointer-events-none animate-pulse"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md z-10"
        style={getTooltipStyle()}
      >
        {/* Progress indicator */}
        <div className="flex gap-1 mb-4">
          {TUTORIAL_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${
                idx <= currentStep ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{step.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{step.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Skip tutorial
          </button>
          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div className="text-center text-xs text-gray-400 mt-4">
          Step {currentStep + 1} of {TUTORIAL_STEPS.length}
        </div>
      </div>
    </div>
  )
}

// Hook to reset onboarding (for settings/help)
export function useResetOnboarding() {
  return useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])
}

// Check if onboarding has been completed
export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}
