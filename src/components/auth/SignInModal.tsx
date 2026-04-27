import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Loader2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { cn } from '../../utils/helpers';

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup' | 'confirm';

export function SignInModal({ open, onClose }: SignInModalProps) {
  const { signIn, signUp, confirmSignUp, resendCode, configured, error, clearError } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  function reset() {
    setEmail('');
    setPassword('');
    setName('');
    setCode('');
    setBusy(false);
    setInfo(null);
    clearError();
  }

  function close() {
    reset();
    setMode('signin');
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setInfo(null);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        // useAuth sets user; if no error, close
        if (!error) close();
      } else if (mode === 'signup') {
        const { needsConfirmation } = await signUp(email, password, name);
        if (needsConfirmation) {
          setInfo(`A verification code was sent to ${email}.`);
          setMode('confirm');
        }
      } else if (mode === 'confirm') {
        await confirmSignUp(email, code);
        await signIn(email, password);
        if (!error) close();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close sign in"
            onClick={close}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm cursor-default"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-3xl border border-stone-light/30 bg-bone p-8 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-full p-1.5 text-stone hover:bg-stone-light/20 hover:text-charcoal"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/15">
                <Leaf size={22} className="text-sage" strokeWidth={1.5} />
              </div>
              <h2 className="mt-4 font-heading text-3xl text-charcoal">
                {mode === 'signin' && (
                  <>Welcome to <em className="text-gradient not-italic">Concoct</em></>
                )}
                {mode === 'signup' && 'Create your account'}
                {mode === 'confirm' && 'Verify your email'}
              </h2>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                {mode === 'signin' && 'Sign in to save formulations and track your impact.'}
                {mode === 'signup' && 'Become a Concocter and craft your private archive.'}
                {mode === 'confirm' && `Enter the 6-digit code we just sent to ${email}.`}
              </p>
            </div>

            {/* Tab switch */}
            {mode !== 'confirm' && (
              <div className="mt-5 flex rounded-full border border-stone-light/40 bg-bone-light p-1">
                <TabButton active={mode === 'signin'} onClick={() => { reset(); setMode('signin'); }}>
                  Sign in
                </TabButton>
                <TabButton active={mode === 'signup'} onClick={() => { reset(); setMode('signup'); }}>
                  Sign up
                </TabButton>
              </div>
            )}

            {!configured ? (
              <div className="mt-5 rounded-xl border border-amber/30 bg-amber/5 p-4 text-sm text-charcoal">
                <p className="font-medium text-amber">AWS not configured</p>
                <p className="mt-1 text-xs text-stone leading-relaxed">
                  Run <code className="rounded bg-bone-light px-1 py-0.5 text-[11px]">cd infra && npm run deploy</code>,
                  then add the outputs to <code className="rounded bg-bone-light px-1 py-0.5 text-[11px]">.env.local</code> as
                  <code className="rounded bg-bone-light px-1 py-0.5 text-[11px]">VITE_AWS_*</code> vars. See <code className="rounded bg-bone-light px-1 py-0.5 text-[11px]">DEPLOY.md</code>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                {mode === 'signup' && (
                  <Field
                    label="Display name"
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="Sage Willowmere"
                    autoComplete="name"
                  />
                )}

                {mode !== 'confirm' && (
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                )}

                {mode !== 'confirm' && (
                  <Field
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="At least 8 characters"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    minLength={8}
                  />
                )}

                {mode === 'confirm' && (
                  <Field
                    label="Verification code"
                    type="text"
                    value={code}
                    onChange={setCode}
                    placeholder="123456"
                    autoComplete="one-time-code"
                    required
                    inputMode="numeric"
                  />
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={busy}
                  className="!w-full"
                >
                  {busy && <Loader2 size={16} className="animate-spin" />}
                  {mode === 'signin' && 'Sign in'}
                  {mode === 'signup' && 'Create account'}
                  {mode === 'confirm' && 'Verify & sign in'}
                </Button>

                {mode === 'confirm' && (
                  <button
                    type="button"
                    className="w-full text-xs text-stone hover:text-charcoal underline-offset-4 hover:underline"
                    onClick={() => resendCode(email)}
                  >
                    Resend code
                  </button>
                )}

                {info && (
                  <p className="text-xs text-sage-dark leading-relaxed">{info}</p>
                )}
                {error && (
                  <p className="text-xs text-danger leading-relaxed">{error}</p>
                )}
              </form>
            )}

            <p className="mt-6 text-center text-[11px] text-stone-light leading-relaxed">
              By continuing you agree to our terms — and to formulating responsibly.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Subcomponents ───

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 min-h-[36px] rounded-full text-sm font-medium transition-colors',
        active ? 'bg-charcoal text-bone' : 'text-stone hover:text-charcoal',
      )}
    >
      {children}
    </button>
  );
}

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'email';
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
  inputMode,
}: FieldProps) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-stone-light mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="w-full min-h-[44px] rounded-xl border border-stone-light/40 bg-bone-light px-4 py-2 text-sm text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/40"
      />
    </label>
  );
}
