import {
  Injectable,
  TemplateRef,
  ViewContainerRef,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayPositionBuilder,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subject, takeUntil } from 'rxjs';

// 下拉選單模板的上下文類型
interface DropdownTemplateContext {
  $implicit: any; // 預設隱含值
}

// 位置策略配置型別
interface PositionConfig {
  originX: 'start' | 'center' | 'end';
  originY: 'top' | 'center' | 'bottom';
  overlayX: 'start' | 'center' | 'end';
  overlayY: 'top' | 'center' | 'bottom';
  offsetX?: number;
  offsetY?: number;
}

interface DropdownConfig {
  templateRef: TemplateRef<DropdownTemplateContext>;
  overlayRef: OverlayRef | null;
  positionStrategy: PositionConfig;
}

@Injectable()
export class DropdownManagerService {
  private dropdownConfigs = new Map<string, DropdownConfig>();

  // 追蹤當前開啟的下拉選單
  private readonly activeDropdownId = signal<string | null>(null);

  // 計算是否有任何下拉選單開啟
  readonly hasOpenDropdown = computed(() => this.activeDropdownId() !== null);

  // 取得當前開啟的下拉選單 ID
  readonly currentActiveDropdown = computed(() => this.activeDropdownId());

  constructor(
    private overlay: Overlay,
    private overlayPositionBuilder: OverlayPositionBuilder
  ) {}

  // 註冊下拉選單配置
  registerDropdown(
    id: string,
    templateRef: TemplateRef<DropdownTemplateContext>,
    positionStrategy: PositionConfig
  ): void {
    this.dropdownConfigs.set(id, {
      templateRef,
      overlayRef: null,
      positionStrategy,
    });
  }

  // 切換下拉選單狀態
  toggleDropdown(
    id: string,
    trigger: HTMLElement,
    viewContainerRef: ViewContainerRef
  ): void {
    const config = this.dropdownConfigs.get(id);
    if (!config) return;

    // 檢查當前下拉選單是否已開啟
    const isCurrentOpen = this.activeDropdownId() === id;

    // 先關閉所有下拉選單
    this.closeAllDropdowns();

    // 如果當前下拉選單原本是關閉的，則開啟它
    if (!isCurrentOpen) {
      this.openDropdown(id, trigger, viewContainerRef);
    }
  }

  // 開啟下拉選單
  private openDropdown(
    id: string,
    trigger: HTMLElement,
    viewContainerRef: ViewContainerRef
  ): void {
    try {
      const config = this.dropdownConfigs.get(id);
      if (!config) {
        console.warn(`下拉選單配置不存在：${id}`);
        return;
      }

      if (!config.templateRef) {
        console.error(`模板引用不存在：${id}`);
        return;
      }

      const positionStrategy = this.overlayPositionBuilder
        .flexibleConnectedTo(trigger)
        .withPositions([
          {
            originX: config.positionStrategy.originX,
            originY: config.positionStrategy.originY,
            overlayX: config.positionStrategy.overlayX,
            overlayY: config.positionStrategy.overlayY,
            offsetY: config.positionStrategy.offsetY || 0,
            offsetX: config.positionStrategy.offsetX || 0,
          },
        ]);

      config.overlayRef = this.overlay.create({
        positionStrategy,
        hasBackdrop: false,
        scrollStrategy: this.overlay.scrollStrategies.close(),
      });

      if (!config.overlayRef) {
        console.error(`Overlay 建立失敗：${id}`);
        return;
      }

      const portal = new TemplatePortal(config.templateRef, viewContainerRef);
      config.overlayRef.attach(portal);

      // 更新活動下拉選單 signal
      this.activeDropdownId.set(id);

      // 使用 outsidePointerEvents 監聽外部點擊來關閉下拉選單
      config.overlayRef.outsidePointerEvents().subscribe(() => {
        // 點擊外部任何地方都關閉下拉選單
        // outsidePointerEvents 已經確保點擊的是外部區域
        this.closeDropdown(id);
      });
    } catch (error) {
      console.error(`開啟下拉選單時發生錯誤：${id}`, error);
      this.closeDropdown(id);
    }
  }

  // 關閉指定下拉選單
  closeDropdown(id: string): void {
    try {
      const config = this.dropdownConfigs.get(id);
      if (!config || !config.overlayRef) return;

      if (config.overlayRef.hasAttached()) {
        config.overlayRef.detach();
      }
      config.overlayRef.dispose();
      config.overlayRef = null;

      // 如果關閉的是當前活動的下拉選單，更新 signal
      if (this.activeDropdownId() === id) {
        this.activeDropdownId.set(null);
      }
    } catch (error) {
      console.error(`關閉下拉選單時發生錯誤：${id}`, error);
      const config = this.dropdownConfigs.get(id);
      if (config) {
        config.overlayRef = null;
      }
      // 確保 signal 狀態正確
      if (this.activeDropdownId() === id) {
        this.activeDropdownId.set(null);
      }
    }
  }

  // 關閉所有下拉選單
  closeAllDropdowns(): void {
    this.dropdownConfigs.forEach((_, id) => {
      this.closeDropdown(id);
    });
    // 確保 signal 狀態正確
    this.activeDropdownId.set(null);
  }

  // 檢查指定下拉選單是否開啟
  isDropdownOpen(id: string): boolean {
    return this.activeDropdownId() === id;
  }
}
