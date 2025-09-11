import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { map } from 'rxjs';

export const dashboardRedirectGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 檢查是否有用戶資訊
  const user = authService.user();
  
  if (user) {
    // 已有用戶資訊，根據角色重定向
    if (user.role === 'student') {
      router.navigate(['/dashboard/student']);
      return false;
    } else if (user.role === 'teacher') {
      router.navigate(['/dashboard/teacher']);
      return false;
    } else {
      // 其他角色或未知角色，重定向到首頁
      router.navigate(['/']);
      return false;
    }
  } else {
    // 沒有用戶資訊，先載入再重定向
    return authService.loadUserProfile().pipe(
      map((success) => {
        if (success) {
          const currentUser = authService.user();
          if (currentUser?.role === 'student') {
            router.navigate(['/dashboard/student']);
            return false;
          } else if (currentUser?.role === 'teacher') {
            router.navigate(['/dashboard/teacher']);
            return false;
          } else {
            // 其他角色或未知角色，重定向到首頁
            router.navigate(['/']);
            return false;
          }
        } else {
          // 無法載入用戶資訊，重定向到登入頁
          router.navigate(['/login']);
          return false;
        }
      })
    );
  }
};