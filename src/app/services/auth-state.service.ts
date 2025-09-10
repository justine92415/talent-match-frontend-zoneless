import { Injectable, signal, computed, inject } from '@angular/core';
import { TokenService } from './token.service';
import { UserProfile } from '../api/generated/talentMatchAPI.schemas';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private tokenService = inject(TokenService);
  
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
    this.isAuthenticated.set(hasToken);
    
    if (!hasToken) {
      this.userProfile.set(null);
    }
  }

  updateUserProfile(user: UserProfile): void {
    this.userProfile.set(user);
  }
}