import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { Button } from '@components/button/button';
import { Table } from '@components/table/table';
import Pagination from '@components/pagination/pagination';
import { VideoCard, VideoCardData } from '@components/video-card/video-card';
import { VideoViewerDialogComponent, VideoViewerDialogData } from '@components/dialogs/video-viewer/video-viewer-dialog';
import { VideoManagementService } from '@app/api/generated/video-management/video-management.service';
import { VideoBasicInfo, GetApiVideosParams } from '@app/api/generated/talentMatchAPI.schemas';

@Component({
  selector: 'tmf-videos',
  imports: [CommonModule, Button, Table, Pagination, VideoCard],
  templateUrl: './videos.html',
  styles: ``
})
export default class Videos {
  private router = inject(Router);
  private videoService = inject(VideoManagementService);

  // 分頁參數
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // rxResource 用於載入影片資料
  videosResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      per_page: this.itemsPerPage()
    }),
    stream: ({ params }) => this.videoService.getApiVideos({
      page: params.page,
      per_page: params.per_page
    } as any)
  });

  // 計算屬性
  isLoading = computed(() => this.videosResource.isLoading());
  loadError = computed(() => this.videosResource.error()?.message || null);
  videos = computed(() => {
    const response = this.videosResource.value();
    return (response as any)?.data?.videos || [];
  });
  totalResults = computed(() => {
    const response = this.videosResource.value();
    return (response as any)?.data?.videos?.length || 0;
  });

  // 轉換為 VideoCardData 格式
  videoCards = computed(() => {
    const videos = this.videos();
    return videos.map((video: VideoBasicInfo) => {
      const cardData = {
        id: video.id?.toString() || video.uuid || '',
        tag: video.category || '未分類',
        description: video.intro || video.name || '無描述',
        videoSrc: video.url
      } as VideoCardData;
      return cardData;
    });
  });

  constructor(private dialog: Dialog) {}

  // 頁面切換
  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  // 新增影片
  goToCreateVideo(): void {
    this.router.navigate(['/dashboard/teacher/videos/create']);
  }

  // 播放影片
  playVideo(video: VideoBasicInfo): void {
    const videoIndex = this.videos().findIndex((v: VideoBasicInfo) => v.id === video.id);
    this.openVideoViewer(videoIndex);
  }

  // 當 video-card 被點擊時
  onVideoCardClick(videoCard: VideoCardData): void {
    const videoIndex = this.videoCards().findIndex((v: VideoCardData) => v.id === videoCard.id);
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
    this.router.navigate(['/dashboard/teacher/videos/edit', videoId]);
  }

  // 刪除影片
  deleteVideo(videoId: string): void {
    // TODO: 呼叫刪除 API 並重新載入資料
  }

  // 影片預覽 hover 事件
  onVideoPreviewEnter(videoElement: HTMLVideoElement): void {
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.play().catch(() => {
        // 播放失敗時靜默處理
      });
    }
  }

  onVideoPreviewLeave(videoElement: HTMLVideoElement): void {
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  }
}
