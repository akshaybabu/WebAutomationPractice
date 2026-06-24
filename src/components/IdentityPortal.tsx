/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogEntry } from '../types';
import { Eye, EyeOff, Shield, ShieldCheck, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface IdentityPortalProps {
  onAddLog: (event: string, elementId: string, details: string) => void;
}

export default function IdentityPortal({ onAddLog }: IdentityPortalProps) {
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Sign-Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Password Security Strength Checklist
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(signupPassword);

  // Quick fill helper handlers
  const handleQuickFillLogin = (valid: boolean) => {
    if (valid) {
      setLoginEmail('qa_tester@practice.com');
      setLoginPassword('P@ssword123!');
      onAddLog('QUICK_FILL', 'login-quick-fill-valid', 'Filled valid credentials');
    } else {
      setLoginEmail('invalid-email-format');
      setLoginPassword('123');
      onAddLog('QUICK_FILL', 'login-quick-fill-invalid', 'Filled invalid credentials');
    }
    setLoginErrors({});
    setLoginSuccess(false);
  };

  const handleQuickFillSignup = () => {
    setSignupName('Alex QATester');
    setSignupEmail('alex.test@automation.org');
    setSignupPassword('SecuredPass99!');
    setSignupConfirmPassword('SecuredPass99!');
    onAddLog('QUICK_FILL', 'signup-quick-fill', 'Filled strong signup values');
    setSignupErrors({});
    setSignupSuccess(false);
  };

  // Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { email?: string; password?: string } = {};
    
    // Email regex validation
    if (!loginEmail) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      errors.email = 'Please provide a valid email format (e.g. user@domain.com)';
    }

    // Password validation
    if (!loginPassword) {
      errors.password = 'Password is required';
    } else if (loginPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setLoginErrors(errors);

    if (Object.keys(errors).length === 0) {
      setLoginSuccess(true);
      onAddLog('LOGIN_SUCCESS', 'login-submit-btn', `Successfully logged in with: ${loginEmail}`);
    } else {
      setLoginSuccess(false);
      onAddLog('LOGIN_ERROR', 'login-submit-btn', `Failed login validation. Errors: ${JSON.stringify(errors)}`);
    }
  };

  // Sign-Up Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!signupName.trim()) {
      errors.name = 'Full name is required';
    }

    if (!signupEmail) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(signupEmail)) {
      errors.email = 'Please provide a valid email format';
    }

    const pwdStrength = getPasswordStrength(signupPassword);
    if (!signupPassword) {
      errors.password = 'Password is required';
    } else if (pwdStrength.score < 4) {
      errors.password = 'Password must meet at least 4 security criteria (Medium/Strong strength)';
    }

    if (signupConfirmPassword !== signupPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setSignupErrors(errors);

    if (Object.keys(errors).length === 0) {
      setSignupSuccess(true);
      onAddLog('SIGNUP_SUCCESS', 'signup-submit-btn', `Successfully registered account: ${signupEmail}`);
    } else {
      setSignupSuccess(false);
      onAddLog('SIGNUP_ERROR', 'signup-submit-btn', `Failed sign-up validation. Errors: ${JSON.stringify(errors)}`);
    }
  };

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setLoginSuccess(false);
    setLoginErrors({});
    
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupSuccess(false);
    setSignupErrors({});
    onAddLog('FORM_RESET', 'reset-identity-btn', 'Cleared identity forms');
  };

  return (
    <div id="identity-portal-container" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 custom-shadow">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800" id="identity-title">
            Identity & Authorization Portal
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Test form inputs, password toggles, and multi-rule verification logic. Ideal for checking error messages, visual indicators, and visibility switches.
          </p>
        </div>
        <div>
          <button
            id="reset-identity-btn"
            onClick={resetForms}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer"
          >
            Clear Inputs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOGIN LAB */}
        <div id="login-lab-card" className="bg-white rounded-xl border border-slate-200 custom-shadow overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm" id="login-section-header">
                    Login Form Validation
                  </h3>
                  <p className="text-xs text-slate-400">Target IDs: login-email, login-password, login-submit-btn</p>
                </div>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono select-none">
                FORM_ID: #login-form
              </span>
            </div>

            {/* Automation helpers */}
            <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                Test Case Quick-Fills (Automation Helpers)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  id="btn-fill-valid-login"
                  onClick={() => handleQuickFillLogin(true)}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs transition-all font-medium"
                >
                  ✓ Fill Valid Credentials
                </button>
                <button
                  id="btn-fill-invalid-login"
                  onClick={() => handleQuickFillLogin(false)}
                  className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs transition-all font-medium"
                >
                  ✗ Fill Invalid Format
                </button>
              </div>
            </div>

            {/* Login Success Notification */}
            {loginSuccess && (
              <div id="login-success-banner" className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold" id="login-success-title">Login Validated Successfully!</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Automation Script Check: `login-success-banner` is visible.</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="login-email"
                    type="text"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      onAddLog('ON_CHANGE', 'login-email', `Email updated: ${e.target.value}`);
                    }}
                    placeholder="user@example.com"
                    className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      loginErrors.email 
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {loginErrors.email && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1" id="login-email-error">
                    <AlertCircle className="w-3 h-3" /> {loginErrors.email}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      onAddLog('ON_CHANGE', 'login-password', 'Password keystroke registered');
                    }}
                    placeholder="Enter account password"
                    className={`w-full bg-white border rounded-xl pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      loginErrors.password 
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    id="toggle-login-password-btn"
                    type="button"
                    onClick={() => {
                      setShowLoginPassword(!showLoginPassword);
                      onAddLog('TOGGLE_VISIBILITY', 'toggle-login-password-btn', `Password visibility: ${!showLoginPassword ? 'visible' : 'hidden'}`);
                    }}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1" id="login-password-error">
                    <AlertCircle className="w-3 h-3" /> {loginErrors.password}
                  </span>
                )}
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer duration-150"
              >
                Sign In
              </button>
            </form>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 p-4">
            <span className="text-[10px] text-slate-500 font-mono">
              QA TIPS: Automators should test both happy path and trigger field-level validation tags. Note how input fields fire `ON_CHANGE` logs in real time.
            </span>
          </div>
        </div>

        {/* SIGN-UP LAB */}
        <div id="signup-lab-card" className="bg-white rounded-xl border border-slate-200 custom-shadow overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm" id="signup-section-header">
                    Registration & Password Security Strength
                  </h3>
                  <p className="text-xs text-slate-400">Target IDs: signup-name, signup-email, signup-password, signup-submit-btn</p>
                </div>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono select-none">
                FORM_ID: #signup-form
              </span>
            </div>

            {/* Automation helpers */}
            <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                Test Case Quick-Fills (Automation Helpers)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  id="btn-fill-valid-signup"
                  onClick={handleQuickFillSignup}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs transition-all font-medium"
                >
                  ✓ Fill Strong Registry Profile
                </button>
              </div>
            </div>

            {/* Signup Success Notification */}
            {signupSuccess && (
              <div id="signup-success-banner" className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold" id="signup-success-title">Account Created Successfully!</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Automation Script Check: `signup-success-banner` is present.</p>
                </div>
              </div>
            )}

            {/* Signup Form */}
            <form id="signup-form" onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="signup-name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => {
                      setSignupName(e.target.value);
                      onAddLog('ON_CHANGE', 'signup-name', `Name updated: ${e.target.value}`);
                    }}
                    placeholder="First and last name"
                    className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      signupErrors.name 
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {signupErrors.name && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1" id="signup-name-error">
                    <AlertCircle className="w-3 h-3" /> {signupErrors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="signup-email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-email"
                    type="text"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      onAddLog('ON_CHANGE', 'signup-email', `Email updated: ${e.target.value}`);
                    }}
                    placeholder="user@example.com"
                    className={`w-full bg-white border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      signupErrors.email 
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {signupErrors.email && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1" id="signup-email-error">
                    <AlertCircle className="w-3 h-3" /> {signupErrors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700" htmlFor="signup-password">
                    Secure Password
                  </label>
                  {signupPassword && (
                    <span className={`text-[10px] font-bold uppercase ${strength.textColor}`} id="signup-strength-indicator-text">
                      Strength: {strength.label}
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      onAddLog('ON_CHANGE', 'signup-password', 'Registered registration password input');
                    }}
                    placeholder="Min 8 chars with mixed characters"
                    className={`w-full bg-white border rounded-xl pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      signupErrors.password 
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    id="toggle-signup-password-btn"
                    type="button"
                    onClick={() => {
                      setShowSignupPassword(!showSignupPassword);
                      onAddLog('TOGGLE_VISIBILITY', 'toggle-signup-password-btn', `Password visibility: ${!showSignupPassword ? 'visible' : 'hidden'}`);
                    }}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Progress Bar */}
                {signupPassword && (
                  <div className="mt-2" id="password-strength-bar-container">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        id="signup-password-strength-bar"
                        className={`h-full transition-all duration-300 ${strength.color}`} 
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    {/* Security Checklist */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-slate-500 font-mono" id="password-checklist">
                      <div id="chk-len" className={signupPassword.length >= 8 ? 'text-emerald-600 font-medium' : ''}>
                        {signupPassword.length >= 8 ? '✓' : '•'} At least 8 chars
                      </div>
                      <div id="chk-upper" className={/[A-Z]/.test(signupPassword) ? 'text-emerald-600 font-medium' : ''}>
                        {/[A-Z]/.test(signupPassword) ? '✓' : '•'} Uppercase (A-Z)
                      </div>
                      <div id="chk-lower" className={/[a-z]/.test(signupPassword) ? 'text-emerald-600 font-medium' : ''}>
                        {/[a-z]/.test(signupPassword) ? '✓' : '•'} Lowercase (a-z)
                      </div>
                      <div id="chk-digit" className={/[0-9]/.test(signupPassword) ? 'text-emerald-600 font-medium' : ''}>
                        {/[0-9]/.test(signupPassword) ? '✓' : '•'} Numbers (0-9)
                      </div>
                      <div id="chk-symbol" className={/[^A-Za-z0-9]/.test(signupPassword) ? 'text-emerald-600 font-medium' : ''}>
                        {/[^A-Za-z0-9]/.test(signupPassword) ? '✓' : '•'} Special Symbol
                      </div>
                    </div>
                  </div>
                )}
                
                {signupErrors.password && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1" id="signup-password-error">
                    <AlertCircle className="w-3 h-3" /> {signupErrors.password}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="signup-confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-confirm-password"
                    type={showSignupConfirmPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(e) => {
                      setSignupConfirmPassword(e.target.value);
                      onAddLog('ON_CHANGE', 'signup-confirm-password', 'Registered repeat password input');
                    }}
                    placeholder="Re-enter secure password"
                    className={`w-full bg-white border rounded-xl pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-2 transition-all shadow-sm ${
                      signupErrors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    id="toggle-signup-confirm-btn"
                    type="button"
                    onClick={() => {
                      setShowSignupConfirmPassword(!showSignupConfirmPassword);
                      onAddLog('TOGGLE_VISIBILITY', 'toggle-signup-confirm-btn', `Confirm Password visibility: ${!showSignupConfirmPassword ? 'visible' : 'hidden'}`);
                    }}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupErrors.confirmPassword && (
                  <span className="text-red-500 text-xs mt-1 block flex items-center gap-1" id="signup-confirm-error">
                    <AlertCircle className="w-3 h-3" /> {signupErrors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer duration-150"
              >
                Register Account
              </button>
            </form>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 p-4">
            <span className="text-[10px] text-slate-500 font-mono">
              SECURITY ADVISORY: Real password strength checklists evaluate client-side before sending payload. Automation scripts can check checklist checkbox values.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
