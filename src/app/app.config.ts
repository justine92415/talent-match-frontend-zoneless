import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { apiBaseUrlInterceptor } from './interceptors/api-base-url.interceptor';
import { AuthService } from './services/auth.service';

// Material Icons 初始化函式
export function initializeMaterialIcons(iconRegistry: MatIconRegistry): () => void {
  return () => {
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  };
}

// 認證狀態初始化函式
export function initializeAuth(): () => Promise<void> {
  return () => {
    const authService = inject(AuthService);
    // AuthService 在初始化時已經會自動檢查 localStorage 並恢復狀態
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor, authInterceptor])),
    // Material Icons 全域配置
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMaterialIcons,
      deps: [MatIconRegistry],
      multi: true
    },
    // 認證狀態初始化
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true
    }
  ]
};
