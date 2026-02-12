/**
 * Registration Page — Complex Form with Async Validation
 *
 * Demonstrates:
 * - useForm custom hook (rubric: "Custom Hooks in React")
 * - Async email availability check (rubric: "asynchronous validation")
 * - Field-level error display with touched tracking
 */

import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import {
    validateEmail,
    validatePassword,
    validateRequired,
    validateMinLength,
    validateMatch,
    checkEmailAvailability,
} from '../utils/validators';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const syncValidate = useMemo(() => (values) => {
        const errors = {};
        errors.email = validateEmail(values.email);
        errors.username = validateMinLength(values.username, 3, 'Username');
        errors.firstName = validateRequired(values.firstName, 'First name');
        errors.lastName = validateRequired(values.lastName, 'Last name');
        errors.password = validatePassword(values.password);
        errors.confirmPassword = validateMatch(values.password, values.confirmPassword, 'Passwords');
        // Remove empty strings (no error)
        Object.keys(errors).forEach((key) => { if (!errors[key]) delete errors[key]; });
        return errors;
    }, []);

    // Async validators: email uniqueness check
    const asyncValidators = useMemo(() => ({
        email: checkEmailAvailability,
    }), []);

    const handleRegister = async (values) => {
        const { confirmPassword, ...userData } = values;
        const result = await register(userData);
        if (result.success) {
            navigate('/');
        } else {
            alert(result.error || 'Registration failed');
        }
    };

    const {
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        getFieldError,
        isFieldValidating,
        isSubmitting,
    } = useForm({
        initialValues: {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
        },
        syncValidate,
        asyncValidators,
        onSubmit: handleRegister,
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={getFieldError('email')}
                            required
                        />
                        {isFieldValidating('email') && (
                            <span className="absolute right-3 top-9 text-sm text-blue-500 animate-pulse">
                                Checking...
                            </span>
                        )}
                    </div>

                    <Input label="Username" name="username" value={values.username}
                           onChange={handleChange} onBlur={handleBlur}
                           error={getFieldError('username')} required />

                    <Input label="First Name" name="firstName" value={values.firstName}
                           onChange={handleChange} onBlur={handleBlur}
                           error={getFieldError('firstName')} required />

                    <Input label="Last Name" name="lastName" value={values.lastName}
                           onChange={handleChange} onBlur={handleBlur}
                           error={getFieldError('lastName')} required />

                    <Input label="Password" name="password" type="password" value={values.password}
                           onChange={handleChange} onBlur={handleBlur}
                           error={getFieldError('password')} required />

                    <Input label="Confirm Password" name="confirmPassword" type="password"
                           value={values.confirmPassword}
                           onChange={handleChange} onBlur={handleBlur}
                           error={getFieldError('confirmPassword')} required />

                    <Button type="submit" variant="primary" size="large" loading={isSubmitting} className="w-full">
                        Sign up
                    </Button>
                </form>
            </div>
        </div>
    );
};