import { useEffect, useRef, useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/helpers';

export function UserMenu() {
  const { user, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!user) return null;

  const label = user.displayName ?? user.email ?? user.username;
  const initial = (label ?? 'U').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-stone-light/40 bg-bone-light px-2 py-1 hover:bg-stone-light/20 min-h-[40px]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage text-bone text-sm font-medium">
          {initial}
        </span>
        <span className="hidden sm:inline pr-1 text-sm text-charcoal max-w-[120px] truncate">
          {label}
        </span>
      </button>

      <div
        className={cn(
          'absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-stone-light/30 bg-bone p-1 shadow-lg transition-all',
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
        )}
        role="menu"
      >
        <div className="border-b border-stone-light/20 px-3 py-2.5">
          <p className="flex items-center gap-2 text-sm text-charcoal truncate">
            <UserIcon size={14} className="text-stone shrink-0" />
            {user.displayName ?? 'Concocter'}
          </p>
          <p className="mt-0.5 text-xs text-stone-light truncate">
            {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            setOpen(false);
            await signOutUser();
          }}
          role="menuitem"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-charcoal hover:bg-stone-light/20"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}
