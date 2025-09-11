import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '@app/services/auth.service';

type Role = 'student' | 'teacher';

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
  `
})
export class DashboardSidebar implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;
  roles = this.authService.roles;
  
  // 當前顯示的角色 (用於控制 sidebar 顯示內容)
  currentRole = signal<Role>('student');

  ngOnInit(): void {
    // 根據當前路由設置默認角色
    this.initializeCurrentRole();
  }

  private initializeCurrentRole(): void {
    const url = this.router.url;
    if (url.includes('/dashboard/teacher')) {
      this.currentRole.set('teacher');
    } else if (url.includes('/dashboard/student')) {
      this.currentRole.set('student');
    } else {
      // 默認根據用戶角色設置
      const userRoles = this.roles();
      if (userRoles.includes('teacher')) {
        this.currentRole.set('teacher');
      } else if (userRoles.includes('student')) {
        this.currentRole.set('student');
      }
    }
  }

  // 角色顯示標籤
  roleLabel = computed(() => {
    const current = this.currentRole();
    return current === 'student' ? '學生' : 
           current === 'teacher' ? '教師' : '用戶';
  });

  // 根據當前選擇的角色生成導航選單
  navigationItems = computed<SidebarMenuItem[]>(() => {
    const current = this.currentRole();
    
    if (current === 'student') {
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
    } else if (current === 'teacher') {
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

  // 檢查是否可以切換角色
  canSwitchRole = computed(() => {
    const userRoles = this.roles();
    return userRoles.includes('student') && userRoles.includes('teacher');
  });

  // 獲取切換目標角色的標籤
  switchTargetLabel = computed(() => {
    const current = this.currentRole();
    return current === 'student' ? '切換為教師' : '切換為學生';
  });

  // 切換角色功能
  switchRole(): void {
    const current = this.currentRole();
    
    // 檢查用戶是否擁有多重角色
    if (!this.canSwitchRole()) {
      console.warn('用戶沒有多重角色，無法切換');
      return;
    }
    
    if (current === 'student') {
      this.currentRole.set('teacher');
      this.router.navigate(['/dashboard/teacher']);
    } else if (current === 'teacher') {
      this.currentRole.set('student');
      this.router.navigate(['/dashboard/student']);
    }
  }
}
