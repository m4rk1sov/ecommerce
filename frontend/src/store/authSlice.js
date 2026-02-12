/**
 * Auth Slice — Redux Toolkit
 *
 * Manages: user, token, loading, error
 * Async Thunks: loginUser, registerUser
 *
 * Why a slice instead of just Context?
 * - Predictable state transitions (pending → fulfilled/rejected)
 * - DevTools visibility into every auth action
 * - Middleware support (logging, analytics)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../api';

// ─── Async Thunks ────────────────────────────────────────────

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const data = await authAPI.login(credentials);
            return data; // { user, token }
        } catch (error) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const data = await authAPI.register(userData);
            return data; // { user, token }
        } catch (error) {
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

// ─── Initial State ───────────────────────────────────────────

const savedToken = localStorage.getItem('token');
const savedUser = (() => {
    try {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    } catch {
        return null;
    }
})();

const initialState = {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
    loading: false,
    error: null,
};

// ─── Slice ───────────────────────────────────────────────────

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            authAPI.logout();
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        updateUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, updateUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;