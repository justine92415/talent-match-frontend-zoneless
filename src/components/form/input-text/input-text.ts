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
  selector: 'tmf-input-text',
  imports: [FormsModule, MatIconModule],
  templateUrl: './input-text.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputText implements ControlValueAccessor {
  ctrlDir = inject(NgControl, { self: true });
  value = signal('');
  isDisabled = signal(false);
  onTouched: any;
  private _onChange: any;

  cdr = inject(ChangeDetectorRef);

  // 輸入屬性
  placeholder = input<string>('');
  iconName = input<TmfIconType | null>(null);
  type = input<'text' | 'email' | 'password' | 'search'>('text');

  // 輸出事件
  iconClick = output<void>();

  // 計算屬性
  hasIcon = computed(() => this.iconName() !== null);
  safeIconName = computed(() => this.iconName() || '');

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
    this._onChange(input.value);
  }

  writeValue(obj: any): void {
    if (typeof obj !== 'string') return;
    this.value.set(obj);
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
}
function takeUntilDestroyed(): import("rxjs").OperatorFunction<any, unknown> {
  throw new Error('Function not implemented.');
}

