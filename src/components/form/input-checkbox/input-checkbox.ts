import {
  Component,
  input,
  signal,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'tmf-input-checkbox',
  imports: [],
  templateUrl: './input-checkbox.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputCheckbox implements ControlValueAccessor, OnInit {
  ctrlDir = inject(NgControl, { self: true });
  cdr = inject(ChangeDetectorRef);

  // 內部狀態
  value = signal(false);
  isDisabled = signal(false);
  onTouched: any;
  private _onChange: any;

  // 輸入屬性
  label = input<string>('');
  labelPosition = input<'before' | 'after'>('after'); // label 在 checkbox 前或後

  constructor() {
    this.ctrlDir.valueAccessor = this;
  }

  ngOnInit(): void {
    this.ctrlDir.statusChanges?.pipe(
      distinctUntilChanged(),
    ).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  // 處理 checkbox 變更事件
  onChange($event: Event) {
    const input = $event.target as HTMLInputElement;
    const newValue = input.checked;
    this.value.set(newValue);
    if (this._onChange) {
      this._onChange(newValue);
    }
  }

  // 處理 label 點擊事件
  onLabelClick(checkboxInput: HTMLInputElement) {
    if (!this.isDisabled()) {
      checkboxInput.click();
    }
  }

  // ControlValueAccessor 實作
  writeValue(obj: any): void {
    const boolValue = obj === true || obj === 'true';
    this.value.set(boolValue);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
