import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tmf-toggle-switch',
  imports: [CommonModule],
  templateUrl: './toggle-switch.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleSwitch {
  // 輸入屬性
  checked = input<boolean>(false);
  disabled = input<boolean>(false);
  size = input<'sm' | 'md' | 'lg'>('md');

  // 輸出事件
  toggleChange = output<boolean>();

  // 計算屬性 - 開關尺寸樣式
  switchClasses = computed(() => {
    const size = this.size();
    const sizeClasses = {
      sm: 'w-8 h-4',
      md: 'w-11 h-6',
      lg: 'w-14 h-8'
    };
    return sizeClasses[size] || sizeClasses.md;
  });

  // 計算屬性 - 圓點尺寸樣式
  knobClasses = computed(() => {
    const size = this.size();
    const sizeClasses = {
      sm: 'h-3 w-3 after:h-3 after:w-3',
      md: 'h-5 w-5 after:h-5 after:w-5',
      lg: 'h-6 w-6 after:h-6 after:w-6'
    };
    return sizeClasses[size] || sizeClasses.md;
  });

  // 計算屬性 - 容器樣式（包含禁用狀態）
  containerClasses = computed(() => {
    const isDisabled = this.disabled();
    const baseClasses = 'relative inline-flex items-center';
    const disabledClasses = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer';

    return `${baseClasses} ${disabledClasses}`;
  });

  // 計算屬性 - 背景樣式
  backgroundClasses = computed(() => {
    const isChecked = this.checked();
    const isDisabled = this.disabled();

    if (isDisabled) {
      return isChecked
        ? 'bg-grey-cc opacity-50'
        : 'bg-grey-e9 opacity-50';
    }

    return isChecked
      ? 'bg-primary'
      : 'bg-grey-d4';
  });

  // 計算屬性 - 切換位置樣式
  toggleClasses = computed(() => {
    const isChecked = this.checked();
    return isChecked ? 'after:translate-x-full after:left-[2px]' : 'after:left-[2px]';
  });

  // 處理切換事件
  onToggle(): void {
    if (this.disabled()) return;

    const newValue = !this.checked();
    this.toggleChange.emit(newValue);
  }
}