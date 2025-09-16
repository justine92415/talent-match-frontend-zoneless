import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { InputText } from '@components/form/input-text/input-text';
import { InputNumber } from '@components/form/input-number/input-number';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { InputMultiSelect, MultiSelectOption } from '@components/form/input-multi-select/input-multi-select';

@Component({
  selector: 'tmf-course-create',
  imports: [
    ReactiveFormsModule,
    MatIcon,
    Button,
    InputText,
    InputNumber,
    InputSelect,
    InputMultiSelect
  ],
  templateUrl: './create.html',
  styles: ``
})
export default class CourseCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // 表單
  courseForm: FormGroup;

  // 圖片預覽
  imagePreview = signal<string | null>(null);
  imageFile = signal<File | null>(null);

  // 城市選項
  cities = signal<SelectOption[]>([
    { value: '台北市', label: '台北市' },
    { value: '新北市', label: '新北市' },
    { value: '桃園市', label: '桃園市' },
    { value: '台中市', label: '台中市' },
    { value: '台南市', label: '台南市' },
    { value: '高雄市', label: '高雄市' },
    { value: '基隆市', label: '基隆市' },
    { value: '新竹市', label: '新竹市' },
    { value: '新竹縣', label: '新竹縣' },
    { value: '苗栗縣', label: '苗栗縣' },
    { value: '彰化縣', label: '彰化縣' },
    { value: '南投縣', label: '南投縣' },
    { value: '雲林縣', label: '雲林縣' },
    { value: '嘉義市', label: '嘉義市' },
    { value: '嘉義縣', label: '嘉義縣' },
    { value: '屏東縣', label: '屏東縣' },
    { value: '宜蘭縣', label: '宜蘭縣' },
    { value: '花蓮縣', label: '花蓮縣' },
    { value: '台東縣', label: '台東縣' },
    { value: '澎湖縣', label: '澎湖縣' },
    { value: '金門縣', label: '金門縣' },
    { value: '連江縣', label: '連江縣' }
  ]);

  // 主類別選項 (參考 teacher-apply)
  mainCategories = signal<SelectOption[]>([
    { value: 1, label: '學科輔導' },
    { value: 2, label: '語言學習' },
    { value: 3, label: '藝術才藝' },
    { value: 4, label: '運動健身' },
    { value: 5, label: '生活技能' }
  ]);

  // 次類別選項
  subCategories = signal([
    { id: 1, name: '數學', main_id: 1 },
    { id: 2, name: '物理', main_id: 1 },
    { id: 3, name: '化學', main_id: 1 },
    { id: 4, name: '英文', main_id: 2 },
    { id: 5, name: '日文', main_id: 2 },
    { id: 6, name: '韓文', main_id: 2 },
    { id: 7, name: '音樂', main_id: 3 },
    { id: 8, name: '繪畫', main_id: 3 },
    { id: 9, name: '舞蹈', main_id: 3 },
    { id: 10, name: '游泳', main_id: 4 },
    { id: 11, name: '健身', main_id: 4 },
    { id: 12, name: '烹飪', main_id: 5 },
    { id: 13, name: '手工藝', main_id: 5 }
  ]);

  constructor() {
    this.courseForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.maxLength(2000)]],
      main_category_id: [null, Validators.required],
      sub_category_ids: [[], Validators.required],
      city: ['', Validators.required],
      survey_url: [''],
      purchase_message: ['', Validators.maxLength(500)],
      course_plans: this.fb.array([this.createCoursePlanGroup(true)])
    });
  }

  ngOnInit() {
    // 監聽主類別變更，清空次類別選擇
    this.courseForm.get('main_category_id')?.valueChanges.subscribe(mainCategoryId => {
      this.courseForm.get('sub_category_ids')?.setValue([]);
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

  // 取得可選擇的次類別
  getAvailableSubCategories(): MultiSelectOption[] {
    const mainCategoryId = this.courseForm.get('main_category_id')?.value;
    if (!mainCategoryId) return [];
    return this.subCategories()
      .filter(sub => sub.main_id === mainCategoryId)
      .map(sub => ({ value: sub.id, label: sub.name }));
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
      const formData = this.courseForm.value;
      console.log('儲存課程資料:', formData);
      console.log('圖片檔案:', this.imageFile());

      // TODO: 呼叫 API 儲存課程
      alert('課程儲存成功！(開發中)');
      this.goBack();
    } else {
      alert('請填寫所有必填欄位');
    }
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
}