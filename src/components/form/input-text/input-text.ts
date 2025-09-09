import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TmfIconType } from '@share/icon.enum';

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

  
  onChange($event: Event) {
    const input = $event.target as HTMLInputElement;
    this._onChange(input.value);
  }

  writeValue(obj: any): void {
    if(typeof obj !== 'string') return;
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
