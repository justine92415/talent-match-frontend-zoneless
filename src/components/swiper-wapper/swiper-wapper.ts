import { Component, input, viewChild, ElementRef, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Swiper } from 'swiper';
import { Navigation } from 'swiper/modules';

export interface SwiperConfig {
  slidesPerView: number;
  spaceBetween: number;
  breakpoints?: {
    [key: number]: {
      slidesPerView: number;
      spaceBetween: number;
    };
  };
}

@Component({
  selector: 'tmf-swiper-wapper',
  imports: [MatIcon],
  templateUrl: './swiper-wapper.html',
  styles: ``
})
export class SwiperWapper implements AfterViewInit, OnDestroy {
  swiperContainer = viewChild.required<ElementRef>('swiperContainer');
  
  config = input<SwiperConfig>({
    slidesPerView: 4,
    spaceBetween: 24,
    breakpoints: {
      320: { slidesPerView: 1, spaceBetween: 16 },
      768: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
      1280: { slidesPerView: 4, spaceBetween: 24 }
    }
  });
  
  navigationId = input('');

  private swiper?: Swiper;
  canGoPrev = signal(false);
  canGoNext = signal(true);

  ngAfterViewInit() {
    this.initSwiper();
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }

  private initSwiper() {
    const containerEl = this.swiperContainer();
    if (!containerEl) return;

    const currentConfig = this.config();
    const currentNavigationId = this.navigationId();

    // 始終啟用 navigation，但不指定具體的按鈕元素
    const navigationConfig = currentNavigationId ? {
      nextEl: `.swiper-button-next-${currentNavigationId}`,
      prevEl: `.swiper-button-prev-${currentNavigationId}`,
    } : {
      enabled: true
    };

    this.swiper = new Swiper(containerEl.nativeElement, {
      modules: [Navigation],
      slidesPerView: currentConfig.slidesPerView,
      spaceBetween: currentConfig.spaceBetween,
      navigation: navigationConfig,
      breakpoints: currentConfig.breakpoints,
      on: {
        slideChange: () => {
          this.updateNavigationState();
        },
        init: () => {
          this.updateNavigationState();
        }
      }
    });
  }

  private updateNavigationState() {
    if (this.swiper) {
      this.canGoPrev.set(!this.swiper.isBeginning);
      this.canGoNext.set(!this.swiper.isEnd);
    }
  }

  goPrev() {
    if (this.swiper && this.canGoPrev()) {
      this.swiper.slidePrev();
    }
  }

  goNext() {
    if (this.swiper && this.canGoNext()) {
      this.swiper.slideNext();
    }
  }

  get TmfIcon() {
    return TmfIconEnum;
  }
}
