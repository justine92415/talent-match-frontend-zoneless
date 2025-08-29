import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VideoCardData {
  imageSrc: string;
  imageAlt: string;
  tag: string;
  description: string;
  isPlaying?: boolean;
}

@Component({
  selector: 'tmf-video-card',
  imports: [],
  templateUrl: './video-card.html',
  styles: ``,
})
export class VideoCard {
  @Input() video: VideoCardData = {
    imageSrc: '',
    imageAlt: '',
    tag: '',
    description: '',
    isPlaying: false,
  };
}
