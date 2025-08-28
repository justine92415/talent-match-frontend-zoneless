import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SectionTitle } from '@components/components/section-title/section-title';
import { VideoCard, VideoCardData } from '@components/video-card/video-card';
import { TmfIconEnum } from '@share/icon.enum';
import { Swiper } from 'swiper';
import { Navigation } from 'swiper/modules';

@Component({
  selector: 'tmf-home',
  imports: [SectionTitle, VideoCard, MatIcon],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.html',
  styles: ``
})
export default class Home implements AfterViewInit {
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;
  private swiper!: Swiper;

  videos: VideoCardData[] = [
    {
      imageSrc: '/assets/images/reel_cooking_1.jpg',
      imageAlt: '烹飪教學影片',
      tag: '烹飪料理',
      description: '只要五分鐘，讓您彷彿擁有專業主廚的刀工！',
      isPlaying: true
    },
    {
      imageSrc: '/assets/images/reel_art_1.jpg',
      imageAlt: '藝術創作影片',
      tag: '藝術創作',
      description: '放鬆身體，一切感官交給畫筆，帶領我們走向心海',
      isPlaying: false
    },
    {
      imageSrc: '/assets/images/reel_cooking_2.jpg',
      imageAlt: '甜點教學影片',
      tag: '烹飪料理',
      description: '只要學會杯子蛋糕，任何甜點都難不了你，還在等什麼呢？',
      isPlaying: false
    },
    {
      imageSrc: '/assets/images/reel_finance.jpg',
      imageAlt: '理財投資影片',
      tag: '理財投資',
      description: '存股加碼 009*0，月領 3 萬不是夢，讓大師來解密如何做好資產配置',
      isPlaying: false
    },
    {
      imageSrc: '/assets/images/reel_cooking_3.jpg',
      imageAlt: '泡麵教學影片',
      tag: '烹飪料理',
      description: '好驚人～～～教你如何煮出Q彈好吃的泡麵！',
      isPlaying: false
    }
  ];

  ngAfterViewInit() {
    this.initSwiper();
  }

  private initSwiper() {
    this.swiper = new Swiper(this.swiperContainer.nativeElement, {
      modules: [Navigation],
      slidesPerView: 4,
      spaceBetween: 24,
      navigation: {
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 16,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        1280: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
      },
    });
  }

  get TmfIcon() {
    return TmfIconEnum;
  }
}
