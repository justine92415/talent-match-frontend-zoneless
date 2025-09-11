import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiConfigService } from '@app/services/api-config.service';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const apiConfig = inject(ApiConfigService);
  
  // 檢查是否為相對路徑 API 請求
  if (req.url.startsWith('/api/') || req.url.startsWith('api/')) {
    // 建立新的請求，使用完整的 API URL
    const apiRequest = req.clone({
      url: apiConfig.getFullUrl(req.url)
    });
    
    return next(apiRequest);
  }
  
  // 如果不是 API 請求，直接發送原始請求
  return next(req);
};