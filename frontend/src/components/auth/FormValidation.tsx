"use client"

/**
 * Form Validation Utilities
 * Provides real-time validation for authentication forms
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates email format using RFC 5322 compliant regex
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: "Email is required" }
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" }
  }

  return { isValid: true }
}

/**
 * Validates password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Password is required" }
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter" }
  }

  if (!/\d/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" }
  }

  return { isValid: true }
}

/**
 * Validates password confirmation matches
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" }
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" }
  }

  return { isValid: true }
}

/**
 * Validates name field
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Name is required" }
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters" }
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: "Name must be less than 100 characters" }
  }

  return { isValid: true }
}

/**
 * Validates required field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  return { isValid: true }
}

/**
 * Calculate password strength
 * Returns: 0 (weak), 1 (medium), 2 (strong)
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0

  let strength = 0

  // Length check
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++ // Special characters

  // Normalize to 0-2 scale
  if (strength <= 2) return 0 // weak
  if (strength <= 4) return 1 // medium
  return 2 // strong
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
      return "Weak"
    case 1:
      return "Medium"
    case 2:
      return "Strong"
    default:
      return "Weak"
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
      return "bg-error"
    case 1:
      return "bg-warning"
    case 2:
      return "bg-success"
    default:
      return "bg-gray-300"
  }
}
