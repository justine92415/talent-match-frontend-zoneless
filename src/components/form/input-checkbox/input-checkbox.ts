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

    /* 自訂 checkbox 樣式 */
    input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 1rem;
      height: 1rem;
      border: 1px solid var(--color-grey-d4);
      border-radius: 0.25rem;
      background-color: white;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      flex-shrink: 0;
    }

    input[type="checkbox"]:checked {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }

    /* 勾勾符號 */
    input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 45%;
      transform: translate(-50%, -50%) rotate(45deg);
      width: 0.25rem;
      height: 0.5rem;
      border-right: 2px solid var(--color-orange-95);
      border-bottom: 2px solid var(--color-orange-95);
    }

    input[type="checkbox"]:focus {
      outline: none;
      ring: 2px;
      ring-color: var(--color-primary);
      ring-offset: 2px;
    }

    input[type="checkbox"]:disabled {
      cursor: not-allowed;
      opacity: 0.5;
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
