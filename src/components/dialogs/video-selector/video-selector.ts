import { Component, inject, signal, OnInit } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { VideoManagementService } from '@app/api/generated/video-management/video-management.service';
import { VideoBasicInfo } from '@app/api/generated/talentMatchAPI.schemas';

export interface VideoSelectorDialogData {
  selectedVideoIds?: number[]; // 已選擇的影片 ID
  maxSelection?: number; // 最多可選擇幾部，預設 3
}

@Component({
  selector: 'tmf-video-selector-dialog',
  imports: [CommonModule, Button, MatIcon],
  templateUrl: './video-selector.html',
  styles: `
    :host {
      display: block;
    }
  `
})
export class VideoSelectorDialog implements OnInit {
  private dialogRef = inject(DialogRef);
  private videoService = inject(VideoManagementService);
  protected data = inject<VideoSelectorDialogData>(DIALOG_DATA);

  // 影片列表
  videos = signal<VideoBasicInfo[]>([]);

  // 已選擇的影片 ID
  selectedVideoIds = signal<number[]>([]);

  // 載入狀態
  isLoading = signal(true);

  // 錯誤訊息
  error = signal<string | null>(null);

  // 最多可選擇數量
  maxSelection = 3;

  ngOnInit() {
    // 設定最多可選擇數量
    if (this.data?.maxSelection) {
      this.maxSelection = this.data.maxSelection;
    }

    // 設定已選擇的影片
    if (this.data?.selectedVideoIds) {
      this.selectedVideoIds.set([...this.data.selectedVideoIds]);
    }

    // 載入影片列表
    this.loadVideos();
  }

  // 載入影片列表
  loadVideos(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.videoService.getApiVideos().subscribe({
      next: (response) => {
        if (response.data?.videos) {
          this.videos.set(response.data.videos);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('載入影片失敗:', error);
        this.error.set('載入影片失敗，請稍後再試');
        this.isLoading.set(false);
      }
    });
  }

  // 切換影片選擇狀態
  toggleVideo(videoId: number): void {
    const currentSelection = this.selectedVideoIds();
    const index = currentSelection.indexOf(videoId);

    if (index > -1) {
      // 已選擇，取消選擇
      this.selectedVideoIds.set(currentSelection.filter(id => id !== videoId));
    } else {
      // 未選擇，檢查是否超過最大數量
      if (currentSelection.length >= this.maxSelection) {
        alert(`最多只能選擇 ${this.maxSelection} 部影片`);
        return;
      }
      // 新增選擇
      this.selectedVideoIds.set([...currentSelection, videoId]);
    }
  }

  // 檢查影片是否已選擇
  isVideoSelected(videoId: number): boolean {
    return this.selectedVideoIds().includes(videoId);
  }

  // 確認選擇
  onConfirm(): void {
    const selectedIds = this.selectedVideoIds();
    const selectedVideos = this.videos().filter(v => v.id && selectedIds.includes(v.id));
    this.dialogRef.close(selectedVideos);
  }

  // 取消
  onCancel(): void {
    this.dialogRef.close(null);
  }
}