import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TmfIconSize, TmfIconType } from './tmf-icon.type';

@Component({
  selector: 'app-tmf-icon',
  imports: [MatIconModule],
  templateUrl: './tmf-icon.html',
  styleUrl: './tmf-icon.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class TmfIcon {
  iconName = input.required<TmfIconType>();
  iconSize = input<TmfIconSize>('medium');
  iconFill = input(false);

  fontIcon = computed(() =>
    this.iconFill() ? this.iconName() : `${this.iconName()}_outline`
  );
}
