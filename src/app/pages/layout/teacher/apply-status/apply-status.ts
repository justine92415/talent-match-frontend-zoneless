import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeacherApplyApiService } from '../../../teacher-apply/services/teacher-apply-api.service';
import { ApplyStatusData } from '../../../teacher-apply/types/teacher-apply.types';
import { MatIcon } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { JobCategoryPipe, DegreePipe } from '../../../../../shared/pipes';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';

@Component({
  selector: 'tmf-apply-status',
  imports: [
    MatIcon,
    Button,
    DatePipe,
    JobCategoryPipe,
    DegreePipe,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption
  ],
  templateUrl: './apply-status.html',
  styles: ``
})
export default class ApplyStatus implements OnInit {
  private apiService = inject(TeacherApplyApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // 申請狀態資料
  applyStatus = signal<ApplyStatusData | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // 編輯狀態
  editingBasicInfo = signal(false);

  // 基本資料編輯表單
  basicInfoForm: FormGroup = this.fb.group({
    city: ['', Validators.required],
    district: ['', Validators.required],
    address: ['', Validators.required],
    main_category_id: [null, Validators.required],
    sub_category_ids: [[], Validators.required],
    introduction: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  // 是否可以編輯 (rejected 狀態)
  get canEdit() {
    return this.applyStatus()?.status === 'rejected';
  }

  ngOnInit() {
    this.loadApplyStatus();
  }

  private loadApplyStatus(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.checkApplyStatus().subscribe({
      next: (data) => {
        this.applyStatus.set(data);
        // 填入基本資料到表單
        if (data?.basic_info) {
          this.basicInfoForm.patchValue(data.basic_info);
        }
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

  // 基本資料編輯相關方法
  editBasicInfo(): void {
    this.editingBasicInfo.set(true);
  }

  cancelEditBasicInfo(): void {
    this.editingBasicInfo.set(false);
    // 重新載入原始資料
    const basicInfo = this.applyStatus()?.basic_info;
    if (basicInfo) {
      this.basicInfoForm.patchValue(basicInfo);
    }
  }

  saveBasicInfo(): void {
    if (this.basicInfoForm.valid) {
      this.apiService.updateBasicInfo(this.basicInfoForm.value).subscribe({
        next: () => {
          this.editingBasicInfo.set(false);
          this.refresh(); // 重新載入最新資料
        },
        error: (error: any) => {
          console.error('更新基本資料失敗:', error);
          alert('更新基本資料失敗，請稍後再試。');
        }
      });
    }
  }

  // 重新提交申請
  resubmitApplication(): void {
    if (confirm('確定要重新提交申請嗎？重新提交後狀態將變為「審核中」。')) {
      this.apiService.resubmitApplication().subscribe({
        next: () => {
          alert('申請已重新提交！審核團隊將重新審查您的資料。');
          this.refresh();
        },
        error: (error: any) => {
          console.error('重新提交申請失敗:', error);
          alert('重新提交申請失敗，請稍後再試。');
        }
      });
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