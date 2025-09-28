import { Injectable, inject } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialog, ConfirmDialogData } from '@components/dialogs/confirm-dialog/confirm-dialog';
import { InputDialog, InputDialogData } from '@components/dialogs/input-dialog/input-dialog';
import { ReserveComponent } from '@components/dialogs/reserve/reserve';
import type { RemainingLessonsInfo } from '@app/api/generated/talentMatchAPI.schemas';

// Dialog 配置介面
export interface DialogConfig {
  title?: string;
  message?: string;
  data?: any;
  width?: string;
  height?: string;
  disableClose?: boolean;
  hasBackdrop?: boolean;
  panelClass?: string | string[];
}

// 確認對話框配置
export interface ConfirmDialogConfig extends DialogConfig {
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

// 輸入對話框配置
export interface InputDialogConfig extends DialogConfig {
  inputLabel?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  required?: boolean;
  defaultValue?: string;
  validator?: (value: string) => string | null;
}

// 預約對話框配置
export interface ReserveDialogConfig {
  student_id: string;
  course_id: string;
  teacher_id: string;
  course_name: string;
}


// Dialog 結果類型
export interface DialogResult<T = any> {
  confirmed: boolean;
  data?: T;
}

// 預約結果類型
export interface ReserveDialogResult {
  success: boolean;
  remainingLessons?: RemainingLessonsInfo;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialog = inject(Dialog);

  /**
   * 開啟確認對話框
   */
  openConfirm(config: ConfirmDialogConfig): Observable<DialogResult<boolean>> {
    // 預設配置
    const defaultConfig: ConfirmDialogConfig = {
      title: '確認',
      confirmText: '確認',
      cancelText: '取消',
      type: 'info',
      width: '480px',
      height: '200px',
      disableClose: false,
      hasBackdrop: true,
    };

    const finalConfig = { ...defaultConfig, ...config };

    const dialogData: ConfirmDialogData = {
      title: finalConfig.title,
      message: finalConfig.message,
      confirmText: finalConfig.confirmText,
      cancelText: finalConfig.cancelText,
      type: finalConfig.type,
      showCancel: true
    };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: dialogData,
      width: finalConfig.width,
      disableClose: finalConfig.disableClose,
      hasBackdrop: finalConfig.hasBackdrop,
      panelClass: finalConfig.panelClass
    });

    return dialogRef.closed.pipe(
      map(result => ({ confirmed: !!result, data: result as boolean }))
    );
  }

  /**
   * 開啟提示對話框 (只有確認按鈕)
   */
  openAlert(config: Omit<ConfirmDialogConfig, 'cancelText'>): Observable<DialogResult<boolean>> {
    const defaultConfig: ConfirmDialogConfig = {
      title: '提示',
      confirmText: '確認',
      type: 'info',
      width: '480px',
      height: '200px',
      disableClose: false,
      hasBackdrop: true,
    };

    const finalConfig = { ...defaultConfig, ...config };

    const dialogData: ConfirmDialogData = {
      title: finalConfig.title,
      message: finalConfig.message,
      confirmText: finalConfig.confirmText,
      type: finalConfig.type,
      showCancel: false // Alert 不顯示取消按鈕
    };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: dialogData,
      width: finalConfig.width,
      disableClose: finalConfig.disableClose,
      hasBackdrop: finalConfig.hasBackdrop,
      panelClass: finalConfig.panelClass
    });

    return dialogRef.closed.pipe(
      map(result => ({ confirmed: true, data: true })) // Alert 總是回傳 confirmed: true
    );
  }

  /**
   * 開啟自定義對話框
   */
  openCustom<T = any, R = any>(
    component: any,
    config: DialogConfig
  ): Observable<DialogResult<R>> {
    const defaultConfig = {
      width: '500px',
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'tmf-dialog-panel'
    };

    const finalConfig = { ...defaultConfig, ...config };

    const dialogRef = this.dialog.open(component, {
      data: finalConfig.data,
      width: finalConfig.width,
      height: finalConfig.height,
      disableClose: finalConfig.disableClose,
      hasBackdrop: finalConfig.hasBackdrop,
      panelClass: finalConfig.panelClass
    });

    return new Observable(observer => {
      dialogRef.closed.subscribe(result => {
        observer.next({ confirmed: !!result, data: result as R });
        observer.complete();
      });
    });
  }

  /**
   * 開啟輸入對話框
   */
  openInput(config: InputDialogConfig): Observable<DialogResult<string>> {
    // 預設配置
    const defaultConfig: InputDialogConfig = {
      title: '輸入',
      confirmText: '確認',
      cancelText: '取消',
      type: 'info',
      width: '480px',
      disableClose: false,
      hasBackdrop: true,
    };

    const finalConfig = { ...defaultConfig, ...config };

    const dialogData: InputDialogData = {
      title: finalConfig.title,
      message: finalConfig.message,
      inputLabel: finalConfig.inputLabel,
      placeholder: finalConfig.placeholder,
      confirmText: finalConfig.confirmText,
      cancelText: finalConfig.cancelText,
      type: finalConfig.type,
      required: finalConfig.required,
      defaultValue: finalConfig.defaultValue,
      validator: finalConfig.validator
    };

    const dialogRef = this.dialog.open(InputDialog, {
      data: dialogData,
      width: finalConfig.width,
      disableClose: finalConfig.disableClose,
      hasBackdrop: finalConfig.hasBackdrop,
      panelClass: finalConfig.panelClass
    });

    return dialogRef.closed.pipe(
      map(result => ({ confirmed: !!result, data: result as string }))
    );
  }

  /**
   * 開啟預約對話框
   */
  openReserve(config: ReserveDialogConfig): Observable<DialogResult<ReserveDialogResult>> {
    const dialogRef = this.dialog.open(ReserveComponent, {
      data: config,
      width: '500px',
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'tmf-dialog-panel'
    });

    return dialogRef.closed.pipe(
      map(result => ({
        confirmed: !!result,
        data: result as ReserveDialogResult
      }))
    );
  }

  /**
   * 關閉所有對話框
   */
  closeAll(): void {
    this.dialog.closeAll();
  }
}