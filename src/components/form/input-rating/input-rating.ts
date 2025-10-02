import {
  Component,
  input,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'tmf-input-rating',
  imports: [MatIconModule],
  templateUrl: './input-rating.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputRating implements ControlValueAccessor {
  ctrlDir = inject(NgControl, { self: true });
  value = signal<number>(0);
  hoverValue = signal<number>(0);
  isDisabled = signal(false);
  onTouched: any;
  private _onChange: any;

  cdr = inject(ChangeDetectorRef);

  // 輸入屬性
  maxRating = input<number>(5);
  size = input<'sm' | 'md' | 'lg'>('md');

  // 計算屬性
  stars = computed(() => Array.from({ length: this.maxRating() }, (_, i) => i + 1));
  iconSize = computed(() => {
    const sizeMap = {
      sm: '!text-2xl !w-6 !h-6',
      md: '!text-5xl !w-12 !h-12',
      lg: '!text-6xl !w-16 !h-16',
    };
    return sizeMap[this.size()];
  });

  // 為每顆星星計算是否填滿的狀態
  starFilled = computed(() => {
    const filled: boolean[] = [];
    const currentValue = this.value();
    const currentHover = this.hoverValue();

    for (let i = 1; i <= this.maxRating(); i++) {
      // 如果已評分，完全忽略 hover，只顯示已選評分
      if (currentValue > 0) {
        filled.push(i <= currentValue);
      } else if (currentHover > 0) {
        // 未評分時才使用 hover 效果
        filled.push(i <= currentHover);
      } else {
        filled.push(false);
      }
    }
    return filled;
  });

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

  onStarClick(rating: number): void {
    if (this.isDisabled()) return;
    this.value.set(rating);
    this._onChange(rating);
    if (this.onTouched) {
      this.onTouched();
    }
  }

  onStarHover(rating: number): void {
    if (this.isDisabled() || this.value() > 0) return;
    this.hoverValue.set(rating);
  }

  onMouseLeave(): void {
    if (this.value() > 0) return;
    this.hoverValue.set(0);
  }

  writeValue(obj: any): void {
    if (typeof obj === 'number') {
      this.value.set(obj);
    } else {
      this.value.set(0);
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
}
