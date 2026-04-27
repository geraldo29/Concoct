import { FlaskConical, Leaf, Users } from 'lucide-react';
import { cn } from '../../utils/helpers';

export type View = 'lab' | 'collective';

interface HeaderProps {
  view: View;
  onChange: (v: View) => void;
}

export function Header({ view, onChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-light/20 bg-bone/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <button
          type="button"
          onClick={() => onChange('lab')}
          className="flex items-center gap-2 text-charcoal"
        >
          <Leaf size={22} className="text-sage" strokeWidth={1.5} />
          <span className="font-heading text-2xl tracking-tight">Concoct</span>
        </button>

        <nav className="flex items-center gap-1 rounded-full border border-stone-light/30 bg-bone-light p-1">
          <NavBtn
            active={view === 'lab'}
            onClick={() => onChange('lab')}
            icon={<FlaskConical size={14} />}
            label="The Lab"
          />
          <NavBtn
            active={view === 'collective'}
            onClick={() => onChange('collective')}
            icon={<Users size={14} />}
            label="Collective"
          />
        </nav>
      </div>
    </header>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[36px] items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-charcoal text-bone'
          : 'text-stone hover:bg-stone-light/20',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
