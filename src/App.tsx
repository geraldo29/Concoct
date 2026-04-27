import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header, type View } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CreationLab } from './components/lab/CreationLab';
import { ConcoctCollective } from './components/collective/ConcoctCollective';
import { TestimonialsStrip } from './components/collective/TestimonialsStrip';
import { Archive } from './components/archive/Archive';
import { SignInModal } from './components/auth/SignInModal';

export default function App() {
  const [view, setView] = useState<View>('lab');
  const [signInOpen, setSignInOpen] = useState(false);

  const openSignIn = () => setSignInOpen(true);
  const closeSignIn = () => setSignInOpen(false);

  return (
    <>
      <Header view={view} onChange={setView} onSignInClick={openSignIn} />

      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {view === 'lab' && <CreationLab onSignInClick={openSignIn} />}
          {view === 'collective' && <ConcoctCollective />}
          {view === 'archive' && <Archive onSignInClick={openSignIn} />}
          {view === 'impact' && (
            <ComingSoon
              title="Impact Report"
              subtitle="Sustainability metrics, sourcing transparency, and your personal CO₂ ledger."
            />
          )}
        </motion.main>
      </AnimatePresence>

      {view === 'lab' && <TestimonialsStrip />}

      <Footer />

      <SignInModal open={signInOpen} onClose={closeSignIn} />
    </>
  );
}

function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-sage">Coming soon</p>
      <h2 className="font-heading text-5xl text-charcoal">{title}</h2>
      <p className="text-stone leading-relaxed">{subtitle}</p>
    </div>
  );
}
