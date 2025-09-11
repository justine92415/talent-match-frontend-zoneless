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
import { InfoView } from './info-view/info-view';
import { InfoEditForm } from './info-edit-form/info-edit-form';
import { InfoViewSkeleton } from './info-view-skeleton/info-view-skeleton';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'tmf-info',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    Button,
    InfoView,
    InfoEditForm,
    InfoViewSkeleton,
    JsonPipe
  ],
  templateUrl: './info.html',
  styles: ``,
})
export default class Info implements OnInit {
  private fb = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);

  // 使用 resource API 獲取用戶資料，並使用 switchMap 轉換為 UserProfile
  userProfileResource = rxResource({
    stream: () =>
      this.authenticationService
        .getApiAuthProfile()
        .pipe(
          delay(1000 * 3),
          switchMap((response) => of(response.data?.user))
        ),
  });

  // 直接從 resource 中獲取 UserProfile
  user = this.userProfileResource.value;

  // 保留原有的信號以支持表單提交
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isEditMode = signal(false);

  profileForm!: FormGroup;

  private userDataEffect = effect(() => {
    this.loadUserData();
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      nickName: ['', [Validators.required, Validators.minLength(2)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      birthDate: [''],
      phone: ['', [Validators.pattern(/^09\d{8}$/)]],
      bio: ['', [Validators.maxLength(500)]], // 注意：UserProfile 中沒有此欄位，可能需要後端新增
    });
  }

  private loadUserData(): void {
    const currentUser = this.user();
    if (currentUser && this.profileForm) {
      this.profileForm.patchValue({
        nickName: currentUser.nick_name || '',
        name: currentUser.name || '',
        email: currentUser.email || '',
        birthDate: currentUser.birthday || '',
        phone: currentUser.contact_phone || '',
      });
    }
  }

  onSubmit(): void {
    if ( this.profileForm.invalid ) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formData = this.profileForm.getRawValue();
    console.log('Profile data to save:', formData);

    // TODO: 實作 API 調用
    setTimeout(() => {
      this.isLoading.set(false);
      console.log('Profile saved successfully');
    }, 1000);
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
    console.log('Upload avatar');
  }
}
