import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { BACKEND_BASE } from '@env';

const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_KEY = '@user_data';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
  message?: string;
  error?: string;
}

class AuthService {
  private tokens: AuthTokens | null = null;
  private user: User | null = null;

  /**
   * Initialize auth service by loading stored tokens
   */
  async initialize(): Promise<boolean> {
    try {
      const [tokenStr, refreshToken, userStr] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (tokenStr && refreshToken) {
        const tokenData = JSON.parse(tokenStr);
        this.tokens = {
          accessToken: tokenData.accessToken,
          refreshToken,
          expiresAt: tokenData.expiresAt,
        };
        
        if (userStr) {
          this.user = JSON.parse(userStr);
        }

        // Check if token is expired or about to expire
        if (this.isTokenExpired()) {
          const refreshed = await this.refreshAccessToken();
          return refreshed;
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      return false;
    }
  }

  /**
   * Login with email and password using Supabase Auth
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Login failed',
        };
      }

      if (data.session) {
        // Calculate expiration time
        const expiresAt = data.session.expires_at
          ? data.session.expires_at * 1000
          : Date.now() + 3600 * 1000;

        this.tokens = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt,
        };

        this.user = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name,
        };

        // Store tokens
        await this.storeTokens();
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(this.user));

        return {
          success: true,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          user: this.user,
        };
      }

      return {
        success: false,
        error: 'No session returned from Supabase',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Logout and clear stored tokens
   */
  async logout(): Promise<void> {
    this.tokens = null;
    this.user = null;
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  }

  /**
   * Get current access token, refresh if needed
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.tokens) {
      return null;
    }

    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return null;
      }
    }

    return this.tokens.accessToken;
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokens !== null && !this.isTokenExpired();
  }

  /**
   * Check if token is expired or about to expire (within 5 minutes)
   */
  private isTokenExpired(): boolean {
    if (!this.tokens) return true;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= this.tokens.expiresAt - fiveMinutes;
  }

  /**
   * Refresh access token using Supabase refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.tokens?.refreshToken) {
      return false;
    }

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: this.tokens.refreshToken,
      });

      if (error || !data.session) {
        console.error('Token refresh error:', error);
        await this.logout();
        return false;
      }

      const expiresAt = data.session.expires_at
        ? data.session.expires_at * 1000
        : Date.now() + 3600 * 1000;

      this.tokens = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt,
      };

      await this.storeTokens();
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      return false;
    }
  }

  /**
   * Store tokens in AsyncStorage
   */
  private async storeTokens(): Promise<void> {
    if (!this.tokens) return;

    await AsyncStorage.multiSet([
      [
        TOKEN_KEY,
        JSON.stringify({
          accessToken: this.tokens.accessToken,
          expiresAt: this.tokens.expiresAt,
        }),
      ],
      [REFRESH_TOKEN_KEY, this.tokens.refreshToken],
    ]);
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAccessToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh and retry once
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        const newToken = await this.getAccessToken();
        headers.Authorization = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers });
      }
    }

    return response;
  }
}

export const authService = new AuthService();
