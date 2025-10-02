import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function emailValidator(ctrl: AbstractControl): ValidationErrors | null {
  if (Validators.email(ctrl)) {
    return { error: '信箱格式錯誤' };
  }
  return null;
}

export function nickNameValidator(
  ctrl: AbstractControl,
): ValidationErrors | null {
  const value = ctrl.value;

  if (Validators.required(ctrl)) {
    return { error: '暱稱為必填欄位' };
  }

  if (value && value.length < 1) {
    return { error: '暱稱長度不能少於 1 個字元' };
  }

  if (value && value.length > 50) {
    return { error: '暱稱長度不能超過 50 個字元' };
  }

  return null;
}

export function userEmailValidator(
  ctrl: AbstractControl,
): ValidationErrors | null {
  const value = ctrl.value;

  if (Validators.required(ctrl)) {
    return { error: 'Email 為必填欄位' };
  }

  if (Validators.email(ctrl)) {
    return { error: 'Email 格式不正確' };
  }

  if (value && value.length > 255) {
    return { error: 'Email 長度不能超過 255 個字元' };
  }

  return null;
}

export function passwordValidator(
  ctrl: AbstractControl,
): ValidationErrors | null {
  const value = ctrl.value;

  if (Validators.required(ctrl)) {
    return { error: '密碼為必填欄位' };
  }

  if (value && value.length < 8) {
    return { error: '密碼長度不能少於 8 個字元' };
  }

  return null;
}

export function confirmPasswordValidator(
  ctrl: AbstractControl,
): ValidationErrors | null {
  if (Validators.required(ctrl)) {
    return { error: '確認密碼為必填欄位' };
  }

  return null;
}

export function passwordMatchValidator(
  form: AbstractControl,
): ValidationErrors | null {
  const password = form.get('password');
  const confirmPassword = form.get('confirmPassword');

  // 只有當兩個欄位都有輸入值時才進行匹配檢查
  if (!password?.value || !confirmPassword?.value) {
    return null;
  }

  if (password.value !== confirmPassword.value) {
    // 只設置錯誤，不要手動觸發更新
    confirmPassword.setErrors({
      error: '密碼與確認密碼不相符',
      passwordMismatch: true,
    });
    confirmPassword.markAsTouched();
    return { passwordMismatch: true };
  } else {
    // 只移除特定錯誤，不要手動觸發更新
    if (
      confirmPassword.hasError('error') &&
      confirmPassword.hasError('passwordMismatch')
    ) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
}
