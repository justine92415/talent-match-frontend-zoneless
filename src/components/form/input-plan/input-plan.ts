import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'tmf-input-plan',
  imports: [CurrencyPipe],
  templateUrl: './input-plan.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPlan implements ControlValueAccessor {
  // Input properties
  title = input.required<string>();
  price = input.required<number>();
  value = input.required<string>();
  name = input<string>('');

  // Control state
  private _value = signal<string>('');
  isDisabled = signal<boolean>(false);

  // Control value accessor callbacks
  private onChangeCallback = (value: any) => {};
  private onTouchedCallback = () => {};

  // NgControl injection for form integration
  ctrlDir = inject(NgControl, { self: true });

  constructor() {
    // Connect this component as value accessor
    if (this.ctrlDir) {
      this.ctrlDir.valueAccessor = this;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this._value.set(value || '');
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // Event handlers
  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this._value.set(value);
    this.onChangeCallback(value);
  }

  onTouched(): void {
    this.onTouchedCallback();
  }
}
