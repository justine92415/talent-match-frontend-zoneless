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
      const userRoles = authService.roles();
      if (userRoles.includes(requiredRole)) {
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
            const userRoles = authService.roles();
            if (userRoles.includes(requiredRole)) {
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
export const adminGuard: CanActivateFn = createRoleGuard('admin');

// 教師守衛：允許 teacher 和 teacher_pending 角色
export const teacherGuard: CanActivateFn = (_route, state) => {
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
    const userRoles = authService.roles();
    if (userRoles.includes('teacher') || userRoles.includes('teacher_pending')) {
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
          const userRoles = authService.roles();
          if (userRoles.includes('teacher') || userRoles.includes('teacher_pending')) {
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

// 教師申請守衛：只允許 student 角色訪問，禁止 teacher_pending 和 teacher 角色
export const teacherApplyGuard: CanActivateFn = (_route, state) => {
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
    const userRoles = authService.roles();
    
    // 如果已有 teacher_pending 或 teacher 角色，不允許訪問申請頁面
    if (userRoles.includes('teacher_pending') || userRoles.includes('teacher')) {
      router.navigate(['/dashboard/teacher/apply-status']);
      return false;
    }
    
    // 只允許 student 角色訪問
    if (userRoles.includes('student')) {
      return true;
    }
    
    // 其他角色重定向到首頁
    router.navigate(['/']);
    return false;
  } else {
    // 沒有用戶資訊，先載入再檢查
    return authService.loadUserProfile().pipe(
      map((success) => {
        if (success) {
          const userRoles = authService.roles();
          
          // 如果已有 teacher_pending 或 teacher 角色，不允許訪問申請頁面
          if (userRoles.includes('teacher_pending') || userRoles.includes('teacher')) {
            router.navigate(['/dashboard']);
            return false;
          }
          
          // 只允許 student 角色訪問
          if (userRoles.includes('student')) {
            return true;
          }
          
          // 其他角色重定向到首頁
          router.navigate(['/']);
          return false;
        } else {
          // 無法載入用戶資訊，重定向到登入頁
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      })
    );
  }
};