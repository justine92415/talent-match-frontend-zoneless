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
  roles = this.authService.roles;
  userRole = computed(() => this.roles()[0] || null); // 取第一個角色作為主要角色

  // 角色顯示標籤
  roleLabel = computed(() => {
    const roles = this.roles();
    if (roles.includes('teacher') && roles.includes('student')) {
      return '教師・學生';
    } else if (roles.includes('teacher')) {
      return '教師';
    } else if (roles.includes('student')) {
      return '學生';
    } else if (roles.includes('admin')) {
      return '管理員';
    } else {
      return '用戶';
    }
  });

  // 根據角色生成導航選單
  navigationItems = computed<SidebarMenuItem[]>(() => {
    const roles = this.roles();
    const items: SidebarMenuItem[] = [];
    
    // 基本資訊對所有角色都顯示
    items.push({
      id: 'info',
      label: '基本資訊',
      icon: 'face',
      route: '/dashboard/info'
    });
    
    // 學生相關功能
    if (roles.includes('student')) {
      items.push(
        {
          id: 'student-courses',
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
          id: 'student-calendar',
          label: '學習行事曆',
          icon: 'edit_calendar',
          route: '/dashboard/student/calendar'
        }
      );
    }
    
    // 教師相關功能
    if (roles.includes('teacher')) {
      items.push(
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
          id: 'teacher-courses',
          label: '課程管理',
          icon: 'lab_profile',
          route: '/dashboard/teacher/courses'
        }
      );
    }
    
    // 交易紀錄對所有角色都顯示
    items.push({
      id: 'record',
      label: '交易紀錄',
      icon: 'account_balance_wallet',
      route: '/dashboard/record'
    });
    
    return items;
  });

  // 檢查是否同時擁有多個角色
  hasMultipleRoles = computed(() => {
    return this.roles().length > 1;
  });
}
