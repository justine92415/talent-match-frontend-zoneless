import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { AuthenticationService } from '@app/api/generated/authentication/authentication.service';
import type { 
  LoginSuccessResponse, 
  LoginRequest, 
  RefreshTokenRequest, 
  RefreshTokenSuccessResponse,
  RegisterSuccessResponse,
  GetProfileResponse,
  UserProfile,
  AuthSuccessData
} from '@app/api/generated/talentMatchAPI.schemas';

export type User = UserProfile;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface JWTPayload {
  userId: number;
  roles: string[];
  type: string;
  timestamp: number;
  iat: number;
  exp: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null; // 從 API 獲取的完整用戶資訊
  roles: string[]; // 從 JWT token 解碼的角色資訊
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = {
  ACCESS_TOKEN: 'tmf_access_token',
  REFRESH_TOKEN: 'tmf_refresh_token',
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
    roles: [],
    tokens: null,
    loading: false,
    error: null
  });

  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly user = computed(() => this.authState().user);
  readonly roles = computed(() => this.authState().roles);
  readonly isLoading = computed(() => this.authState().loading);
  readonly error = computed(() => this.authState().error);
  readonly userRole = computed(() => this.authState().roles[0] || null); // 保持向後相容，返回第一個角色
  readonly userName = computed(() => this.authState().user?.nick_name || this.authState().user?.name);

  constructor() {
    this.initializeAuthState();
  }

  // 檢查是否擁有特定角色
  hasRole(role: string): boolean {
    return this.authState().roles.includes(role);
  }

  // 檢查是否擁有任一角色
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.authState().roles;
    return roles.some(role => userRoles.includes(role));
  }

  private initializeAuthState(): void {
    const accessToken = localStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEY.REFRESH_TOKEN);

    if (accessToken && refreshToken) {
      try {
        // 解碼 JWT token 來取得角色資訊
        const decoded = jwtDecode<JWTPayload>(accessToken);
        const roles = decoded.roles || [];

        const tokens: AuthTokens = {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: 3600
        };

        this.updateAuthState({
          isAuthenticated: true,
          user: null, // 用戶資訊稍後從 API 獲取
          roles,
          tokens,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to decode JWT token:', error);
        // JWT 解碼失敗，清除儲存的 token
        this.clearStoredAuth();
        this.updateAuthState({
          isAuthenticated: false,
          user: null,
          roles: [],
          tokens: null,
          loading: false,
          error: null
        });
      }
    }
  }

  login(credentials: LoginRequest): Observable<boolean> {
    this.updateAuthState({
      ...this.authState(),
      loading: true,
      error: null
    });

    return this.authApi.postApiAuthLogin(credentials).pipe(
      tap((response: LoginSuccessResponse) => {
        if (response.status === 'success' && response.data) {
          this.handleLoginSuccess(response.data);
        }
      }),
      map((response: LoginSuccessResponse) => response.status === 'success'),
      catchError((error) => {
        this.handleLoginError(error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('Performing logout - clearing auth state');
    this.clearStoredAuth();
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      roles: [],
      tokens: null,
      loading: false,
      error: null
    });
    this.router.navigate(['/home']);
  }

  refreshToken(): Observable<boolean> {
    const currentState = this.authState();
    const refreshToken = currentState.tokens?.refresh_token;

    if (!refreshToken) {
      this.logout();
      return of(false);
    }

    const refreshData: RefreshTokenRequest = {
      refresh_token: refreshToken
    };

    return this.authApi.postApiAuthRefresh(refreshData).pipe(
      tap((response: RefreshTokenSuccessResponse) => {
        if (response.status === 'success' && response.data) {
          this.handleLoginSuccess(response.data);
        }
      }),
      map((response: RefreshTokenSuccessResponse) => response.status === 'success'),
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

  private handleLoginSuccess(data: AuthSuccessData): void {
    if (!data) {
      console.error('No data received from login response');
      return;
    }

    const { user, access_token, refresh_token, token_type, expires_in } = data;
    
    if (!user || !access_token || !refresh_token) {
      console.error('Incomplete login data received');
      return;
    }

    try {
      // 解碼 JWT token 來取得角色資訊
      const decoded = jwtDecode<JWTPayload>(access_token);
      const roles = decoded.roles || [];

      const tokens: AuthTokens = {
        access_token,
        refresh_token,
        token_type: token_type || 'Bearer',
        expires_in: expires_in || 3600
      };

      // 保存到 localStorage
      localStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, access_token);
      localStorage.setItem(STORAGE_KEY.REFRESH_TOKEN, refresh_token);

      // 更新狀態
      this.updateAuthState({
        isAuthenticated: true,
        user,
        roles,
        tokens,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      this.updateAuthState({
        ...this.authState(),
        loading: false,
        error: 'JWT token 解碼失敗'
      });
    }
  }

  private handleLoginError(error: any): void {
    const errorMessage = error?.error?.message || error?.message || '登入失敗，請稍後再試';
    
    this.updateAuthState({
      ...this.authState(),
      loading: false,
      error: errorMessage
    });
  }


  private clearStoredAuth(): void {
    localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY.REFRESH_TOKEN);
  }

  private updateAuthState(newState: AuthState): void {
    this.authState.set(newState);
  }


  loadUserProfile(): Observable<boolean> {
    if (!this.isAuthenticated()) {
      console.log('Not authenticated, cannot load user profile');
      return of(false);
    }

    console.log('Loading user profile...');
    return this.authApi.getAuthProfile().pipe(
      tap((response: GetProfileResponse) => {
        if (response.status === 'success' && response.data?.user) {
          console.log('User profile loaded successfully');
          this.updateAuthState({
            ...this.authState(),
            user: response.data.user
          });
        }
      }),
      map((response: GetProfileResponse) => response.status === 'success' && !!response.data?.user),
      catchError((error) => {
        console.error('Failed to load user profile:', error);
        // 如果是認證相關錯誤 (401, 403) 或伺服器錯誤，清空登入狀態
        if (error.status === 401 || error.status === 403 || error.status >= 500) {
          console.warn(`Authentication failed or server error (${error.status}), logging out user`);
          this.logout();
          return of(false);
        }
        return of(false);
      })
    );
  }

  clearError(): void {
    this.updateAuthState({
      ...this.authState(),
      error: null
    });
  }
}