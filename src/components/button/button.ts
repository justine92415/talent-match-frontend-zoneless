import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TmfIconType } from '@share/icon.enum';

type ButtonIconPosition = 'left' | 'right';
type ButtonIconName = TmfIconType;
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';

@Component({
  selector: 'tmf-button',
  imports: [MatIconModule],
  templateUrl: './button.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Button {
  iconPosition = input<ButtonIconPosition>('right');
  iconName = input<ButtonIconName>(null);
  variant = input<ButtonVariant>('primary');
  disabled = input<boolean>(false);
  customClasses = input<string>('');

  // 預計算按鈕樣式
  buttonClasses = computed(() => {
    const variant = this.variant();
    const isDisabled = this.disabled();
    const baseClasses = 'w-full h-full box-border flex justify-center gap-1 items-center px-4 rounded-lg transition-colors duration-200';
    
    // disabled 狀態覆蓋所有 variant 樣式
    if (isDisabled) {
      const iconClasses = this.iconName() && this.iconPosition() === 'left' ? 'flex-row-reverse' : '';
      const paddingClasses = this.iconName() && this.iconPosition() === 'right' ? 'pr-2' : '';
      
      return [baseClasses, 'border-grey-9f bg-grey-9f text-white cursor-not-allowed', iconClasses, paddingClasses]
        .filter(Boolean)
        .join(' ');
    }

    if (this.customClasses()) {
      return [baseClasses, this.customClasses()]
        .filter(Boolean)
        .join(' ');
    }

    // 正常狀態的 variant 樣式
    const variantClasses = {
      primary: 'text-white bg-primary hover:bg-purple cursor-pointer',
      secondary: 'text-primary border border-primary hover:bg-primary hover:text-white cursor-pointer',
      tertiary: 'text-primary bg-white hover:text-white hover:bg-primary cursor-pointer',
      ghost: 'text-white bg-transparent border border-white hover:bg-white hover:text-primary cursor-pointer'
    };

    const iconClasses = this.iconName() && this.iconPosition() === 'left' ? 'flex-row-reverse' : '';
    const paddingClasses = this.iconName() && this.iconPosition() === 'right' ? 'pr-2' : '';
    
    return [baseClasses, variantClasses[variant], iconClasses, paddingClasses]
      .filter(Boolean)
      .join(' ');
  });
}
