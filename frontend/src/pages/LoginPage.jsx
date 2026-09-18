import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, KeyRound, Wifi, Settings, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl } from '../services/apiConfig';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Server config modal state
  const [serverModal, setServerModal] = useState(false);
  const [inputApiUrl, setInputApiUrl] = useState(getApiBaseUrl());
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'ok' | 'fail'
  const [testMsg, setTestMsg] = useState('');

  // Forgot password modal state
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp + new pw
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { login, forgotPassword, verifyOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset code');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const verifyRes = await verifyOtp(forgotEmail, forgotOtp, 'FORGOT_PASSWORD');
      await resetPassword(forgotEmail, newPassword, verifyRes.verificationToken);
      setSuccessMsg('Password updated successfully. Please sign in with your new password.');
      setForgotModal(false);
      setForgotStep(1);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleTestServer = async () => {
    setTestStatus('testing');
    setTestMsg('Pinging server...');
    const start = Date.now();
    try {
      const res = await fetch(`${inputApiUrl.trim().replace(/\/+$/, '')}/api/config`);
      const latency = Date.now() - start;
      if (res.ok) {
        setTestStatus('ok');
        setTestMsg(`Connected successfully (${latency}ms)`);
      } else {
        setTestStatus('fail');
        setTestMsg(`Server returned HTTP ${res.status}`);
      }
    } catch (e) {
      setTestStatus('fail');
      setTestMsg(`Cannot reach backend: ${e.message}`);
    }
  };

  const handleApplyServer = () => {
    setApiBaseUrl(inputApiUrl);
    setServerModal(false);
    setSuccessMsg(`Server URL configured to ${getApiBaseUrl()}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleResetServer = () => {
    const d = resetApiBaseUrl();
    setInputApiUrl(d);
    setTestStatus(null);
    setTestMsg('');
  };

  return (
    <div className="min-h-screen bg-[#fcf8f8] flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 selection:bg-rose-100 selection:text-rose-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-200">
            <Shield className="w-7 h-7" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Sign In to SafeCircle
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-rose-600 uppercase tracking-widest">
          Privacy-First Personal Protection
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-stone-200/50 rounded-3xl border border-stone-200/80">

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setForgotModal(true); setForgotEmail(email); }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Sign-In Buttons */}
          <div className="mt-5 pt-4 border-t border-stone-100">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 text-center">
              Quick Hackathon Sign-In (1-Tap)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setEmail('user@safecircle.app'); setPassword('SafeUser123!'); }}
                className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-bold transition-all cursor-pointer text-center"
              >
                Person
              </button>
              <button
                type="button"
                onClick={() => { setEmail('mom@safecircle.app'); setPassword('MomSecure123!'); }}
                className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-bold transition-all cursor-pointer text-center"
              >
                Mom
              </button>
              <button
                type="button"
                onClick={() => { setEmail('dad@safecircle.app'); setPassword('DadSecure123!'); }}
                className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-bold transition-all cursor-pointer text-center"
              >
                Dad
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-4 pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-600">
              New to SafeCircle?{' '}
              <Link to="/register" className="font-bold text-rose-600 hover:text-rose-700 transition-colors">
                Create an account
              </Link>
            </p>
          </div>

        </div>

        {/* Server Connection Status & Config Button */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setInputApiUrl(getApiBaseUrl()); setServerModal(true); setTestStatus(null); setTestMsg(''); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-[11px] font-mono text-stone-600 shadow-2xs transition-colors cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5 text-rose-600" />
            <span>Backend: {getApiBaseUrl()}</span>
            <span className="text-[10px] text-rose-600 font-sans font-bold underline ml-1">Change</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="text-center pb-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Reset Password</h3>
              <p className="text-xs text-stone-500">
                {forgotStep === 1 ? 'Enter your email to receive a recovery code.' : 'Enter the code sent to your email.'}
              </p>
            </div>

            {forgotError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {forgotError}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetOtp} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900"
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  {forgotLoading ? 'Sending...' : 'Send Recovery Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="6-Digit Code"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-center tracking-widest font-mono font-bold text-sm"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min 6 chars)"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  {forgotLoading ? 'Updating...' : 'Set New Password'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => { setForgotModal(false); setForgotStep(1); }}
              className="w-full mt-3 py-2 text-stone-500 hover:text-stone-700 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Server Configuration Modal */}
      {serverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Backend Server URL</h3>
                <p className="text-[11px] text-stone-500">Configure phone to laptop connection</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Server URL (HTTP / WS)
              </label>
              <input
                type="url"
                value={inputApiUrl}
                onChange={(e) => setInputApiUrl(e.target.value)}
                placeholder="http://192.168.31.181:5000"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs text-stone-900"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Laptop Wi-Fi: <code className="text-stone-700">http://192.168.31.181:5000</code>
              </span>
            </div>

            {testStatus && (
              <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
                testStatus === 'ok' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : testStatus === 'testing' 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {testStatus === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : testStatus === 'testing' ? (
                  <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-tight font-medium text-[11px]">{testMsg}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestServer}
                disabled={testStatus === 'testing'}
                className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                {testStatus === 'testing' ? 'Pinging...' : 'Test'}
              </button>
              <button
                type="button"
                onClick={handleApplyServer}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Apply URL
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleResetServer}
                className="text-[11px] text-stone-500 hover:text-stone-700 underline cursor-pointer"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={() => setServerModal(false)}
                className="text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
