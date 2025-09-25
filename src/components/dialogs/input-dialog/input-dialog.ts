import { Component, inject, computed } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@components/button/button';
import { InputText } from '@components/form/input-text/input-text';
import { MatIcon } from '@angular/material/icon';

export interface InputDialogData {
  title?: string;
  message?: string;
  inputLabel?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  required?: boolean;
  defaultValue?: string;
  validator?: (value: string) => string | null; // 自定義驗證器，回傳錯誤訊息或null
}

@Component({
  selector: 'tmf-input-dialog',
  imports: [CommonModule, Button, MatIcon, InputText, ReactiveFormsModule],
  templateUrl: './input-dialog.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class InputDialog {
  private dialogRef = inject(DialogRef);
  private fb = inject(FormBuilder);
  protected data = inject<InputDialogData>(DIALOG_DATA);

  // 表單組
  form: FormGroup = this.fb.group({
    inputValue: [this.data?.defaultValue || '']
  });

  // 錯誤訊息計算信號
  errorMessage = computed(() => {
    const value = this.form.get('inputValue')?.value?.trim() || '';

    // 必填驗證
    if (this.data?.required && !value) {
      return '此欄位為必填';
    }

    // 自定義驗證器
    if (this.data?.validator && value) {
      return this.data.validator(value);
    }

    return '';
  });

  // 驗證是否有效
  isValid = computed(() => {
    const value = this.form.get('inputValue')?.value?.trim() || '';

    // 必填檢查
    if (this.data?.required && !value) {
      return false;
    }

    // 自定義驗證器檢查
    if (this.data?.validator && value) {
      return !this.data.validator(value);
    }

    return true;
  });

  // 確認按鈕
  onConfirm(): void {
    if (this.isValid()) {
      const value = this.form.get('inputValue')?.value?.trim() || '';
      this.dialogRef.close(value);
    }
  }

  // 取消按鈕
  onCancel(): void {
    this.dialogRef.close(null);
  }
}