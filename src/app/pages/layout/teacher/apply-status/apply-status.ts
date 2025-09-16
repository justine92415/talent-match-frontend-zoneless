import { Component, inject, OnInit, signal } from '@angular/core';
import { TeacherApplyApiService } from '../../../teacher-apply/services/teacher-apply-api.service';
import { ApplyStatusData } from '../../../teacher-apply/types/teacher-apply.types';
import { MatIcon } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { JobCategoryPipe, DegreePipe } from '../../../../../shared/pipes';

@Component({
  selector: 'tmf-apply-status',
  imports: [MatIcon, Button, DatePipe, JobCategoryPipe, DegreePipe],
  templateUrl: './apply-status.html',
  styles: ``
})
export default class ApplyStatus implements OnInit {
  private apiService = inject(TeacherApplyApiService);
  private router = inject(Router);

  // 申請狀態資料
  applyStatus = signal<ApplyStatusData | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadApplyStatus();
  }

  private loadApplyStatus(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.checkApplyStatus().subscribe({
      next: (data) => {
        this.applyStatus.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('載入申請狀態失敗:', error);
        this.error.set('載入申請狀態時發生錯誤');
        this.isLoading.set(false);
      }
    });
  }

  // 取得狀態顯示文字
  getStatusText(): string {
    const status = this.applyStatus()?.status;
    switch (status) {
      case 'pending':
        return '審核中';
      case 'approved':
        return '已通過';
      case 'rejected':
        return '未通過';
      default:
        return '未知狀態';
    }
  }

  // 取得狀態樣式類別
  getStatusClass(): string {
    const status = this.applyStatus()?.status;
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // 前往申請頁面修改資料
  goToApplyPage(): void {
    this.router.navigate(['/teacher-apply']);
  }

  // 重新載入狀態
  refresh(): void {
    this.loadApplyStatus();
  }
}