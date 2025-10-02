import {
  Component,
  input,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'tmf-input-textarea',
  imports: [FormsModule],
  templateUrl: './input-textarea.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextarea implements ControlValueAccessor {
  ctrlDir = inject(NgControl, { self: true });
  value = signal('');
  isDisabled = signal(false);
  onTouched: any;
  private _onChange: any;

  cdr = inject(ChangeDetectorRef);

  // 輸入屬性
  placeholder = input<string>('');
  rows = input<number>(5);
  maxLength = input<number | null>(null);
  showCounter = input<boolean>(true);

  // 計算屬性
  currentLength = computed(() => this.value().length);
  counterText = computed(() => {
    const max = this.maxLength();
    if (max !== null) {
      return `${this.currentLength()} / ${max}`;
    }
    return `${this.currentLength()}`;
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

  onChange($event: Event) {
    const textarea = $event.target as HTMLTextAreaElement;
    this.value.set(textarea.value);
    this._onChange(textarea.value);
  }

  onBlur() {
    if (this.onTouched) {
      this.onTouched();
    }
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
}
