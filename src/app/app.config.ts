import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';

import { routes } from './app.routes';

// Material Icons 初始化函式
export function initializeMaterialIcons(iconRegistry: MatIconRegistry): () => void {
  return () => {
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    // Material Icons 全域配置
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMaterialIcons,
      deps: [MatIconRegistry],
      multi: true
    }
  ]
};
