import { 
  Component, 
  ElementRef, 
  ViewChild, 
  TemplateRef,
  inject,
  input,
  signal,
  computed,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';

export interface MultiSelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'tmf-input-multi-select',
  imports: [MatIconModule],
  templateUrl: './input-multi-select.html',
  styles: `
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputMultiSelect implements ControlValueAccessor, OnDestroy {
  @ViewChild('trigger', { read: ElementRef }) trigger!: ElementRef;
  @ViewChild('dropdownTemplate') dropdownTemplate!: TemplateRef<any>;

  // Input properties
  placeholder = input<string>('請選擇');
  options = input.required<MultiSelectOption[]>();

  // Control state
  private _value = signal<any[]>([]);
  isDisabled = signal<boolean>(false);
  isOpen = signal<boolean>(false);

  // Computed properties
  selectedValues = computed(() => this._value());
  selectedLabels = computed(() => {
    const values = this._value();
    const options = this.options();
    const selectedOptions = options.filter(opt => values.includes(opt.value));
    return selectedOptions.map(opt => opt.label);
  });
  
  displayText = computed(() => {
    const labels = this.selectedLabels();
    if (labels.length === 0) return this.placeholder();
    return this.selectedLabels().join('、');
  });

  // Control value accessor callbacks
  private onChangeCallback = (value: any) => {};
  private onTouchedCallback = () => {};

  // CDK Overlay
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private overlayRef: OverlayRef | null = null;

  // NgControl injection for form integration
  ctrlDir = inject(NgControl, { self: true });

  constructor() {
    // Connect this component as value accessor
    if (this.ctrlDir) {
      this.ctrlDir.valueAccessor = this;
    }
  }

  ngOnDestroy(): void {
    this.closeDropdown();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this._value.set(Array.isArray(value) ? value : []);
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

  // Dropdown methods
  toggleDropdown(): void {
    if (this.isDisabled()) return;
    
    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.overlayRef) return;

    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.close(),
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(this.trigger)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 4
          }
        ])
        .withPush(false)
    });

    this.overlayRef = this.overlay.create(overlayConfig);
    
    // Create template portal
    const portal = new TemplatePortal(this.dropdownTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);

    // Handle backdrop clicks
    this.overlayRef.backdropClick().subscribe(() => {
      this.closeDropdown();
    });

    this.isOpen.set(true);
  }

  closeDropdown(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.isOpen.set(false);
  }

  toggleOption(option: MultiSelectOption): void {
    const currentValues = this._value();
    let newValues: any[];
    
    if (currentValues.includes(option.value)) {
      newValues = currentValues.filter(value => value !== option.value);
    } else {
      newValues = [...currentValues, option.value];
    }
    
    this._value.set(newValues);
    this.onChangeCallback(newValues);
    this.onTouchedCallback();
  }

  isOptionSelected(option: MultiSelectOption): boolean {
    return this._value().includes(option.value);
  }

  clearAll(): void {
    this._value.set([]);
    this.onChangeCallback([]);
    this.onTouchedCallback();
  }

  removeItem(label: string): void {
    const option = this.options().find(opt => opt.label === label);
    if (option) {
      this.toggleOption(option);
    }
  }
}