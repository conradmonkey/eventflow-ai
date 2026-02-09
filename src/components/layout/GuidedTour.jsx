import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: 'Upload Background Image',
    description: 'Start by uploading a site map or aerial view of your event location. This helps you plan the layout accurately.',
    target: 'upload-btn',
    position: 'bottom'
  },
  {
    title: 'Set Scale',
    description: 'Define the scale by specifying how many feet equal one inch on your screen. This ensures accurate sizing.',
    target: 'scale-input',
    position: 'bottom'
  },
  {
    title: 'Add Items',
    description: 'Select the equipment you need (tents, stages, facilities) and click "Add Items" to place them on your layout.',
    target: 'add-items-section',
    position: 'left'
  },
  {
    title: 'Export & Save',
    description: 'When finished, click "Save & Export" to generate a PDF with your layout and equipment list.',
    target: 'export-btn',
    position: 'bottom'
  }
];

export default function GuidedTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightPos, setHighlightPos] = useState(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('outdoor-planner-tour-seen');
    if (!hasSeenTour) {
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      updateHighlight();
    }
  }, [currentStep, isVisible]);

  const updateHighlight = () => {
    const targetId = TOUR_STEPS[currentStep].target;
    const element = document.getElementById(targetId);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPos({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('outdoor-planner-tour-seen', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={handleComplete} />
      
      {/* Highlight */}
      {highlightPos && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-300"
          style={{
            top: `${highlightPos.top - 8}px`,
            left: `${highlightPos.left - 8}px`,
            width: `${highlightPos.width + 16}px`,
            height: `${highlightPos.height + 16}px`,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '8px'
          }}
        />
      )}

      {/* Tour Card */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl p-6 max-w-md animate-in fade-in slide-in-from-bottom-4"
        style={{
          top: highlightPos && step.position === 'bottom' ? `${highlightPos.top + highlightPos.height + 20}px` : undefined,
          left: highlightPos && step.position === 'bottom' ? `${highlightPos.left}px` : undefined,
          right: highlightPos && step.position === 'left' ? '20px' : undefined,
          top: highlightPos && step.position === 'left' ? `${highlightPos.top}px` : undefined,
          bottom: !highlightPos ? '80px' : undefined,
          left: !highlightPos ? '50%' : undefined,
          transform: !highlightPos ? 'translateX(-50%)' : undefined
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </p>
          </div>
          <button
            onClick={handleComplete}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">{step.description}</p>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious} size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} size="sm" className="bg-blue-600 hover:bg-blue-700">
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              {currentStep < TOUR_STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}