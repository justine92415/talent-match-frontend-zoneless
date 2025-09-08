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
  output
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';

export interface SearchOption {
  value: string;
  label: string;
}

export interface GlobalSearchValue {
  type: string;
  query: string;
}

@Component({
  selector: 'tmf-input-global-search',
  imports: [MatIconModule],
  templateUrl: './input-global-search.html',
  styles: ``,
})
export class InputGlobalSearch implements ControlValueAccessor, OnDestroy {
  @ViewChild('searchContainer', { read: ElementRef }) searchContainer!: ElementRef;
  @ViewChild('dropdownTemplate') dropdownTemplate!: TemplateRef<any>;

  // Input properties
  placeholder = input<string>('準備好啟程了嗎？');
  
  // Output events
  searchSubmit = output<GlobalSearchValue>();

  // Search options
  searchOptions = signal<SearchOption[]>([
    { value: 'course', label: '依課程' },
    { value: 'teacher', label: '依教師' }
  ]);

  // Control state
  private _selectedOption = signal<SearchOption>(this.searchOptions()[0]);
  private _searchValue = signal<string>('');
  isDisabled = signal<boolean>(false);
  isDropdownOpen = signal<boolean>(false);

  // Computed properties
  selectedOption = computed(() => this._selectedOption());
  searchValue = computed(() => this._searchValue());

  // Control value accessor callbacks
  private onChangeCallback = (value: GlobalSearchValue) => {};
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
  writeValue(value: GlobalSearchValue): void {
    if (value) {
      // Find matching search option
      const option = this.searchOptions().find(opt => opt.value === value.type);
      if (option) {
        this._selectedOption.set(option);
      }
      this._searchValue.set(value.query || '');
    }
  }

  registerOnChange(fn: (value: GlobalSearchValue) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // Event handlers
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this._searchValue.set(query);
    this.emitValue();
  }

  onTouched(): void {
    this.onTouchedCallback();
  }

  onSearchClick(): void {
    this.performSearch();
  }

  // Dropdown methods
  toggleDropdown(): void {
    if (this.isDisabled()) return;
    
    if (this.isDropdownOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.overlayRef || !this.searchContainer) return;

    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.close(),
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(this.searchContainer)
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

    this.isDropdownOpen.set(true);
  }

  closeDropdown(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.isDropdownOpen.set(false);
  }

  selectSearchType(option: SearchOption): void {
    this._selectedOption.set(option);
    this.emitValue();
    this.closeDropdown();
  }

  // Helper methods
  private emitValue(): void {
    const value: GlobalSearchValue = {
      type: this.selectedOption().value,
      query: this.searchValue()
    };
    this.onChangeCallback(value);
  }

  private performSearch(): void {
    const value: GlobalSearchValue = {
      type: this.selectedOption().value,
      query: this.searchValue()
    };
    this.searchSubmit.emit(value);
  }
}
