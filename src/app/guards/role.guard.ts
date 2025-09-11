import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { map } from 'rxjs';

export function createRoleGuard(requiredRole: string): CanActivateFn {
  return (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 首先檢查是否已登入
    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // 檢查是否有用戶資訊
    const user = authService.user();
    
    if (user) {
      // 已有用戶資訊，直接檢查角色
      if (user.role === requiredRole) {
        return true;
      } else {
        // 角色不符，重定向到首頁
        router.navigate(['/']);
        return false;
      }
    } else {
      // 沒有用戶資訊，先載入再檢查
      return authService.loadUserProfile().pipe(
        map((success) => {
          if (success) {
            const currentUser = authService.user();
            if (currentUser?.role === requiredRole) {
              return true;
            } else {
              // 角色不符，重定向到首頁
              router.navigate(['/']);
              return false;
            }
          } else {
            // 無法載入用戶資訊，重定向到登入頁
            router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
          }
        })
      );
    }
  };
}

// 預定義的角色守衛
export const studentGuard: CanActivateFn = createRoleGuard('student');
export const teacherGuard: CanActivateFn = createRoleGuard('teacher');
export const adminGuard: CanActivateFn = createRoleGuard('admin');