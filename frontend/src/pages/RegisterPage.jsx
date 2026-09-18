import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, User, ArrowRight, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP verification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const { register, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  // Step 1: Send OTP
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(email, 'REGISTER');
      setSuccessMsg(`Verification code sent to ${email}`);
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await verifyOtp(email, otp, 'REGISTER');
      
      // 2. Complete Account Registration
      await register(name, email, password, verifyRes.verificationToken);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Verification or registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await sendOtp(email, 'REGISTER');
      setSuccessMsg('A fresh verification code has been dispatched.');
      setCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
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
          Create Your SafeCircle
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

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harshika Rao"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm text-stone-900 placeholder:text-stone-400"
                  />
                </div>
              </div>

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
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm text-stone-900 placeholder:text-stone-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Sending Code...' : 'Continue with Email OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit Email OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center pb-2">
                <p className="text-xs text-stone-600">
                  We sent a 6-digit security code to:
                </p>
                <p className="text-sm font-bold text-stone-900">{email}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3 px-4 text-center tracking-[0.5em] text-2xl font-mono font-black rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-900"
                />
                <p className="text-[11px] text-stone-400 text-center mt-1">
                  Code expires in 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying & Creating...' : 'Verify Code & Create Account'}</span>
                <CheckCircle className="w-4 h-4" />
              </button>

              {/* Resend & Change Email Controls */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-stone-500 hover:text-stone-800 font-semibold"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={handleResend}
                  className="text-rose-600 hover:text-rose-700 font-bold disabled:text-stone-400 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-rose-600 hover:text-rose-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
