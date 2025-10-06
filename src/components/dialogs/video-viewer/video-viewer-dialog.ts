import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  signal,
  Inject,
  AfterViewInit
} from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { VideoCardData } from '../../video-card/video-card';
import Swiper from 'swiper';
import { Navigation, Mousewheel, Keyboard } from 'swiper/modules';

export interface VideoViewerDialogData {
  videos: VideoCardData[];
  initialIndex: number;
}

@Component({
  selector: 'tmf-video-viewer-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './video-viewer-dialog.html',
  styleUrl: './video-viewer-dialog.css'
})
export class VideoViewerDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer', { static: true }) swiperContainer!: ElementRef;

  private swiper?: Swiper;
  currentVideoIndex = signal(0);
  isPlaying = signal(false);
  progress = signal(0);

  constructor(
    public dialogRef: DialogRef<boolean, VideoViewerDialogComponent>,
    @Inject(DIALOG_DATA) public data: VideoViewerDialogData
  ) {}

  ngOnInit() {
    this.currentVideoIndex.set(this.data.initialIndex);
  }

  ngAfterViewInit() {
    this.initSwiper();
    setTimeout(() => {
      this.playCurrentVideo();
    }, 100);
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }

  private initSwiper() {
    setTimeout(() => {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        modules: [Navigation, Mousewheel, Keyboard],
        direction: 'vertical',
        mousewheel: {
          enabled: true,
          forceToAxis: true,
          sensitivity: 1,
          releaseOnEdges: true,
        },
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
        speed: 600,
        longSwipesRatio: 0.3,
        longSwipesMs: 300,
        shortSwipes: false,
        threshold: 50,
        touchRatio: 1,
        touchAngle: 45,
        resistance: true,
        resistanceRatio: 0.85,
        initialSlide: this.data.initialIndex,
        on: {
          slideChange: () => {
            if (this.swiper) {
              this.currentVideoIndex.set(this.swiper.activeIndex);
              this.pauseAllVideos();
            }
          },
          slideChangeTransitionEnd: () => {
            this.playCurrentVideo();
          }
        }
      });
    }, 0);
  }

  close() {
    this.pauseAllVideos();
    this.dialogRef.close();
  }

  onVideoClick(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video.paused) {
      video.play();
      this.isPlaying.set(true);
    } else {
      video.pause();
      this.isPlaying.set(false);
    }
  }

  updateProgress(event: Event, videoIndex: number) {
    // 只更新當前活動影片的進度
    if (videoIndex !== this.currentVideoIndex()) {
      return;
    }

    const video = event.target as HTMLVideoElement;
    if (video.duration) {
      this.progress.set((video.currentTime / video.duration) * 100);
    }
  }

  setProgress(_event: MouseEvent) {
    // 簡化實現，暫時移除進度條點擊功能
    // 可以在後續需要時重新實現
  }

  private pauseAllVideos() {
    const videos = document.querySelectorAll('.video-viewer-video');
    videos.forEach(video => {
      if (video instanceof HTMLVideoElement) {
        video.pause();
        video.currentTime = 0; // 重置播放位置到開頭
      }
    });
    this.isPlaying.set(false);
    this.progress.set(0); // 重置進度條
  }

  private playCurrentVideo() {
    const currentSlide = document.querySelector('.swiper-slide-active .video-viewer-video');
    if (currentSlide instanceof HTMLVideoElement) {
      currentSlide.play().then(() => {
        this.isPlaying.set(true);
      }).catch(() => {
        this.isPlaying.set(false);
      });
    }
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}