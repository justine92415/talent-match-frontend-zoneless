import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';

import { routes } from './app.routes';
import { AuthStateService } from './services/auth-state.service';
import { authInterceptor } from './interceptors/auth.interceptor';

// Material Icons 初始化函式
export function initializeMaterialIcons(iconRegistry: MatIconRegistry): () => void {
  return () => {
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  };
}

// 應用程式初始化函式 - 檢查登入狀態
export function initializeAuth(authStateService: AuthStateService): () => void {
  return () => {
    authStateService.initializeAuthState();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Material Icons 全域配置
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMaterialIcons,
      deps: [MatIconRegistry],
      multi: true
    },
    // 應用程式初始化 - 檢查登入狀態
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthStateService],
      multi: true
    }
  ]
};
