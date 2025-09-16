import { Component, inject, signal, input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { InputMultiSelect, MultiSelectOption } from '@components/form/input-multi-select/input-multi-select';
import { TagsService } from '../../../api/generated/tags/tags.service';
import { TagItem } from '../../../api/generated/talentMatchAPI.schemas';
import { Cities } from '@share/cities';

@Component({
  selector: 'tmf-basic-info-form',
  imports: [
    InputText,
    InputSelect,
    InputMultiSelect,
    ReactiveFormsModule
  ],
  templateUrl: './basic-info-form.html',
  styles: ``
})
export class BasicInfoForm implements OnInit {
  // 輸入屬性 - 接收來自父元件的FormGroup
  formGroup = input.required<FormGroup>();

  // 注入服務
  private tagsService = inject(TagsService);

  // 原始 API 資料
  private allTags = signal<TagItem[]>([]);

  // 縣市選項 - 從 Cities 資料生成
  cityOptions: SelectOption[] = Cities.map(city => ({
    value: city.name,
    label: city.name
  }));

  // 地區選項 - 根據縣市動態載入
  districtOptions = signal<SelectOption[]>([]);

  // 教授科目選項 (主分類) - 從 API 動態載入
  subjectOptions = signal<SelectOption[]>([]);

  // 教學專長選項 (次分類) - 根據主分類動態載入
  specialtyOptions = signal<MultiSelectOption[]>([]);

  ngOnInit() {
    // 載入分類資料
    this.loadTags();

    // 在 ngOnInit 中設置表單監聽，這時 input 已經初始化
    const form = this.formGroup();

    // 初始化時檢查表單現有值，並更新對應的選項
    this.initializeOptionsFromFormValues();

    // 用來追蹤之前的值，避免初始化時誤清空
    let previousCity = form.get('city')?.value;
    let previousCategoryId = form.get('main_category_id')?.value;

    // 監聽縣市變化，更新地區選項
    form.get('city')?.valueChanges.subscribe((city: string | null) => {
      this.updateDistrictOptions(city);
      // 只有在實際改變時才清空地區
      if (previousCity !== null && previousCity !== city) {
        form.patchValue({ district: '' });
      }
      previousCity = city;
    });

    // 監聽主分類變化，更新專長選項
    form.get('main_category_id')?.valueChanges.subscribe((categoryId: number | null) => {
      this.updateSpecialtyOptions(categoryId);
      // 只有在實際改變時才清空專長
      if (previousCategoryId !== null && previousCategoryId !== categoryId) {
        form.patchValue({ sub_category_ids: [] });
      }
      previousCategoryId = categoryId;
    });
  }

  // 根據表單現有值初始化選項
  private initializeOptionsFromFormValues() {
    const form = this.formGroup();

    // 如果表單中已有縣市值，則初始化地區選項
    const currentCity = form.get('city')?.value;
    if (currentCity) {
      this.updateDistrictOptions(currentCity);
    }
  }

  // 載入分類資料
  private loadTags() {
    this.tagsService.getApiTags().subscribe({
      next: (response: any) => {
        if (response.data && Array.isArray(response.data)) {
          this.allTags.set(response.data);
          this.buildSubjectOptions();

          // 標籤資料載入完成後，重新初始化選項
          this.initializeOptionsAfterTagsLoaded();
        }
      },
      error: (error) => {
        console.error('載入分類資料失敗:', error);
      }
    });
  }

  // 在標籤資料載入完成後初始化選項
  private initializeOptionsAfterTagsLoaded() {
    const form = this.formGroup();

    // 如果表單中已有主分類值，則初始化專長選項
    const currentCategoryId = form.get('main_category_id')?.value;
    if (currentCategoryId) {
      this.updateSpecialtyOptions(currentCategoryId);
    }
  }

  // 建構主分類選項
  private buildSubjectOptions() {
    const tags = this.allTags();
    const options: SelectOption[] = tags.map(tag => ({
      value: tag.id,  // 使用數字而不是字串
      label: tag.main_category
    }));
    this.subjectOptions.set(options);
  }

  /**
   * 更新鄉鎮市區選項 - 根據選擇的縣市從 Cities 資料動態生成
   * @param city 選擇的縣市名稱
   */
  updateDistrictOptions(city: string | null) {
    this.districtOptions.set([]);
    
    if (!city) {
      return;
    }

    // 找到對應的城市資料
    const selectedCity = Cities.find(cityData => cityData.name === city);
    
    if (selectedCity) {
      // 將鄉鎮區轉換為選項格式
      const districts: SelectOption[] = selectedCity.districts.map(district => ({
        value: district.name,
        label: district.name
      }));
      
      this.districtOptions.set(districts);
    }
  }

  updateSpecialtyOptions(categoryId: number | null) {
    if (!categoryId) {
      this.specialtyOptions.set([]);
      return;
    }

    const tags = this.allTags();
    const selectedTag = tags.find(tag => tag.id === categoryId);
    
    if (selectedTag && selectedTag.sub_category) {
      const options: MultiSelectOption[] = selectedTag.sub_category.map(subCat => ({
        value: subCat.id,  // 使用數字而不是字串
        label: subCat.name
      }));
      this.specialtyOptions.set(options);
    } else {
      this.specialtyOptions.set([]);
    }
  }
}