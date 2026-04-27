import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header, type View } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CreationLab } from './components/lab/CreationLab';
import { ConcoctCollective } from './components/collective/ConcoctCollective';

export default function App() {
  const [view, setView] = useState<View>('lab');

  return (
    <>
      <Header view={view} onChange={setView} />

      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          {view === 'lab' ? <CreationLab /> : <ConcoctCollective />}
        </motion.main>
      </AnimatePresence>

      <Footer />
    </>
  );
}
