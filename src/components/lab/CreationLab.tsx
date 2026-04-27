import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRecipe } from '../../hooks/useRecipe';
import { Button } from '../ui/Button';
import { StepIndicator } from '../ui/StepIndicator';
import { StageBase } from './StageBase';
import { StageSoul } from './StageSoul';
import { StageElements } from './StageElements';
import { StageSynthesis } from './StageSynthesis';

export function CreationLab() {
  const r = useRecipe();
  const { state } = r;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <div className="sticky top-0 z-10 -mx-4 px-4 bg-bone/80 backdrop-blur-md md:-mx-8 md:px-8">
        <StepIndicator
          currentStage={state.currentStage}
          onStageClick={r.goToStage}
        />
      </div>

      <main className="mt-6 min-h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.section
            key={state.currentStage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {state.currentStage === 1 && (
              <StageBase
                selected={state.category}
                onSelect={(c) => {
                  r.setCategory(c);
                }}
              />
            )}
            {state.currentStage === 2 && (
              <StageSoul
                selected={state.vessel}
                ingredients={state.ingredients}
                onSelect={r.setVessel}
              />
            )}
            {state.currentStage === 3 && (
              <StageElements
                vessel={state.vessel}
                selected={state.ingredients}
                onAdd={r.addIngredient}
                onRemove={r.removeIngredient}
              />
            )}
            {state.currentStage === 4 && (
              <StageSynthesis
                category={state.category}
                vessel={state.vessel}
                ingredients={state.ingredients}
                result={state.aiResult}
                isAnalyzing={state.isAnalyzing}
                onAnalyze={r.setAiResult}
                onSetAnalyzing={r.setAnalyzing}
                onReset={r.reset}
              />
            )}
          </motion.section>
        </AnimatePresence>
      </main>

      {state.currentStage < 4 && (
        <footer className="mt-12 flex items-center justify-between border-t border-stone-light/30 pt-6">
          <Button
            variant="ghost"
            onClick={r.prevStage}
            disabled={state.currentStage === 1}
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <p className="hidden md:block text-sm italic text-stone">
            {r.canAdvance ? 'Ready to proceed' : 'Make a selection to continue'}
          </p>
          <Button onClick={r.nextStage} disabled={!r.canAdvance}>
            {state.currentStage === 3 ? 'Synthesize' : 'Continue'} <ArrowRight size={16} />
          </Button>
        </footer>
      )}
    </div>
  );
}
