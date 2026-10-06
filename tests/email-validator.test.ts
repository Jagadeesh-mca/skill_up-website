import { describe, it, expect } from 'vitest';
import { validateHindustanEmail } from '../src/lib/email-validator';

describe('validateHindustanEmail', () => {
  describe('Valid Student Emails', () => {
    it('should accept student emails with "sp" prefix', () => {
      const result = validateHindustanEmail('sp123456@student.hindustanuniv.ac.in');
      expect(result.isValid).toBe(true);
      expect(result.role).toBe('STUDENT');
      expect(result.normalizedEmail).toBe('sp123456@student.hindustanuniv.ac.in');
    });

    it('should accept uppercase "SP" in local part', () => {
      const result = validateHindustanEmail('SP123456@student.hindustanuniv.ac.in');
      expect(result.isValid).toBe(true);
      expect(result.role).toBe('STUDENT');
      expect(result.normalizedEmail).toBe('sp123456@student.hindustanuniv.ac.in');
    });

    it('should accept "sp" embedded inside username', () => {
      const result = validateHindustanEmail('abcsp123@student.hindustanuniv.ac.in');
      expect(result.isValid).toBe(true);
      expect(result.role).toBe('STUDENT');
    });

    it('should accept "su" uppercase anywhere in username', () => {
      const result = validateHindustanEmail('123SU456@student.hindustanuniv.ac.in');
      expect(result.isValid).toBe(true);
      expect(result.role).toBe('STUDENT');
    });

    it('should accept "su" lowercase prefix', () => {
      const result = validateHindustanEmail('su2024john@student.hindustanuniv.ac.in');
      expect(result.isValid).toBe(true);
      expect(result.role).toBe('STUDENT');
    });

    it('should accept mixed-case and symbols around sp/su', () => {
      const result = validateHindustanEmail('john.sp.doe@student.hindustanuniv.ac.in');
      expect(result.isValid).toBe(true);
      expect(result.role).toBe('STUDENT');
    });
  });

  describe('Invalid Student Emails', () => {
    it('should reject student email lacking "sp" or "su" in local part', () => {
      const result = validateHindustanEmail('123456@student.hindustanuniv.ac.in');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must contain 'sp' or 'su'");
    });

    it('should reject generic student names without sp or su', () => {
      const result = validateHindustanEmail('alexander@student.hindustanuniv.ac.in');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must contain 'sp' or 'su'");
    });
  });

  describe('Valid Faculty / Staff Emails', () => {
    it('should accept official faculty email domain', () => {
      const result = validateHindustanEmail('prof.smith@hindustanuniv.ac.in');
      expect(result.isValid).toBe(true);
      expect(result.role).toBe('TEACHER');
      expect(result.normalizedEmail).toBe('prof.smith@hindustanuniv.ac.in');
    });

    it('should accept departmental emails', () => {
      const result = validateHindustanEmail('hod.cse@hindustanuniv.ac.in');
      expect(result.isValid).toBe(true);
      expect(result.role).toBe('TEACHER');
    });
  });

  describe('Invalid Domains & Malformed Inputs', () => {
    it('should reject public email providers like Gmail even with sp prefix', () => {
      const result = validateHindustanEmail('sp123456@gmail.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Only official Hindustan University domains');
    });

    it('should reject generic university domains', () => {
      const result = validateHindustanEmail('sp123456@hindustan.edu');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Only official Hindustan University domains');
    });

    it('should reject empty or null inputs', () => {
      expect(validateHindustanEmail(null).isValid).toBe(false);
      expect(validateHindustanEmail(undefined).isValid).toBe(false);
      expect(validateHindustanEmail('').isValid).toBe(false);
    });

    it('should reject malformed strings lacking @ symbol', () => {
      const result = validateHindustanEmail('sp123456student.hindustanuniv.ac.in');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid email address');
    });
  });
});
