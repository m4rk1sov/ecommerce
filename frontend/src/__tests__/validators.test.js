/**
 * Unit Tests for Validators
 * Tests pure validation functions in isolation.
 */

import { describe, it, expect } from 'vitest';
import {
    validateEmail,
    validatePassword,
    validateRequired,
    validateMinLength,
    validateMatch,
    validatePrice,
    checkEmailAvailability,
} from '../utils/validators';

describe('validateEmail', () => {
    it('returns error for empty email', () => {
        expect(validateEmail('')).toBe('Email is required');
    });

    it('returns error for invalid email', () => {
        expect(validateEmail('notanemail')).toBe('Invalid email format');
        expect(validateEmail('missing@')).toBe('Invalid email format');
    });

    it('returns empty string for valid email', () => {
        expect(validateEmail('user@example.com')).toBe('');
    });
});

describe('validatePassword', () => {
    it('returns error for empty password', () => {
        expect(validatePassword('')).toBe('Password is required');
    });

    it('returns error for short password', () => {
        expect(validatePassword('Ab1')).toBe('Password must be at least 6 characters');
    });

    // it('returns error for no uppercase', () => {
    //     expect(validatePassword('abcdef1')).toBe('Password must contain at least one uppercase letter');
    // });

    it('returns error for no number', () => {
        expect(validatePassword('Abcdefg')).toBe('Password must contain at least one number');
    });

    it('returns empty string for valid password', () => {
        expect(validatePassword('Abcdef1')).toBe('');
    });
});

describe('validateRequired', () => {
    it('returns error for empty value', () => {
        expect(validateRequired('', 'Name')).toBe('Name is required');
    });

    it('returns error for whitespace-only value', () => {
        expect(validateRequired('   ', 'Name')).toBe('Name is required');
    });

    it('returns empty string for valid value', () => {
        expect(validateRequired('John')).toBe('');
    });
});

describe('validateMinLength', () => {
    it('returns error for short value', () => {
        expect(validateMinLength('ab', 3, 'Username')).toBe('Username must be at least 3 characters');
    });

    it('returns empty string for valid length', () => {
        expect(validateMinLength('abc', 3, 'Username')).toBe('');
    });
});

describe('validateMatch', () => {
    it('returns error when values do not match', () => {
        expect(validateMatch('abc', 'def', 'Passwords')).toBe('Passwords do not match');
    });

    it('returns empty string when values match', () => {
        expect(validateMatch('abc', 'abc')).toBe('');
    });
});

describe('validatePrice', () => {
    it('returns error for non-numeric', () => {
        expect(validatePrice('abc')).toBe('Price must be a positive number');
    });

    it('returns error for zero', () => {
        expect(validatePrice(0)).toBe('Price must be a positive number');
    });

    it('returns empty string for valid price', () => {
        expect(validatePrice(9.99)).toBe('');
    });
});

describe('checkEmailAvailability (async)', () => {
    it('returns error for taken email', async () => {
        const result = await checkEmailAvailability('user1@example.com');
        expect(result).toBe('This email is already registered');
    });

    it('returns empty string for available email', async () => {
        const result = await checkEmailAvailability('newuser@example.com');
        expect(result).toBe('');
    });
});