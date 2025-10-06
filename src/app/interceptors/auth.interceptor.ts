import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '@app/services/auth.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 不需要認證的 API 端點
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/health'
  ];

  // 檢查是否為公開端點
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  // 如果是公開端點，直接發送請求
  if (isPublicEndpoint) {
    return next(req);
  }

  // 添加 Authorization header
  const authReq = addTokenHeader(req, authService.getAccessToken());

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicEndpoint) {
        return handle401Error(authReq, next, authService, router);
      }
      
      // 處理其他認證相關錯誤
      if (error.status === 403 && !isPublicEndpoint) {
        authService.logout();
        return throwError(() => error);
      }

      // 處理伺服器錯誤時的 token 驗證
      if (error.status >= 500 && !isPublicEndpoint) {
        // 對於伺服器錯誤，我們不立即登出，但 AuthService 中的 loadUserProfile 會處理
      }

      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
  if (!token) {
    return request;
  }

  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });
}

function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const token = authService.getAccessToken();
    if (token) {
      return authService.refreshToken().pipe(
        switchMap((success: boolean) => {
          isRefreshing = false;
          if (success) {
            const newToken = authService.getAccessToken();
            refreshTokenSubject.next(newToken);
            return next(addTokenHeader(request, newToken));
          } else {
            // Refresh failed, redirect to login
            authService.logout();
            return throwError(() => new Error('Token refresh failed'));
          }
        }),
        catchError((err) => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      isRefreshing = false;
      authService.logout();
      return throwError(() => new Error('No token available'));
    }
  }

  // 如果正在刷新 token，等待刷新完成
  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap((token) => next(addTokenHeader(request, token)))
  );
}