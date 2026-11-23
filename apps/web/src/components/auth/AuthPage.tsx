import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export function AuthPage() {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        if (!fullName.trim() || fullName.trim().length < 2) {
          setError('Full name must be at least 2 characters long');
          setIsSubmitting(false);
          return;
        }
        const res = await register({ email, password, fullName });
        if (!res.success) {
          setError(res.error || 'Registration failed');
        }
      } else {
        const res = await login({ email, password });
        if (!res.success) {
          setError(res.error || 'Login failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo.owner@business.local');
    setPassword('Password123!');
    setFullName('Alex Morgan (Demo)');
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-slate-900 px-4 py-8 relative overflow-hidden">
      {/* Background Subtle Gradient & Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/20 mb-3">
          AI
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          AI Business Manager
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Universal business operations platform tailored for SMEs. Strict multi-tenancy & role-based access.
        </p>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md border-slate-800 bg-slate-950 text-slate-100 shadow-2xl relative z-10">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            {isRegisterMode ? 'Create your account' : 'Sign in to workspace'}
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            {isRegisterMode
              ? 'Register with your credentials to initialize your business organization.'
              : 'Enter your credentials to access your authorized organizations.'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Password</label>
                {isRegisterMode && (
                  <span className="text-[10px] text-slate-500">Min. 8 characters</span>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-10 shadow-md shadow-blue-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isRegisterMode ? 'Creating account...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Create Account & Workspace' : 'Sign In'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex flex-col gap-3 pt-0 border-t border-slate-900 mt-2">
          <div className="flex items-center justify-between w-full pt-4 text-xs">
            <span className="text-slate-400">
              {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
              }}
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors focus:outline-none cursor-pointer"
            >
              {isRegisterMode ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div className="w-full pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span>Phase 2 RBAC Secured</span>
            </span>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Fill Sample Credentials
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
