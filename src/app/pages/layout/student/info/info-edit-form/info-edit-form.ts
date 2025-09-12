import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal, ElementRef, ViewChild, effect, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { UserProfile, AvatarUploadSuccessResponse } from '@app/api/generated/talentMatchAPI.schemas';
import { UserAvatarService } from '@app/api/generated/user-avatar/user-avatar.service';
import { InputText } from "@components/form/input-text/input-text";
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'tmf-info-edit-form',
  imports: [ReactiveFormsModule, MatIconModule, InputText],
  templateUrl: './info-edit-form.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoEditForm {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  private userAvatarService = inject(UserAvatarService);

  user = input<UserProfile>();
  profileForm = input.required<FormGroup>();
  errorMessage = input<string | null>();
  
  submitForm = output<void>();
  avatarUploadSuccess = output<string>();
  avatarUploadError = output<string>();

  isUploading = signal(false);
  uploadError = signal<string | null>(null);
  currentAvatarUrl = signal<string | null>(null);
  
  onSubmit(): void {
    this.submitForm.emit();
  }

  onAvatarUpload(): void {
    this.fileInput.nativeElement.click();
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    // 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError.set('請選擇 JPG、PNG 或 WebP 格式的圖片');
      this.avatarUploadError.emit('請選擇 JPG、PNG 或 WebP 格式的圖片');
      return;
    }
    
    // 驗證檔案大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.uploadError.set('檔案大小不能超過 5MB');
      this.avatarUploadError.emit('檔案大小不能超過 5MB');
      return;
    }
    
    this.uploadAvatar(file);
  }
  
  private uploadAvatar(file: File): void {
    this.isUploading.set(true);
    this.uploadError.set(null);
    
    this.userAvatarService.postApiUploadAvatar({ avatar: file })
      .pipe(
        catchError((error) => {
          const errorMessage = error?.error?.message || '頭像上傳失敗，請稍後再試';
          this.uploadError.set(errorMessage);
          this.avatarUploadError.emit(errorMessage);
          return of(null);
        }),
        finalize(() => {
          this.isUploading.set(false);
          // 清空 input 值，允許重複選擇同一檔案
          this.fileInput.nativeElement.value = '';
        })
      )
      .subscribe((response: AvatarUploadSuccessResponse | null) => {
        if (response?.data?.user?.avatar_image) {
          this.currentAvatarUrl.set(response.data.user.avatar_image);
          this.avatarUploadSuccess.emit(response.data.user.avatar_image);
        }
      });
  }
}
