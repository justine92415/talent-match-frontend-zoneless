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
  Renderer2,
  DOCUMENT,
  ChangeDetectionStrategy
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'tmf-input-select',
  imports: [MatIconModule],
  templateUrl: './input-select.html',
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    :host ::ng-deep .cdk-overlay-pane {
      background: white !important;
      border: 1px solid #F97316 !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputSelect implements ControlValueAccessor, OnDestroy {
  @ViewChild('trigger', { read: ElementRef }) trigger!: ElementRef;
  @ViewChild('dropdownTemplate') dropdownTemplate!: TemplateRef<any>;

  // Input properties
  placeholder = input<string>('請選擇');
  options = input.required<SelectOption[]>();

  // Control state
  private _value = signal<any>(null);
  isDisabled = signal<boolean>(false);
  isOpen = signal<boolean>(false);

  // Computed properties
  selectedValue = computed(() => this._value());
  selectedLabel = computed(() => {
    const option = this.options().find(opt => opt.value === this._value());
    return option?.label || '';
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
    this._value.set(value);
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
      width: this.trigger.nativeElement.offsetWidth,
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

  selectOption(option: SelectOption): void {
    this._value.set(option.value);
    this.onChangeCallback(option.value);
    this.onTouchedCallback();
    this.closeDropdown();
  }
}
