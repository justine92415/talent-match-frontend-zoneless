import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { Button } from '@components/button/button';
import { Table } from '@components/table/table';
import Pagination from '@components/pagination/pagination';
import { VideoCard, VideoCardData } from '@components/video-card/video-card';
import { VideoViewerDialogComponent, VideoViewerDialogData } from '@components/dialogs/video-viewer/video-viewer-dialog';

export interface Video {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'tmf-videos',
  imports: [CommonModule, Button, Table, Pagination, VideoCard],
  templateUrl: './videos.html',
  styles: ``
})
export default class Videos {
  // 狀態信號
  private _isLoading = signal(false);
  private _loadError = signal<string | null>(null);
  private _videos = signal<Video[]>([]);
  private _currentPage = signal(1);
  private _totalResults = signal(0);
  private _itemsPerPage = signal(10);

  // 計算屬性
  isLoading = computed(() => this._isLoading());
  loadError = computed(() => this._loadError());
  videos = computed(() => this._videos());
  currentPage = computed(() => this._currentPage());
  totalResults = computed(() => this._totalResults());
  itemsPerPage = computed(() => this._itemsPerPage());

  // 轉換為 VideoCardData 格式
  videoCards = computed(() => {
    return this.videos().map(video => ({
      id: video.id,
      imageSrc: video.thumbnailUrl || '/assets/videos/default-thumb.jpg',
      imageAlt: video.title,
      tag: video.category,
      description: video.description,
      videoSrc: video.videoUrl
    } as VideoCardData));
  });

  constructor(private dialog: Dialog) {
    this.loadVideos();
  }

  // 載入影片資料
  private loadVideos(): void {
    this._isLoading.set(true);
    this._loadError.set(null);

    // 模擬 API 呼叫
    setTimeout(() => {
      const mockVideos: Video[] = [
        {
          id: '1',
          title: '鋼琴基礎教學 - 音階練習',
          category: '音樂',
          description: '適合初學者的鋼琴音階練習教學，從 C 大調開始學習基本指法和音階排列。',
          thumbnailUrl: '/assets/videos/piano-basics-thumb.jpg',
          videoUrl: '/assets/videos/piano-basics.mp4',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          title: '水彩畫風景技巧',
          category: '美術',
          description: '學習水彩畫的基本技巧，包括調色、暈染和風景構圖的要點。',
          thumbnailUrl: '/assets/videos/watercolor-thumb.jpg',
          videoUrl: '/assets/videos/watercolor.mp4',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20')
        },
        {
          id: '3',
          title: '基礎舞蹈動作教學',
          category: '舞蹈',
          description: '適合零基礎學員的舞蹈教學，從基本步伐開始練習身體協調性。',
          createdAt: new Date('2024-01-25'),
          updatedAt: new Date('2024-01-25')
        }
      ];

      this._videos.set(mockVideos);
      this._totalResults.set(mockVideos.length);
      this._isLoading.set(false);
    }, 1000);
  }

  // 頁面切換
  onPageChange(page: number): void {
    this._currentPage.set(page);
    this.loadVideos();
  }

  // 新增影片
  goToCreateVideo(): void {
    console.log('導航到新增影片頁面');
    // TODO: 實作導航邏輯
  }

  // 播放影片
  playVideo(video: Video): void {
    const videoIndex = this.videos().findIndex(v => v.id === video.id);
    this.openVideoViewer(videoIndex);
  }

  // 當 video-card 被點擊時
  onVideoCardClick(videoCard: VideoCardData): void {
    const videoIndex = this.videoCards().findIndex(v => v.id === videoCard.id);
    this.openVideoViewer(videoIndex);
  }

  // 開啟影片查看器
  private openVideoViewer(initialIndex: number): void {
    if (initialIndex === -1) return;

    const dialogData: VideoViewerDialogData = {
      videos: this.videoCards(),
      initialIndex: initialIndex
    };

    this.dialog.open(VideoViewerDialogComponent, {
      data: dialogData,
      panelClass: ['video-viewer-dialog'],
      hasBackdrop: true,
      disableClose: false,
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh'
    });
  }

  // 編輯影片
  editVideo(videoId: string): void {
    console.log('編輯影片 ID:', videoId);
    // TODO: 導航到編輯影片頁面
  }

  // 刪除影片
  deleteVideo(videoId: string): void {
    console.log('刪除影片 ID:', videoId);
    // TODO: 顯示確認對話框並執行刪除

    // 模擬刪除操作
    const currentVideos = this._videos();
    const updatedVideos = currentVideos.filter(video => video.id !== videoId);
    this._videos.set(updatedVideos);
    this._totalResults.set(updatedVideos.length);
  }
}
