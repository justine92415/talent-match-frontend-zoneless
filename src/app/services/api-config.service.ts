import { Injectable, InjectionToken } from '@angular/core';
import { environment } from '@environments/environment';

// API 基礎 URL 的 injection token
export const API_BASE_URL = new InjectionToken<string>('apiBaseUrl');

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  public readonly baseUrl = environment.apiBaseUrl;
  
  getFullUrl(endpoint: string): string {
    // 確保端點以 / 開頭
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${normalizedEndpoint}`;
  }
}