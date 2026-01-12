'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingInput } from './FloatingInput';
import { PasswordStrength } from './PasswordStrength';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordMatch,
} from './FormValidation';
import { User, Mail, Lock } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface SignUpFormProps {
  onSuccess?: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameError('');
    setError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
    setError('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate all fields
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || '');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || '');
      return;
    }

    const passwordMatchValidation = validatePasswordMatch(password, confirmPassword);
    if (!passwordMatchValidation.isValid) {
      setConfirmPasswordError(passwordMatchValidation.error || '');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms and Conditions');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      const data = await response.json();

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAcceptTerms(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Name Input */}
      <motion.div variants={staggerItem}>
        <FloatingInput
          id="name"
          type="text"
          label="Full Name"
          value={name}
          onChange={handleNameChange}
          error={nameError}
          icon={<User className="w-5 h-5" />}
          iconPosition="left"
          required
          autoComplete="name"
        />
      </motion.div>

      {/* Email Input */}
      <motion.div variants={staggerItem}>
        <FloatingInput
          id="email"
          type="email"
          label="Email Address"
          value={email}
          onChange={handleEmailChange}
          error={emailError}
          icon={<Mail className="w-5 h-5" />}
          iconPosition="left"
          required
          autoComplete="email"
        />
      </motion.div>

      {/* Password Input */}
      <motion.div variants={staggerItem}>
        <FloatingInput
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={handlePasswordChange}
          error={passwordError}
          icon={<Lock className="w-5 h-5" />}
          iconPosition="left"
          required
          autoComplete="new-password"
        />
        {/* Password Strength Indicator */}
        <AnimatePresence>
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3"
            >
              <PasswordStrength password={password} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Confirm Password Input */}
      <motion.div variants={staggerItem}>
        <FloatingInput
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={confirmPasswordError}
          success={confirmPassword.length > 0 && password === confirmPassword}
          icon={<Lock className="w-5 h-5" />}
          iconPosition="left"
          required
          autoComplete="new-password"
        />
      </motion.div>

      {/* Terms and Conditions */}
      <motion.div variants={staggerItem}>
        <motion.label
          className="flex items-start gap-3 cursor-pointer group"
          whileHover={prefersReducedMotion ? {} : { x: 2 }}
          transition={{ duration: 0.2 }}
        >
          <motion.input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-colors cursor-pointer"
            required
            whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
            I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500 font-medium underline"
            >
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500 font-medium underline"
            >
              Privacy Policy
            </a>
          </span>
        </motion.label>
      </motion.div>

      {/* Form-level Error */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden"
          >
            <div className="flex items-start gap-3">
              <motion.svg
                className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </motion.svg>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        variants={staggerItem}
        whileHover={!loading && !prefersReducedMotion ? { scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" } : undefined}
        whileTap={!loading && !prefersReducedMotion ? { scale: 0.98 } : undefined}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-6 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-xl relative overflow-hidden"
        transition={{ duration: 0.2 }}
      >
        {/* Button gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />

        <span className="relative z-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <motion.svg
                  className="-ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </motion.svg>
                Creating account...
              </motion.span>
            ) : (
              <motion.span
                key="signup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Create Account
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
    </motion.form>
  );
}
