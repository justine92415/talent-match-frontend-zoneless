import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputText {
  // 輸入屬性
  placeholder = input<string>('');
  value = input<string>('');
  iconName = input<TmfIconType | null>(null);
  disabled = input<boolean>(false);
  type = input<'text' | 'email' | 'password' | 'search'>('text');
  
  // 輸出事件
  valueChange = output<string>();
  iconClick = output<void>();
  
  // 內部狀態
  isFocused = signal(false);
  
  // 計算屬性
  hasIcon = computed(() => this.iconName() !== null);
  safeIconName = computed(() => this.iconName() || '');

  // 事件處理
  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  onFocus() {
    this.isFocused.set(true);
  }

  onBlur() {
    this.isFocused.set(false);
  }

  onIconClick() {
    if (!this.disabled()) {
      this.iconClick.emit();
    }
  }
}
