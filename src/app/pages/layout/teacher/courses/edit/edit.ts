import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { MatIcon } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { InputText } from '@components/form/input-text/input-text';
import { InputNumber } from '@components/form/input-number/input-number';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { CourseManagementService } from '@app/api/generated/course-management/course-management.service';
import { TagsService } from '@app/api/generated/tags/tags.service';
import { TagItem, VideoBasicInfo } from '@app/api/generated/talentMatchAPI.schemas';
import { Cities } from '@share/cities';
import { VideoSelectorDialog } from '@components/dialogs/video-selector/video-selector';
import { VideoCard, VideoCardData } from '@components/video-card/video-card';
import { VideoViewerDialogComponent } from '@components/dialogs/video-viewer/video-viewer-dialog';


@Component({
  selector: 'tmf-course-edit',
  imports: [
    ReactiveFormsModule,
    MatIcon,
    Button,
    InputText,
    InputNumber,
    InputSelect,
    VideoCard
  ],
  templateUrl: './edit.html',
  styles: ``
})
export default class CourseEdit implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(Dialog);
  private courseService = inject(CourseManagementService);
  private tagsService = inject(TagsService);

  // 表單
  courseForm: FormGroup;

  // 課程 ID
  courseId = signal<number | null>(null);

  // 載入狀態
  isLoading = signal(true);
  error = signal<string | null>(null);

  // 圖片預覽
  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);

  // 短影音
  selectedVideos = signal<VideoBasicInfo[]>([]);

  // 城市選項 (值改為字串)
  cities = signal<SelectOption[]>([
    { value: '臺北市', label: '臺北市' },
    { value: '基隆市', label: '基隆市' },
    { value: '新北市', label: '新北市' },
    { value: '連江縣', label: '連江縣' },
    { value: '宜蘭縣', label: '宜蘭縣' },
    { value: '新竹市', label: '新竹市' },
    { value: '新竹縣', label: '新竹縣' },
    { value: '桃園市', label: '桃園市' },
    { value: '苗栗縣', label: '苗栗縣' },
    { value: '臺中市', label: '臺中市' },
    { value: '彰化縣', label: '彰化縣' },
    { value: '南投縣', label: '南投縣' },
    { value: '嘉義市', label: '嘉義市' },
    { value: '嘉義縣', label: '嘉義縣' },
    { value: '雲林縣', label: '雲林縣' },
    { value: '臺南市', label: '臺南市' },
    { value: '高雄市', label: '高雄市' },
    { value: '澎湖縣', label: '澎湖縣' },
    { value: '金門縣', label: '金門縣' },
    { value: '屏東縣', label: '屏東縣' },
    { value: '臺東縣', label: '臺東縣' },
    { value: '花蓮縣', label: '花蓮縣' }
  ]);

  // 區域選項 (根據城市動態過濾)
  districts = signal<SelectOption[]>([]);

  // 標籤資料
  tagsData = signal<TagItem[]>([]);

  // 主類別選項 (從 API 動態載入)
  mainCategories = signal<SelectOption[]>([]);

  // 當前選中的主類別 ID
  selectedMainCategoryId = signal<number | null>(null);

  constructor() {
    this.courseForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.maxLength(2000)]],
      main_category_id: [null, Validators.required],
      sub_category_id: [null, Validators.required],
      city: [null, Validators.required],
      district: [{ value: '', disabled: true }, Validators.maxLength(50)],
      address: ['', Validators.maxLength(200)],
      survey_url: [''],
      purchase_message: ['', Validators.maxLength(500)],
      course_plans: this.fb.array([this.createCoursePlanGroup(true)])
    });

    // 監聽城市變更，更新區域選項並啟用/停用區域選擇
    this.courseForm.get('city')?.valueChanges.subscribe((city: string | null) => {
      this.updateDistrictOptions(city);
      this.courseForm.get('district')?.setValue('');

      // 根據城市是否有值來啟用或停用區域欄位
      if (city) {
        this.courseForm.get('district')?.enable();
      } else {
        this.courseForm.get('district')?.disable();
      }
    });
  }

  /**
   * 更新區域選項 - 根據選擇的城市從 Cities 資料動態生成
   * @param city 選擇的城市名稱
   */
  updateDistrictOptions(city: string | null) {
    this.districts.set([]);

    if (!city) {
      return;
    }

    // 找到對應的城市資料
    const selectedCity = Cities.find(cityData => cityData.name === city);

    if (selectedCity) {
      // 將鄉鎮區轉換為選項格式
      const districtOptions: SelectOption[] = selectedCity.districts.map(district => ({
        value: district.name,
        label: district.name
      }));

      this.districts.set(districtOptions);
    }
  }

  ngOnInit() {
    // 取得路由參數中的課程 ID
    const courseIdParam = this.route.snapshot.params['id'];
    const courseId = parseInt(courseIdParam);
    if (!isNaN(courseId)) {
      this.courseId.set(courseId);
    } else {
      this.error.set('無效的課程 ID');
      this.isLoading.set(false);
      return;
    }

    // 載入標籤資料
    this.loadTags();

    // 監聽主類別變更，清空次類別選擇
    this.courseForm.get('main_category_id')?.valueChanges.subscribe((mainCategoryId) => {
      this.selectedMainCategoryId.set(mainCategoryId);
      this.courseForm.get('sub_category_id')?.setValue(null);
    });

    // 載入課程資料
    this.loadCourseData();
  }

  // 載入標籤資料
  private loadTags(): void {
    this.tagsService.getApiTags().subscribe({
      next: (response) => {
        this.tagsData.set(response.data);

        // 更新主類別選項
        const mainCategoryOptions = response.data.map(tag => ({
          value: tag.id,
          label: tag.main_category
        }));
        this.mainCategories.set(mainCategoryOptions);
      },
      error: (error) => {
        this.error.set('載入標籤資料失敗');
      }
    });
  }

  // 載入課程資料
  private loadCourseData(): void {
    const courseId = this.courseId();
    if (!courseId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.courseService.getApiCoursesIdEdit(courseId).subscribe({
      next: (response) => {
        if (response.data && response.data.course) {
          this.populateForm(response.data.course, response.data.course.price_options || []);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        let errorMessage = '載入課程資料失敗';
        if (error.status === 404) {
          errorMessage = '課程不存在';
        } else if (error.status === 403) {
          errorMessage = '您沒有權限編輯此課程';
        }
        this.error.set(errorMessage);
        this.isLoading.set(false);
      }
    });
  }

  // 填入表單資料
  private populateForm(courseData: any, priceOptions: any[]): void {
    // 清空現有的課程方案
    while (this.coursePlans.length !== 0) {
      this.coursePlans.removeAt(0);
    }

    // 填入基本資料
    this.courseForm.patchValue({
      name: courseData.name,
      content: courseData.content,
      main_category_id: courseData.main_category_id,
      sub_category_id: courseData.sub_category_id,
      city: courseData.city,
      district: courseData.district,
      address: courseData.address,
      survey_url: courseData.survey_url,
      purchase_message: courseData.purchase_message
    });

    // 如果有城市資料，更新區域選項並啟用區域欄位
    if (courseData.city) {
      this.updateDistrictOptions(courseData.city);
      this.courseForm.get('district')?.enable();
    }

    // 設定主類別選中狀態
    this.selectedMainCategoryId.set(courseData.main_category_id);

    // 填入課程方案
    if (priceOptions.length > 0) {
      priceOptions.forEach((plan, index) => {
        const planGroup = this.createCoursePlanGroup(index === 0);
        planGroup.patchValue({
          quantity: plan.quantity,
          price: plan.price
        });
        this.coursePlans.push(planGroup);
      });
    } else {
      // 如果沒有價格方案，建立預設方案
      this.coursePlans.push(this.createCoursePlanGroup(true));
    }

    // 設定圖片預覽
    if (courseData.main_image) {
      this.imagePreview.set(courseData.main_image);
    }

    // 載入選擇的短影音
    if (courseData.selected_videos && Array.isArray(courseData.selected_videos)) {
      const videos: VideoBasicInfo[] = courseData.selected_videos
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((item: any) => item.video_info)
        .filter((video: any) => video !== null && video !== undefined);
      this.selectedVideos.set(videos);
    }
  }

  // 建立課程計劃表單群組
  private createCoursePlanGroup(isDefault: boolean = false): FormGroup {
    return this.fb.group({
      quantity: isDefault
        ? [{ value: 1, disabled: true }, [Validators.required, Validators.min(1)]]
        : [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  // 取得課程計劃表單陣列
  get coursePlans(): FormArray {
    return this.courseForm.get('course_plans') as FormArray;
  }

  // 新增課程計劃
  addCoursePlan(): void {
    this.coursePlans.push(this.createCoursePlanGroup(false));
  }

  // 移除課程計劃 (第一個方案不可刪除)
  removeCoursePlan(index: number): void {
    if (this.coursePlans.length > 1 && index > 0) {
      this.coursePlans.removeAt(index);
    }
  }

  // 檢查是否可以刪除此方案
  canRemovePlan(index: number): boolean {
    return this.coursePlans.length > 1 && index > 0;
  }

  // 檢查是否為第一個方案（堂數固定）
  isDefaultPlan(index: number): boolean {
    return index === 0;
  }

  // 取得可選擇的次類別
  getAvailableSubCategories(): SelectOption[] {
    const mainCategoryId = this.selectedMainCategoryId();
    if (!mainCategoryId) return [];

    const selectedMainCategory = this.tagsData().find(tag => tag.id === mainCategoryId);
    if (!selectedMainCategory) return [];

    return selectedMainCategory.sub_category.map(sub => ({
      value: sub.id,
      label: sub.name
    }));
  }

  // 處理圖片上傳
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // 檢查檔案類型
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('請選擇 JPG、PNG 或 WebP 格式的圖片');
        return;
      }

      // 檢查檔案大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片檔案大小不能超過 5MB');
        return;
      }

      this.imageFile.set(file);

      // 產生預覽
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // 移除圖片
  removeImage(): void {
    this.imagePreview.set(null);
    this.imageFile.set(null);
    // 清空 input
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  // 開啟短影音選擇 dialog
  openVideoSelector(): void {
    const dialogRef = this.dialog.open(VideoSelectorDialog, {
      data: {
        selectedVideoIds: this.selectedVideos().map(v => v.id).filter(Boolean),
        maxSelection: 3
      },
      width: '90vw',
      maxWidth: '1200px',
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.selectedVideos.set(result as VideoBasicInfo[]);
      }
    });
  }

  // 移除選擇的短影音
  removeVideo(videoId: number, event: Event): void {
    event.stopPropagation();
    this.selectedVideos.set(
      this.selectedVideos().filter(v => v.id !== videoId)
    );
  }

  // 將 VideoBasicInfo 轉換為 VideoCardData
  convertToVideoCardData(video: VideoBasicInfo): VideoCardData {
    return {
      id: video.id?.toString() || '',
      tag: video.category || '未分類',
      description: video.intro || video.name || '',
      videoSrc: video.url || undefined,
      isPlaying: false
    };
  }

  // 開啟影片預覽
  openVideoViewer(video: VideoBasicInfo, index: number): void {
    const videoCards = this.selectedVideos().map(v => this.convertToVideoCardData(v));

    this.dialog.open(VideoViewerDialogComponent, {
      data: {
        videos: videoCards,
        initialIndex: index
      },
      panelClass: 'video-viewer-dialog-panel',
      backdropClass: 'video-viewer-backdrop',
      hasBackdrop: true,
      disableClose: false
    });
  }

  // 儲存課程
  saveCourse(): void {
    if (this.courseForm.valid) {
      const courseId = this.courseId();
      if (!courseId) return;

      const formData = this.courseForm.getRawValue();

      // 準備課程基本資料（包含短影音）
      const courseData = {
        name: formData.name,
        content: formData.content,
        main_category_id: formData.main_category_id,
        sub_category_id: formData.sub_category_id,
        city: formData.city,
        district: formData.district || null,
        address: formData.address || null,
        survey_url: formData.survey_url || null,
        purchase_message: formData.purchase_message || null,
        selectedVideos: this.selectedVideos()
          .filter(v => v.id)
          .map((v, index) => ({
            video_id: v.id!,
            display_order: index + 1
          }))
      };

      // 準備價格方案資料
      const priceOptions = formData.course_plans.map((plan: any) => ({
        price: plan.price,
        quantity: plan.quantity
      }));

      // 準備 API 請求資料
      const requestData = {
        courseData: JSON.stringify(courseData),
        priceOptions: JSON.stringify(priceOptions),
        courseImage: this.imageFile() || null
      };

      this.courseService.putApiCoursesId(courseId, requestData).subscribe({
        next: () => {
          alert('課程更新成功！');
          this.goBack();
        },
        error: (error) => {
          this.handleSaveError(error);
        }
      });
    } else {
      alert('請填寫所有必填欄位');
    }
  }

  // 處理儲存錯誤
  private handleSaveError(error: any): void {
    let errorMessage = '課程更新失敗，請稍後再試。';

    if (error.status === 400) {
      errorMessage = '請檢查輸入的資料是否正確。';
    } else if (error.status === 401) {
      errorMessage = '請先登入後再更新課程。';
    } else if (error.status === 403) {
      errorMessage = '您沒有權限更新此課程。';
    } else if (error.status === 404) {
      errorMessage = '課程不存在。';
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

  // 返回課程列表
  private goBack(): void {
    this.router.navigate(['/dashboard/teacher/courses']);
  }

  // 重新載入資料
  refresh(): void {
    this.loadCourseData();
  }
}