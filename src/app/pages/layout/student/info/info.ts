import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { InputText } from "@components/form/input-text/input-text";
import { Button } from "@components/button/button";
import { AuthService } from '@app/services/auth.service';
import { InfoView } from './info-view/info-view';
import { InfoEditForm } from './info-edit-form/info-edit-form';

@Component({
  selector: 'tmf-info',
  imports: [ReactiveFormsModule, MatIconModule, Button, InfoView, InfoEditForm],
  templateUrl: './info.html',
  styles: ``
})
export default class Info implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  user = this.authService.user;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isEditMode = signal(false);

  profileForm!: FormGroup;

  // 選項資料
  genderOptions = [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
  ];

  regionOptions = [
    { label: '台北市', value: 'taipei' },
    { label: '新北市', value: 'new_taipei' },
    { label: '桃園市', value: 'taoyuan' },
    { label: '台中市', value: 'taichung' },
    { label: '台南市', value: 'tainan' },
    { label: '高雄市', value: 'kaohsiung' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();
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
      bio: ['', [Validators.maxLength(500)]] // 注意：UserProfile 中沒有此欄位，可能需要後端新增
    });
  }

  private loadUserData(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm.patchValue({
        nickName: currentUser.nick_name || '',
        name: currentUser.name || '',
        email: currentUser.email || '',
        gender: '', // 待後端新增欄位
        birthDate: currentUser.birthday || '',
        phone: currentUser.contact_phone || '',
        region: '', // 待後端新增欄位
        bio: '' // 待後端新增欄位
      });
    }
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
    this.loadUserData(); // 重置表單
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
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  // 字數計算
  getBioCharCount(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }
}
