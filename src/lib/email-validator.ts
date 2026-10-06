export interface EmailValidationResult {
  isValid: boolean;
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  error?: string;
  normalizedEmail?: string;
  identifier?: string; // e.g. student roll prefix or username
}

export const STUDENT_EMAIL_DOMAIN = '@student.hindustanuniv.ac.in';
export const FACULTY_EMAIL_DOMAIN = '@hindustanuniv.ac.in';

/**
 * Validates Hindustan University email addresses according to institutional rules:
 * 1. Student emails MUST end with '@student.hindustanuniv.ac.in'
 * 2. The local part (before @) MUST contain 'sp' or 'su' anywhere (case-insensitive)
 *    e.g. sp123456, SP123456, abcsp123, 123SU456
 * 3. Faculty/Admin emails MUST end with '@hindustanuniv.ac.in' (and not @student.hindustanuniv.ac.in)
 *
 * @param email Raw email address input
 * @returns EmailValidationResult indicating validity, inferred role, or descriptive error message
 */
export function validateHindustanEmail(rawEmail: string | null | undefined): EmailValidationResult {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return {
      isValid: false,
      error: 'Email address is required.',
    };
  }

  const trimmed = rawEmail.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return {
      isValid: false,
      error: 'Please enter a valid email address.',
    };
  }

  const localPart = trimmed.substring(0, atIndex);
  const domainPart = trimmed.substring(atIndex);

  // Check Student Domain
  if (domainPart === STUDENT_EMAIL_DOMAIN) {
    // Check for "sp" or "su" in localPart (case-insensitive)
    const hasSpOrSu = /(sp|su)/i.test(localPart);

    if (!hasSpOrSu) {
      return {
        isValid: false,
        error: `Invalid Student ID in email: Student email usernames must contain 'sp' or 'su' (e.g. sp123456@student.hindustanuniv.ac.in). Found: '${localPart}'`,
      };
    }

    return {
      isValid: true,
      role: 'STUDENT',
      normalizedEmail: trimmed,
      identifier: localPart,
    };
  }

  // Check Faculty / Staff / Admin Domain
  if (domainPart === FACULTY_EMAIL_DOMAIN) {
    return {
      isValid: true,
      role: 'TEACHER', // Can be upgraded to ADMIN by user status in database
      normalizedEmail: trimmed,
      identifier: localPart,
    };
  }

  return {
    isValid: false,
    error: `Access Denied: Only official Hindustan University domains (@student.hindustanuniv.ac.in or @hindustanuniv.ac.in) are permitted. Received: '${domainPart}'`,
  };
}
