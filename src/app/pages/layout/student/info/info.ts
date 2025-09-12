import { rxResource } from '@angular/core/rxjs-interop';
import { delay, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Component, inject, OnInit, signal, effect } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { AuthenticationService } from '@app/api/generated/authentication/authentication.service';
import { AuthService } from '@app/services/auth.service';
import { InfoView } from './info-view/info-view';
import { InfoEditForm } from './info-edit-form/info-edit-form';
import { InfoViewSkeleton } from './info-view-skeleton/info-view-skeleton';

@Component({
  selector: 'tmf-info',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    Button,
    InfoView,
    InfoEditForm,
    InfoViewSkeleton,
  ],
  templateUrl: './info.html',
  styles: ``,
})
export default class Info {
  private fb = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private authService = inject(AuthService);

  // 使用 resource API 獲取用戶資料，並使用 switchMap 轉換為 UserProfile
  userProfileResource = rxResource({
    stream: () =>
      this.authenticationService
        .getApiAuthProfile()
        .pipe(switchMap((response) => of(response.data?.user))),
  });

  // 直接從 resource 中獲取 UserProfile
  user = this.userProfileResource.value;

  // 保留原有的信號以支持表單提交
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isEditMode = signal(false);

  profileForm = this.fb.nonNullable.group({
    nick_name: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    ],
    name: ['', [Validators.maxLength(100)]],
    email: [{ value: '', disabled: true }],
    birthday: [''],
    contact_phone: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]], // 修改為可選
  });

  private userDataEffect = effect(() => {
    this.loadUserData();
  });

  private loadUserData(): void {
    const currentUser = this.user();
    if (currentUser && this.profileForm) {
      const userData = {
        nick_name: currentUser.nick_name || '',
        name: currentUser.name || '',
        email: currentUser.email || '',
        birthday: currentUser.birthday || '',
        contact_phone: currentUser.contact_phone || '',
      };
      this.profileForm.patchValue(userData);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { nick_name, name, birthday, contact_phone } =
      this.profileForm.getRawValue();

    // 構造 API 請求參數，對應 UpdateProfileRequest 介面
    const updateRequest = {
      nick_name,
      name,
      birthday,
      contact_phone,
    };

    this.authenticationService.putApiAuthProfile(updateRequest).subscribe({
      next: ({ data }) => {
        this.isLoading.set(false);
        if (data?.user) {
          this.user.update(() => data.user);
          // 同步更新 AuthService 中的使用者資料，讓 header 也能同步
          this.authService.updateUserProfile(data.user);
        }

        // 切換回檢視模式
        this.isEditMode.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.loadUserData();
        
        this.handleApiError(error);
      },
    });
  }

  onCancel(): void {
    this.loadUserData();
    this.isEditMode.set(false);
  }

  toggleEditMode(): void {
    this.isEditMode.set(!this.isEditMode());
    if (this.isEditMode()) {
      this.errorMessage.set(null);
    }
  }

  private handleApiError(error: any): void {
    // 處理驗證錯誤
    if (error?.error?.code === 'VALIDATION_ERROR' && error?.error?.errors) {
      const errors = error.error.errors;
      
      // 建立友善的錯誤訊息
      const errorMessages: string[] = [];
      
      // 欄位名稱對應表
      const fieldNames: Record<string, string> = {
        'nick_name': '暱稱',
        'name': '真實姓名',
        'birthday': '生日',
        'contact_phone': '手機號碼',
        'email': '信箱'
      };
      
      Object.entries(errors).forEach(([field, messages]) => {
        const fieldName = fieldNames[field] || field;
        if (Array.isArray(messages)) {
          messages.forEach(msg => {
            errorMessages.push(`${fieldName}: ${msg}`);
          });
        }
      });
      
      this.errorMessage.set(errorMessages.join('、'));
    } else {
      // 處理其他錯誤
      if (error?.error?.message) {
        this.errorMessage.set(error.error.message);
      } else {
        this.errorMessage.set('更新個人資料時發生錯誤，請稍後再試。');
      }
    }
  }

  onAvatarUpload(): void {
    // TODO: 實作頭像上傳功能
  }
}
