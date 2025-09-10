import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthenticationService } from '@app/api/generated/authentication/authentication.service';
import type { LoginResponse, PostApiAuthLoginBody, PostApiAuthRefreshTokenBody, UserProfile } from '@app/api/generated/talentMatchAPI.schemas';

export type User = UserProfile;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = {
  ACCESS_TOKEN: 'tmf_access_token',
  REFRESH_TOKEN: 'tmf_refresh_token',
  USER: 'tmf_user',
} as const;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authApi = inject(AuthenticationService);
  private readonly router = inject(Router);

  private readonly authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    tokens: null,
    loading: false,
    error: null
  });

  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly user = computed(() => this.authState().user);
  readonly isLoading = computed(() => this.authState().loading);
  readonly error = computed(() => this.authState().error);
  readonly userRole = computed(() => this.authState().user?.role);
  readonly userName = computed(() => this.authState().user?.nick_name || this.authState().user?.name);

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const accessToken = localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEY.REFRESH_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEY.USER);

    if (accessToken && refreshToken && userData) {
      try {
        const user: User = JSON.parse(userData);
        const tokens: AuthTokens = {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: 3600 // 預設值，實際會從 token 解析
        };

        if (this.isTokenValid(accessToken)) {
          this.updateAuthState({
            isAuthenticated: true,
            user,
            tokens,
            loading: false,
            error: null
          });
        } else {
          // Token 過期，嘗試刷新
          this.refreshTokenSilently();
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        this.clearStoredAuth();
      }
    }
  }

  login(credentials: PostApiAuthLoginBody): Observable<boolean> {
    this.updateAuthState({
      ...this.authState(),
      loading: true,
      error: null
    });

    return this.authApi.postApiAuthLogin(credentials).pipe(
      tap((response: LoginResponse) => {
        if (response.status === 'success' && response.data) {
          this.handleLoginSuccess(response.data);
        }
      }),
      map((response: LoginResponse) => response.status === 'success'),
      catchError((error) => {
        this.handleLoginError(error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearStoredAuth();
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      tokens: null,
      loading: false,
      error: null
    });
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<boolean> {
    const currentState = this.authState();
    const refreshToken = currentState.tokens?.refresh_token;

    if (!refreshToken) {
      this.logout();
      return of(false);
    }

    const refreshData: PostApiAuthRefreshTokenBody = {
      refresh_token: refreshToken
    };

    return this.authApi.postApiAuthRefreshToken(refreshData).pipe(
      tap((response) => {
        if (response.status === 'success' && response.data) {
          this.handleLoginSuccess(response.data);
        }
      }),
      map((response) => response.status === 'success'),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        this.logout();
        return of(false);
      })
    );
  }

  getAccessToken(): string | null {
    return this.authState().tokens?.access_token || null;
  }

  private handleLoginSuccess(data: LoginResponse['data']): void {
    if (!data) {
      console.error('No data received from login response');
      return;
    }

    const { user, access_token, refresh_token, token_type, expires_in } = data;
    
    if (!user || !access_token || !refresh_token) {
      console.error('Incomplete login data received');
      return;
    }

    const tokens: AuthTokens = {
      access_token,
      refresh_token,
      token_type: token_type || 'Bearer',
      expires_in: expires_in || 3600
    };

    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, access_token);
    localStorage.setItem(STORAGE_KEY.REFRESH_TOKEN, refresh_token);
    localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(user));

    // 更新狀態
    this.updateAuthState({
      isAuthenticated: true,
      user,
      tokens,
      loading: false,
      error: null
    });
  }

  private handleLoginError(error: any): void {
    const errorMessage = error?.error?.message || error?.message || '登入失敗，請稍後再試';
    
    this.updateAuthState({
      ...this.authState(),
      loading: false,
      error: errorMessage
    });
  }

  private refreshTokenSilently(): void {
    this.refreshToken().subscribe({
      next: (success) => {
        if (!success) {
          this.clearStoredAuth();
        }
      },
      error: () => {
        this.clearStoredAuth();
      }
    });
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEY.USER);
  }

  private updateAuthState(newState: AuthState): void {
    this.authState.set(newState);
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  clearError(): void {
    this.updateAuthState({
      ...this.authState(),
      error: null
    });
  }
}