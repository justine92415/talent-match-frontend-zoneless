import { Component, inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  showCancel?: boolean; // 用於區分 confirm 和 alert
}

@Component({
  selector: 'tmf-confirm-dialog',
  imports: [CommonModule, Button, MatIcon],
  templateUrl: './confirm-dialog.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class ConfirmDialog {
  private dialogRef = inject(DialogRef);
  protected data = inject<ConfirmDialogData>(DIALOG_DATA);

  get iconClass(): string {
    switch (this.data?.type) {
      case 'warning':
        return 'text-orange-55';
      case 'error':
        return 'text-red-50';
      case 'success':
        return 'text-green-55';
      default:
        return 'text-primary';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}