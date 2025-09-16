import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TmfIconType } from '@share/icon.enum';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'tmf-input-number',
  imports: [FormsModule, MatIconModule],
  templateUrl: './input-number.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    /* 隱藏數字輸入框的增減按鈕 */
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type="number"] {
      -moz-appearance: textfield;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumber implements ControlValueAccessor {
  ctrlDir = inject(NgControl, { self: true });
  value = signal<number | null>(null);
  isDisabled = signal(false);
  onTouched: any;
  private _onChange: any;

  cdr = inject(ChangeDetectorRef);

  // 輸入屬性
  placeholder = input<string>('');
  iconName = input<TmfIconType | null>(null);
  min = input<number | null>(null);
  max = input<number | null>(null);
  step = input<number>(1);
  suffix = input<string>('');
  readonly = input<boolean>(false);

  // 輸出事件
  iconClick = output<void>();

  // 計算屬性
  hasIcon = computed(() => this.iconName() !== null);
  safeIconName = computed(() => this.iconName() || '');
  hasSuffix = computed(() => this.suffix() !== '');

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

  onChange($event: Event) {
    const input = $event.target as HTMLInputElement;
    const value = input.value === '' ? null : parseFloat(input.value);
    this.value.set(value);
    this._onChange(value);
  }

  onBlur() {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  writeValue(obj: any): void {
    if (typeof obj === 'number' || obj === null) {
      this.value.set(obj);
    }
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

  onIconClick() {
    if (!this.isDisabled()) {
      this.iconClick.emit();
    }
  }

  // 取得顯示值
  getDisplayValue(): string {
    const val = this.value();
    return val !== null ? val.toString() : '';
  }
}