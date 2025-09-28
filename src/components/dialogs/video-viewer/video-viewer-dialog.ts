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
        },
        keyboard: {
          enabled: true,
          onlyInViewport: true,
        },
        speed: 300,
        initialSlide: this.data.initialIndex,
        on: {
          slideChange: () => {
            if (this.swiper) {
              this.currentVideoIndex.set(this.swiper.activeIndex);
              this.pauseAllVideos();
              this.playCurrentVideo();
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

  onVideoClick(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
      this.isPlaying.set(true);
    } else {
      video.pause();
      this.isPlaying.set(false);
    }
  }

  updateProgress(video: HTMLVideoElement) {
    if (video.duration) {
      this.progress.set((video.currentTime / video.duration) * 100);
    }
  }

  setProgress(event: MouseEvent) {
    // 簡化實現，暫時移除進度條點擊功能
    // 可以在後續需要時重新實現
  }

  private pauseAllVideos() {
    const videos = document.querySelectorAll('.video-viewer-video');
    videos.forEach(video => {
      if (video instanceof HTMLVideoElement) {
        video.pause();
      }
    });
    this.isPlaying.set(false);
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