import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '@app/services/auth.service';

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'tmf-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIcon],
  templateUrl: './dashboard-sidebar.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardSidebar {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;
  userRole = computed(() => this.user()?.role);

  // 角色顯示標籤
  roleLabel = computed(() => {
    const role = this.userRole();
    return role === 'student' ? '學生' : 
           role === 'teacher' ? '教師' : 
           role === 'admin' ? '管理員' : '用戶';
  });

  // 根據角色生成導航選單
  navigationItems = computed<SidebarMenuItem[]>(() => {
    const role = this.userRole();
    
    if (role === 'student') {
      return [
        {
          id: 'info',
          label: '基本資訊',
          icon: 'face',
          route: '/dashboard/student/info'
        },
        {
          id: 'courses',
          label: '我的課程',
          icon: 'lab_profile',
          route: '/dashboard/student/courses'
        },
        {
          id: 'favorites',
          label: '收藏課程',
          icon: 'favorite',
          route: '/dashboard/student/favorites'
        },
        {
          id: 'calendar',
          label: '行事曆',
          icon: 'edit_calendar',
          route: '/dashboard/student/calendar'
        },
        {
          id: 'record',
          label: '交易紀錄',
          icon: 'account_balance_wallet',
          route: '/dashboard/student/record'
        }
      ];
    } else if (role === 'teacher') {
      return [
        {
          id: 'info',
          label: '基本資訊',
          icon: 'face',
          route: '/dashboard/teacher/info'
        },
        {
          id: 'videos',
          label: '影片管理',
          icon: 'smart_display',
          route: '/dashboard/teacher/videos'
        },
        {
          id: 'reservation',
          label: '預約管理',
          icon: 'edit_calendar',
          route: '/dashboard/teacher/reservation'
        },
        {
          id: 'courses',
          label: '課程管理',
          icon: 'lab_profile',
          route: '/dashboard/teacher/courses'
        },
        {
          id: 'record',
          label: '交易紀錄',
          icon: 'account_balance_wallet',
          route: '/dashboard/teacher/record'
        }
      ];
    }
    
    return [];
  });

  // 角色切換功能
  switchRole() {
    const currentRole = this.userRole();
    if (currentRole === 'student') {
      this.router.navigate(['/dashboard/teacher']);
    } else if (currentRole === 'teacher') {
      this.router.navigate(['/dashboard/student']);
    }
  }

  // 檢查是否可以切換角色
  canSwitchRole = computed(() => {
    const role = this.userRole();
    // 這裡可以根據實際業務邏輯判斷用戶是否同時具有兩種角色
    // 目前簡單假設所有用戶都可以切換
    return role === 'student' || role === 'teacher';
  });

  // 獲取切換目標角色的標籤
  switchTargetLabel = computed(() => {
    const currentRole = this.userRole();
    return currentRole === 'student' ? '切換為教師' : '切換為學生';
  });
}
