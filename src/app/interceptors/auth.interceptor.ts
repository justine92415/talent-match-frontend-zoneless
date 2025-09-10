import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthStateService } from '../services/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  // 如果有 token，就添加到請求 header
  const authToken = tokenService.getAuthorizationHeader();
  let authReq = req;
  
  if (authToken) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', authToken)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 處理 401 錯誤（token 過期或無效）
      if (error.status === 401 && tokenService.getRefreshToken()) {
        // 嘗試刷新 token
        return authStateService.refreshToken().pipe(
          switchMap((newToken) => {
            if (newToken) {
              // 刷新成功，重新發送原請求
              const newAuthReq = authReq.clone({
                headers: authReq.headers.set('Authorization', `Bearer ${newToken}`)
              });
              return next(newAuthReq);
            } else {
              // 刷新失敗，導向登入頁
              router.navigate(['/login']);
              return throwError(() => error);
            }
          }),
          catchError(() => {
            // 刷新失敗，導向登入頁
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};