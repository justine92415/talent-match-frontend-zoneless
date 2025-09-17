import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { InputText } from '@components/form/input-text/input-text';
import { InputNumber } from '@components/form/input-number/input-number';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { CourseManagementService } from '@app/api/generated/course-management/course-management.service';
import { CourseStatusManagementService } from '@app/api/generated/course-status-management/course-status-management.service';
import { TagsService } from '@app/api/generated/tags/tags.service';
import { TagItem } from '@app/api/generated/talentMatchAPI.schemas';


@Component({
  selector: 'tmf-course-edit',
  imports: [
    ReactiveFormsModule,
    MatIcon,
    Button,
    InputText,
    InputNumber,
    InputSelect
  ],
  templateUrl: './edit.html',
  styles: ``
})
export default class CourseEdit implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseManagementService);
  private courseStatusService = inject(CourseStatusManagementService);
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

  // 城市選項 (使用 ID 對應 API 需求)
  cities = signal<SelectOption[]>([
    { value: 1, label: '臺北市' },
    { value: 2, label: '基隆市' },
    { value: 3, label: '新北市' },
    { value: 4, label: '連江縣' },
    { value: 5, label: '宜蘭縣' },
    { value: 6, label: '新竹市' },
    { value: 7, label: '新竹縣' },
    { value: 8, label: '桃園市' },
    { value: 9, label: '苗栗縣' },
    { value: 10, label: '臺中市' },
    { value: 11, label: '彰化縣' },
    { value: 12, label: '南投縣' },
    { value: 13, label: '嘉義市' },
    { value: 14, label: '嘉義縣' },
    { value: 15, label: '雲林縣' },
    { value: 16, label: '臺南市' },
    { value: 17, label: '高雄市' },
    { value: 18, label: '澎湖縣' },
    { value: 19, label: '金門縣' },
    { value: 20, label: '屏東縣' },
    { value: 21, label: '臺東縣' },
    { value: 22, label: '花蓮縣' }
  ]);

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
      city_id: [null, Validators.required],
      survey_url: [''],
      purchase_message: ['', Validators.maxLength(500)],
      course_plans: this.fb.array([this.createCoursePlanGroup(true)])
    });
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
        console.error('載入標籤資料失敗:', error);
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
        console.log('課程編輯資料:', response);
        if (response.data && response.data.course) {
          this.populateForm(response.data.course, response.data.course.price_options || []);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('載入課程資料失敗:', error);
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
      city_id: courseData.city_id,
      survey_url: courseData.survey_url,
      purchase_message: courseData.purchase_message
    });

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

  // 提交審核
  submitForReview(): void {
    if (this.courseForm.valid) {
      // 先儲存課程，然後提交審核
      this.saveCourseAndSubmit();
    } else {
      alert('請填寫所有必填欄位');
    }
  }

  // 儲存課程並提交審核
  private saveCourseAndSubmit(): void {
    const courseId = this.courseId();
    if (!courseId) return;

    const formData = this.courseForm.getRawValue();

    // 準備課程基本資料
    const courseData = {
      name: formData.name,
      content: formData.content,
      main_category_id: formData.main_category_id,
      sub_category_id: formData.sub_category_id,
      city_id: formData.city_id,
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
      courseImage: this.imageFile() || null
    };

    console.log('更新課程資料:', requestData);

    // 先更新課程
    this.courseService.putApiCoursesId(courseId, requestData).subscribe({
      next: (response) => {
        console.log('課程更新成功:', response);
        // 更新成功後提交審核
        this.submitCourseForReview(courseId);
      },
      error: (error) => {
        console.error('課程更新失敗:', error);
        this.handleSaveError(error);
      }
    });
  }

  // 提交課程審核
  private submitCourseForReview(courseId: number): void {
    this.courseStatusService.postApiCoursesIdSubmit(courseId).subscribe({
      next: () => {
        alert('課程已提交審核，等待管理員審核！');
        this.goBack();
      },
      error: (error) => {
        console.error('提交審核失敗:', error);

        let errorMessage = '提交審核失敗，但課程已更新成功。';
        if (error.status === 400) {
          errorMessage = '課程狀態不符合提交條件。';
        } else if (error.status === 403) {
          errorMessage = '您沒有權限提交此課程審核。';
        } else if (error.status === 404) {
          errorMessage = '課程不存在。';
        }

        alert(errorMessage);
        this.goBack();
      }
    });
  }

  // 儲存課程
  saveCourse(): void {
    if (this.courseForm.valid) {
      const courseId = this.courseId();
      if (!courseId) return;

      const formData = this.courseForm.getRawValue();

      // 準備課程基本資料
      const courseData = {
        name: formData.name,
        content: formData.content,
        main_category_id: formData.main_category_id,
        sub_category_id: formData.sub_category_id,
        city_id: formData.city_id,
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
        courseImage: this.imageFile() || null
      };

      console.log('更新課程資料:', requestData);

      this.courseService.putApiCoursesId(courseId, requestData).subscribe({
        next: (response) => {
          console.log('課程更新成功:', response);
          alert('課程更新成功！');
          this.goBack();
        },
        error: (error) => {
          console.error('課程更新失敗:', error);
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