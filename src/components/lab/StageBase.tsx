import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProductCategory } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { Card } from '../ui/Card';

interface StageBaseProps {
  selected: ProductCategory | null;
  onSelect: (category: ProductCategory) => void;
}

export function StageBase({ selected, onSelect }: StageBaseProps) {
  return (
    <div>
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sage">Stage 01</p>
        <h2 className="mt-2 text-4xl md:text-5xl font-heading text-charcoal">
          The <em className="text-gradient not-italic">Base</em>
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-stone">
          Choose the foundation of your concoction. Each category opens distinct
          formulation possibilities.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat, idx) => {
          const Icon = (Icons[cat.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Leaf;
          const isSelected = selected === cat.id;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <Card
                interactive
                selected={isSelected}
                onClick={() => onSelect(cat.id)}
                className="h-full"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? 'bg-sage text-bone' : 'bg-bone text-sage'
                    }`}
                  >
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-2xl text-charcoal leading-tight">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-sm text-stone leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
