import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from '@components/button/button';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { VideoManagementService } from '@app/api/generated/video-management/video-management.service';
import { TagsService } from '@app/api/generated/tags/tags.service';
import { VideoBasicInfo, VideoDetailSuccessResponseData } from '@app/api/generated/talentMatchAPI.schemas';

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
      if (!videoId) return;

      const formData = this.videoForm.value;

      // TODO: 實作影片更新 API 呼叫
      // this.videoService.putApiVideosId(videoId, formData).subscribe({
      //   next: (response) => {
      //     console.log('影片更新成功:', response);
      //     alert('影片更新成功！');
      //     this.goBack();
      //   },
      //   error: (error) => {
      //     console.error('影片更新失敗:', error);
      //     this.handleSaveError(error);
      //   }
      // });

      // 暫時顯示成功訊息
      alert('影片更新成功！（模擬）');
      this.goBack();
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
}