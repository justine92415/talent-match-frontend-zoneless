import { Injectable, signal, computed, inject } from '@angular/core';
import { TokenService } from './token.service';
import { UserProfile } from '../api/generated/talentMatchAPI.schemas';
import { AuthenticationService } from '../api/generated/authentication/authentication.service';
import { catchError, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private tokenService = inject(TokenService);
  private authService = inject(AuthenticationService);
  
  private userProfile = signal<UserProfile | null>(null);
  private isAuthenticated = signal<boolean>(false);

  readonly user = this.userProfile.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenService.getAccessToken());
  readonly userRole = computed(() => this.userProfile()?.role || null);
  readonly userName = computed(() => this.userProfile()?.nick_name || this.userProfile()?.name || null);

  setAuthState(user: UserProfile, accessToken: string, refreshToken: string): void {
    this.userProfile.set(user);
    this.isAuthenticated.set(true);
    this.tokenService.setTokens(accessToken, refreshToken);
  }

  clearAuthState(): void {
    this.userProfile.set(null);
    this.isAuthenticated.set(false);
    this.tokenService.clearTokens();
  }

  initializeAuthState(): void {
    const hasToken = !!this.tokenService.getAccessToken();
    this.isAuthenticated.set(hasToken);
    
    if (!hasToken) {
      this.userProfile.set(null);
    }
    // 使用者資料會在需要時才載入
    // 例如：個人頁面或透過其他方式觸發
  }

  // 新增：單純檢查 token 是否存在（同步方法）
  hasToken(): boolean {
    return !!this.tokenService.getAccessToken();
  }

  updateUserProfile(user: UserProfile): void {
    this.userProfile.set(user);
  }

  // 按需載入使用者資料（返回 Observable，讓調用方處理訂閱）
  loadUserProfile() {
    if (!this.hasToken()) {
      this.clearAuthState();
      return of(null);
    }

    return this.authService.getApiAuthProfile().pipe(
      catchError((error) => {
        console.error('Failed to get user profile:', error);
        this.clearAuthState();
        return of(null);
      })
    );
  }

  refreshToken() {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      this.clearAuthState();
      return of(null);
    }

    return this.authService.postApiAuthRefreshToken({ refresh_token: refreshToken })
      .pipe(
        switchMap((response) => {
          if (response?.data?.access_token && response.data.refresh_token) {
            // 更新 tokens
            this.tokenService.setTokens(
              response.data.access_token,
              response.data.refresh_token
            );
            return of(response.data.access_token);
          } else {
            this.clearAuthState();
            return of(null);
          }
        }),
        catchError(() => {
          this.clearAuthState();
          return of(null);
        })
      );
  }
}