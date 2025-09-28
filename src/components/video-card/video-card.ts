import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VideoCardData {
  id: string;
  imageSrc: string;
  imageAlt: string;
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
  @Input() video: VideoCardData = {
    id: '',
    imageSrc: '',
    imageAlt: '',
    tag: '',
    description: '',
    isPlaying: false,
  };

  @Output() videoClick = new EventEmitter<VideoCardData>();

  onVideoClick() {
    this.videoClick.emit(this.video);
  }
}
