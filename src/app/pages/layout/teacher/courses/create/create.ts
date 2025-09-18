import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { InputText } from '@components/form/input-text/input-text';
import { InputNumber } from '@components/form/input-number/input-number';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { CourseManagementService } from '@app/api/generated/course-management/course-management.service';
import { CourseStatusManagementService } from '@app/api/generated/course-status-management/course-status-management.service';
import { TagsService } from '@app/api/generated/tags/tags.service';
import { TagItem } from '@app/api/generated/talentMatchAPI.schemas';
import { Cities } from '@share/cities';

@Component({
  selector: 'tmf-course-create',
  imports: [
    ReactiveFormsModule,
    MatIcon,
    Button,
    InputText,
    InputNumber,
    InputSelect
  ],
  templateUrl: './create.html',
  styles: ``
})
export default class CourseCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private courseService = inject(CourseManagementService);
  private courseStatusService = inject(CourseStatusManagementService);
  private tagsService = inject(TagsService);

  // 表單
  courseForm: FormGroup;

  // 圖片預覽
  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);

  // 課程 ID (儲存後用於提交審核)
  savedCourseId = signal<number | null>(null);

  // 城市選項 (使用 ID 對應 API 需求)
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
      district: ['', Validators.maxLength(50)],
      address: ['', Validators.maxLength(200)],
      survey_url: [''],
      purchase_message: ['', Validators.maxLength(500)],
      course_plans: this.fb.array([this.createCoursePlanGroup(true)])
    });

    // 監聽城市變更，更新區域選項並清空區域選擇
    this.courseForm.get('city')?.valueChanges.subscribe((city: string | null) => {
      this.updateDistrictOptions(city);
      this.courseForm.get('district')?.setValue('');
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
    // 載入標籤資料
    this.loadTags();

    // 監聽主類別變更，清空次類別選擇
    this.courseForm.get('main_category_id')?.valueChanges.subscribe((mainCategoryId) => {
      this.selectedMainCategoryId.set(mainCategoryId);
      this.courseForm.get('sub_category_id')?.setValue(null);
    });
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
        console.error('載入標籤資料失敗:', error);
      }
    });
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

  // 儲存課程
  saveCourse(): void {
    if (this.courseForm.valid) {
      const formData = this.courseForm.getRawValue();

      // 準備課程基本資料
      const courseData = {
        name: formData.name,
        content: formData.content,
        main_category_id: formData.main_category_id,
        sub_category_id: formData.sub_category_id,
        city: formData.city,
        district: formData.district || null,
        address: formData.address || null,
        survey_url: formData.survey_url || null,
        purchase_message: formData.purchase_message || null
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
        courseImage: this.imageFile() || undefined
      };

      console.log('準備發送資料:', requestData);

      // 呼叫 API 建立課程
      this.courseService.postApiCourses(requestData).subscribe({
        next: (response) => {
          console.log('課程建立成功:', response);
          alert('課程建立成功！');
          this.goBack();
        },
        error: (error) => {
          console.error('課程建立失敗:', error);
          this.handleSaveError(error);
        }
      });
    } else {
      alert('請填寫所有必填欄位');
    }
  }


  // 處理儲存錯誤
  private handleSaveError(error: any): void {
    let errorMessage = '課程建立失敗，請稍後再試。';

    if (error.status === 400) {
      errorMessage = '請檢查輸入的資料是否正確。';
    } else if (error.status === 401) {
      errorMessage = '請先登入後再建立課程。';
    } else if (error.status === 403) {
      errorMessage = '您沒有權限建立課程。';
    } else if (error.status === 413) {
      errorMessage = '圖片檔案過大，請選擇小於 10MB 的圖片。';
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
  goBack(): void {
    this.router.navigate(['/dashboard/teacher/courses']);
  }
}