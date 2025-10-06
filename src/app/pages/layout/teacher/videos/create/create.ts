import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { VideoManagementService } from '@app/api/generated/video-management/video-management.service';
import { TagsService } from '@app/api/generated/tags/tags.service';
import { TagItem } from '@app/api/generated/talentMatchAPI.schemas';
import { InputText } from '@components/form/input-text/input-text';

@Component({
  selector: 'tmf-video-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    MatIconModule,
    InputText,
    InputSelect
],
  templateUrl: './create.html',
  styles: ``
})
export default class VideoCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private videoService = inject(VideoManagementService);
  private tagsService = inject(TagsService);

  // 表單
  videoForm: FormGroup;

  // 影片檔案
  videoFile = signal<File | null>(null);
  videoPreview = signal<string | null>(null);

  // 狀態
  isLoading = signal(false);
  uploadProgress = signal(0);

  // 標籤資料
  tagsData = signal<TagItem[]>([]);

  // 主類別選項 (從 API 動態載入)
  mainCategories = signal<SelectOption[]>([]);

  // 當前選中的主類別 ID
  selectedMainCategoryId = signal<number | null>(null);

  constructor() {
    this.videoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
      category: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      intro: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]]
    });
  }

  ngOnInit() {
    // 載入標籤資料
    this.loadTags();
  }

  // 載入標籤資料
  private loadTags(): void {
    this.tagsService.getApiTags().subscribe({
      next: (response) => {
        this.tagsData.set(response.data);

        // 更新主類別選項
        const mainCategoryOptions = response.data.map(tag => ({
          value: tag.main_category,
          label: tag.main_category
        }));

        // 去重複
        const uniqueCategories = mainCategoryOptions.filter((category, index, self) =>
          index === self.findIndex(c => c.value === category.value)
        );

        this.mainCategories.set(uniqueCategories);
      },
      error: (error) => {
        console.error('載入分類資料失敗:', error);
        alert('載入分類資料失敗，請重新整理頁面。');
      }
    });
  }

  // 處理影片檔案選擇
  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // 檢查檔案類型
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        alert('請選擇 MP4、AVI、MOV 或 WMV 格式的影片檔案');
        return;
      }

      // 檢查檔案大小 (500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert('影片檔案大小不能超過 500MB');
        return;
      }

      this.videoFile.set(file);

      // 產生預覽 (可選)
      const url = URL.createObjectURL(file);
      this.videoPreview.set(url);
    }
  }

  // 移除影片檔案
  removeVideo(): void {
    this.videoFile.set(null);
    if (this.videoPreview()) {
      URL.revokeObjectURL(this.videoPreview()!);
      this.videoPreview.set(null);
    }

    // 清空 input
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  // 提交表單
  submitVideo(): void {
    if (this.videoForm.valid && this.videoFile()) {
      const formData = this.videoForm.value;

      this.isLoading.set(true);
      this.uploadProgress.set(0);

      // 準備 API 請求資料
      const requestData = {
        name: formData.name,
        category: formData.category,
        intro: formData.intro,
        videoFile: this.videoFile()!
      };

      // 呼叫 API 上傳影片
      this.videoService.postApiVideos(requestData).subscribe({
        next: (response) => {
          alert('短影音上傳成功！');
          this.goBack();
        },
        error: (error) => {
          this.handleUploadError(error);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      if (!this.videoForm.valid) {
        alert('請填寫所有必填欄位');
      } else if (!this.videoFile()) {
        alert('請選擇要上傳的影片檔案');
      }
    }
  }

  // 處理上傳錯誤
  private handleUploadError(error: any): void {
    let errorMessage = '影片上傳失敗，請稍後再試。';

    if (error.status === 400) {
      errorMessage = '請檢查輸入的資料或影片檔案格式是否正確。';
    } else if (error.status === 401) {
      errorMessage = '請先登入後再上傳影片。';
    } else if (error.status === 403) {
      errorMessage = '您沒有權限上傳影片。';
    } else if (error.status === 413) {
      errorMessage = '影片檔案過大，請選擇小於 500MB 的影片。';
    } else if (error.status >= 500) {
      errorMessage = '伺服器暫時無法處理請求，請稍後再試。';
    }

    alert(errorMessage);
  }

  // 取消並返回
  cancel(): void {
    if (confirm('確定要離開嗎？未儲存的變更將會遺失。')) {
      this.goBack();
    }
  }

  // 返回影片列表
  goBack(): void {
    this.router.navigate(['/dashboard/teacher/videos']);
  }

  // 取得檔案大小的可讀格式
  getFileSizeText(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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