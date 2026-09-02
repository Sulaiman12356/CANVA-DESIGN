import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { adminApi, clearAdminToken } from '../../utils/adminApi';
import { AdminUser } from '../../types';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onNavigateHome: () => void;
}

type AuthViewMode = 'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>('LOGIN');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset Password (Token) State
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Check existing valid session or reset token when arriving at login screen
  useEffect(() => {
    // Check if there is a reset token in the URL query string
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setResetToken(token);
        setViewMode('RESET_PASSWORD');
        verifyToken(token);
        return;
      }
    }

    // Check if user already has a valid synchronized admin session token
    const existingToken = adminApi.getAdminToken();
    if (existingToken) {
      setIsLoading(true);
      adminApi.checkAuthSession().then((user) => {
        if (user) {
          onLoginSuccess(user);
        }
      }).catch(() => {
        clearAdminToken();
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [onLoginSuccess]);

  const verifyToken = async (token: string) => {
    setVerifyingToken(true);
    setErrorMessage(null);
    try {
      await adminApi.verifyResetToken(token);
      setTokenValid(true);
    } catch (err: any) {
      setTokenValid(false);
      setErrorMessage(err.message || 'The password reset link is invalid or has expired.');
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your administrator email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await adminApi.login(email.trim(), password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotSuccessMessage(null);

    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your authorized administrator Gmail address.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await adminApi.requestPasswordReset(forgotEmail.trim());
      setForgotSuccessMessage(
        res.message ||
          'If this email matches the authorized administrator account, a secure password reset link has been dispatched to your inbox.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset request failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetToken) {
      setErrorMessage('Missing password reset security token.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setResetLoading(true);

    try {
      await adminApi.resetPassword(resetToken, newPassword);
      setResetSuccess(true);
      // Clean query params from URL
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        const url = window.location.pathname;
        window.history.replaceState({}, document.title, url);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Clarity Digital Academy
        </h2>
        <p className="mt-1 text-sm text-slate-400 font-medium">
          Administrator Command & CRM Portal
        </p>
        <p className="text-xs text-blue-400 font-semibold mt-0.5">
          Confidential Access
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          
          {/* VIEW: LOGIN */}
          {viewMode === 'LOGIN' && (
            <>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  Administrator Sign In
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Restricted portal. Every access session requires authentication.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@clarity.edu"
                      autoComplete="username"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setForgotSuccessMessage(null);
                        setForgotEmail(email || '');
                        setViewMode('FORGOT_PASSWORD');
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>LOGIN</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {viewMode === 'FORGOT_PASSWORD' && (
            <>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-sky-400" />
                  Account Recovery
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your Admin Gmail address to receive a secure password reset link.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {forgotSuccessMessage ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Reset Link Dispatched</span>
                  </div>
                  <p className="leading-relaxed">
                    {forgotSuccessMessage}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Please check your Gmail inbox and spam folders. The security link will remain active for 60 minutes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Authorized Admin Gmail Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="ipesolasulaiman@gmail.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <span>Sending Reset Link...</span>
                    ) : (
                      <>
                        <span>Send Password Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setForgotSuccessMessage(null);
                    setViewMode('LOGIN');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </>
          )}

          {/* VIEW: RESET PASSWORD (FROM EMAIL TOKEN) */}
          {viewMode === 'RESET_PASSWORD' && (
            <>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  Set New Password
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create a new secure password for your administrator account.
                </p>
              </div>

              {verifyingToken && (
                <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Verifying security token...</span>
                </div>
              )}

              {!verifyingToken && tokenValid === false && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage || 'This password reset link has expired or already been used.'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('FORGOT_PASSWORD')}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Request a New Reset Link
                  </button>
                </div>
              )}

              {!verifyingToken && tokenValid === true && !resetSuccess && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      New Administrator Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? 'Updating Password...' : 'Save New Password & Continue'}
                  </button>
                </form>
              )}

              {resetSuccess && (
                <div className="space-y-4 text-center">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Your administrator password has been updated securely.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('LOGIN');
                      setResetSuccess(false);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Sign In with New Password
                  </button>
                </div>
              )}
            </>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Back to Student Landing Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
