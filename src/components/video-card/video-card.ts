import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VideoCardData {
  id: string;
  tag: string;
  description: string;
  videoSrc?: string;        // 影片檔案路徑
  duration?: number;        // 影片長度（秒）
  isPlaying?: boolean;
}

@Component({
  selector: 'tmf-video-card',
  imports: [],
  templateUrl: './video-card.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoCard {
  video = input<VideoCardData>({
    id: '',
    tag: '',
    description: '',
    isPlaying: false,
  });

  videoClick = output<VideoCardData>();

  onVideoClick() {
    this.videoClick.emit(this.video());
  }

  // 滑鼠進入時播放預覽
  onMouseEnter(videoElement: HTMLVideoElement) {
    console.log('Mouse enter - video data:', this.video()); // 除錯用
    console.log('Video element:', videoElement); // 除錯用
    if (videoElement && this.video().videoSrc) {
      videoElement.currentTime = 0;
      videoElement.play().catch((error) => {
        console.error('Video play failed:', error); // 除錯用
      });
    }
  }

  // 滑鼠離開時暫停預覽
  onMouseLeave(videoElement: HTMLVideoElement) {
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  }
}
