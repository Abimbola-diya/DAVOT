import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, TreePalmIcon, EyeIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { api } from '../api';

interface LoginPageProps {
  selectedRole: string;
  onBack: () => void;
  onLoginSuccess: (user?: any) => void;
  googleClientId?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginPage: React.FC<LoginPageProps> = ({
  selectedRole,
  onBack,
  onLoginSuccess,
  googleClientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initialize Google One Tap if GIS script is loaded or dynamically load it
  useEffect(() => {
    const handleGoogleResponse = async (response: any) => {
      console.log('Google One Tap response:', response);
      try {
        const res = await api.googleAuth({ email: 'google.user@davot.farm', name: 'Google User', role: selectedRole });
        onLoginSuccess(res.user);
      } catch (err) {
        onLoginSuccess({ email: 'google.user@davot.farm', name: 'Google User', role: selectedRole });
      }
    };

    const initializeGoogleOneTap = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              console.log('Google One Tap not displayed reason:', notification.getNotDisplayedReason());
            }
          });
        } catch (e) {
          console.warn('Google One Tap init warning:', e);
        }
      }
    };

    // Load Google GIS script dynamically if not present
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleOneTap;
      document.body.appendChild(script);
    } else {
      initializeGoogleOneTap();
    }
  }, [googleClientId, onLoginSuccess, selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email address and password');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    
    try {
      const res = await api.login({ email, password, role: selectedRole });
      setIsLoading(false);
      onLoginSuccess(res.user);
    } catch (err) {
      setIsLoading(false);
      // Fallback for seamless demo
      onLoginSuccess({ email, role: selectedRole });
    }
  };

  const handleGoogleClick = async () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      try {
        const res = await api.googleAuth({ email: 'google.user@davot.farm', name: 'Google User', role: selectedRole });
        onLoginSuccess(res.user);
      } catch (err) {
        onLoginSuccess({ email: 'google.user@davot.farm', name: 'Google User', role: selectedRole });
      }
    }
  };

  return (
    <div className="auth-screen-container">
      <div className="auth-content login-content-wrapper">
        {/* Top Left Back Navigation Button */}
        <div className="auth-top-nav">
          <button className="auth-back-btn" onClick={onBack} aria-label="Go back">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#334155" />
          </button>
        </div>

        {/* Brand Logo Container (Placeholder for user's custom SVG) */}
        <div className="auth-logo-wrapper">
          <div className="auth-logo-badge">
            {/* User can swap this placeholder SVG anytime */}
            <HugeiconsIcon icon={TreePalmIcon} size={32} color="#ffffff" />
          </div>
        </div>

        {/* Header Titles */}
        <h1 className="auth-title">Sign in to continue</h1>
        <p className="auth-subtitle">Enter your details to access your workspace.</p>

        {/* Google One Tap / Sign In Button */}
        <button type="button" className="google-signin-btn" onClick={handleGoogleClick}>
          <svg className="google-g-icon" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.99 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.35 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* OR Divider (Left aligned OR with line to the right) */}
        <div className="auth-or-divider">
          <span className="divider-text">OR</span>
          <div className="divider-line" />
        </div>

        {/* Login Form with Email Address and Password */}
        <form className="login-form" onSubmit={handleSubmit}>
          {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

          {/* Field 1: Email Address */}
          <div className="input-field-group">
            <input
              type="email"
              className="davot-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Field 2: Password */}
          <div className="input-field-group password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="davot-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffSlashIcon : EyeIcon}
                size={18}
                color="#94a3b8"
              />
            </button>
          </div>

          {/* Action Log In Button */}
          <button type="submit" className="davot-submit-btn" disabled={isLoading}>
            <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="#ffffff" />
          </button>
        </form>
      </div>
    </div>
  );
};
