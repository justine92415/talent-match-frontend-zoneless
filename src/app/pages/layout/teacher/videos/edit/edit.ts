import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from '@components/button/button';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { VideoManagementService } from '@app/api/generated/video-management/video-management.service';
import { TagsService } from '@app/api/generated/tags/tags.service';
import { VideoBasicInfo, PutApiVideosIdBody } from '@app/api/generated/talentMatchAPI.schemas';

@Component({
  selector: 'tmf-video-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    InputText,
    InputSelect
  ],
  templateUrl: './edit.html',
  styles: ``
})
export default class VideoEdit implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private videoService = inject(VideoManagementService);
  private tagsService = inject(TagsService);

  // 表單
  videoForm: FormGroup;

  // 影片 ID
  videoId = signal<number | null>(null);

  // 載入狀態
  isLoading = signal(true);
  error = signal<string | null>(null);

  // 影片資料
  videoData = signal<VideoBasicInfo | null>(null);

  // 影片檔案相關
  videoFile = signal<File | null>(null);
  videoPreview = signal<string | null>(null);
  uploadProgress = signal(0);
  keepOriginalVideo = signal(true); // 是否保留原影片

  // 主類別選項 (從 API 動態載入)
  mainCategories = signal<SelectOption[]>([]);

  constructor() {
    this.videoForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      category: ['', Validators.required],
      intro: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  ngOnInit() {
    // 取得路由參數中的影片 ID
    const videoIdParam = this.route.snapshot.params['id'];
    const videoId = parseInt(videoIdParam);
    if (!isNaN(videoId)) {
      this.videoId.set(videoId);
    } else {
      this.error.set('無效的影片 ID');
      this.isLoading.set(false);
      return;
    }

    // 載入標籤資料
    this.loadTags();

    // 載入影片資料
    this.loadVideoData();
  }

  // 載入標籤資料
  private loadTags(): void {
    this.tagsService.getApiTags().subscribe({
      next: (response) => {
        // 更新主類別選項
        const mainCategoryOptions = response.data.map(tag => ({
          value: tag.main_category,
          label: tag.main_category
        }));
        this.mainCategories.set(mainCategoryOptions);
      },
      error: (error) => {
        console.error('載入標籤資料失敗:', error);
        this.error.set('載入標籤資料失敗');
      }
    });
  }

  // 載入影片資料
  private loadVideoData(): void {
    const videoId = this.videoId();
    if (!videoId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.videoService.getApiVideosId(videoId).subscribe({
      next: (response) => {
        if (response.data?.video) {
          this.videoData.set(response.data.video);
          this.populateForm(response.data.video);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('載入影片資料失敗:', error);
        let errorMessage = '載入影片資料失敗';
        if (error.status === 404) {
          errorMessage = '影片不存在';
        } else if (error.status === 403) {
          errorMessage = '您沒有權限編輯此影片';
        }
        this.error.set(errorMessage);
        this.isLoading.set(false);
      }
    });
  }

  // 填入表單資料
  private populateForm(videoData: VideoBasicInfo): void {
    this.videoForm.patchValue({
      name: videoData.name || '',
      category: videoData.category || '',
      intro: videoData.intro || ''
    });
  }

  // 儲存影片
  saveVideo(): void {
    if (this.videoForm.valid) {
      const videoId = this.videoId();
      if (!videoId) {
        return;
      }

      this.isLoading.set(true);
      this.error.set(null);

      const formValues = this.videoForm.value;

      // 準備更新資料（API service 會自動處理 FormData）
      const updateData: PutApiVideosIdBody = {
        name: formValues.name,
        category: formValues.category,
        intro: formValues.intro,
        videoFile: this.videoFile() || undefined  // 可選的檔案
      };

      this.videoService.putApiVideosId(videoId, updateData).subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('影片更新成功！');
          this.goBack();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.handleSaveError(error);
        }
      });
    } else {
      alert('請填寫所有必填欄位');
    }
  }

  // 處理儲存錯誤
  private handleSaveError(error: any): void {
    let errorMessage = '影片更新失敗，請稍後再試。';

    if (error.status === 400) {
      errorMessage = '請檢查輸入的資料是否正確。';
    } else if (error.status === 401) {
      errorMessage = '請先登入後再更新影片。';
    } else if (error.status === 403) {
      errorMessage = '您沒有權限更新此影片。';
    } else if (error.status === 404) {
      errorMessage = '影片不存在。';
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
  private goBack(): void {
    this.router.navigate(['/dashboard/teacher/videos']);
  }

  // 重新載入資料
  refresh(): void {
    this.loadVideoData();
  }

  // 處理影片選擇
  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // 檢查檔案類型
      if (!['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime'].includes(file.type)) {
        alert('請選擇支援的影片格式 (MP4、AVI、MOV、WMV)');
        return;
      }

      // 檢查檔案大小 (500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert('影片檔案大小不能超過 500MB');
        return;
      }

      this.videoFile.set(file);

      // 產生預覽
      const url = URL.createObjectURL(file);
      this.videoPreview.set(url);
    }
  }

  // 移除影片（包括原影片）
  removeVideo(): void {
    this.videoFile.set(null);
    this.keepOriginalVideo.set(false);
    if (this.videoPreview()) {
      URL.revokeObjectURL(this.videoPreview()!);
      this.videoPreview.set(null);
    }
    // 清空 input
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  // 取得檔案大小文字
  getFileSizeText(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
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