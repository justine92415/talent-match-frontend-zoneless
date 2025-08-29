import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { TmfIconType } from '@share/icon.enum';

type ButtonIconPosition = 'left' | 'right';
type ButtonIconName = TmfIconType;
type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

@Component({
  selector: 'tmf-button',
  imports: [MatIconModule, NgClass],
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
}
