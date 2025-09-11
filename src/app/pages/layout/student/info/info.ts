import { rxResource } from '@angular/core/rxjs-interop';
import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InputText } from '@components/form/input-text/input-text';
import { Button } from '@components/button/button';
import { AuthService } from '@app/services/auth.service';
import { AuthenticationService } from '@app/api/generated/authentication/authentication.service';
import { UserProfile } from '@app/api/generated/talentMatchAPI.schemas';
import { InfoView } from './info-view/info-view';
import { InfoEditForm } from './info-edit-form/info-edit-form';

@Component({
  selector: 'tmf-info',
  imports: [ReactiveFormsModule, MatIconModule, Button, InfoView, InfoEditForm],
  templateUrl: './info.html',
  styles: ``,
})
export default class Info implements OnInit {
  private fb = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);

  // 使用 resource API 獲取用戶資料
  userProfileResource = rxResource({
    stream: () => this.authenticationService.getApiAuthProfile(),
  });

  // 從 resource 中提取用戶資料並創建計算屬性
  user = this.userProfileResource.value


  // 保留原有的信號以支持表單提交
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isEditMode = signal(false);

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      nickName: ['', [Validators.required, Validators.minLength(2)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      gender: [''], // 注意：UserProfile 中沒有此欄位，可能需要後端新增
      birthDate: [''],
      phone: ['', [Validators.pattern(/^09\d{8}$/)]],
      region: [''], // 注意：UserProfile 中沒有此欄位，可能需要後端新增
      bio: ['', [Validators.maxLength(500)]], // 注意：UserProfile 中沒有此欄位，可能需要後端新增
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const formData = this.profileForm.getRawValue();
      console.log('Profile data to save:', formData);

      // TODO: 實作 API 調用
      setTimeout(() => {
        this.isLoading.set(false);
        console.log('Profile saved successfully');
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.isEditMode.set(false);
  }

  toggleEditMode(): void {
    this.isEditMode.set(!this.isEditMode());
    if (this.isEditMode()) {
      this.errorMessage.set(null);
    }
  }

  onAvatarUpload(): void {
    // TODO: 實作頭像上傳
    console.log('Upload avatar');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  // 字數計算
  getBioCharCount(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }
}
