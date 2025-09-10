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
  readonly isLoggedIn = computed(() => this.isAuthenticated() && this.tokenService.isLoggedIn());
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
    const hasToken = this.tokenService.isLoggedIn();
    
    if (!hasToken) {
      this.isAuthenticated.set(false);
      this.userProfile.set(null);
      return;
    }

    // 如果有 token，嘗試從 API 獲取使用者資料
    this.authService.getApiAuthProfile()
      .pipe(
        catchError((error) => {
          console.error('Failed to get user profile:', error);
          // API 失敗時清除登入狀態
          this.clearAuthState();
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.data?.user) {
            this.userProfile.set(response.data.user);
            this.isAuthenticated.set(true);
          } else {
            this.clearAuthState();
          }
        }
      });
  }

  updateUserProfile(user: UserProfile): void {
    this.userProfile.set(user);
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