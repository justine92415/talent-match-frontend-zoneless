import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'tmf_access_token';
  private readonly REFRESH_TOKEN_KEY = 'tmf_refresh_token';
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }
}
