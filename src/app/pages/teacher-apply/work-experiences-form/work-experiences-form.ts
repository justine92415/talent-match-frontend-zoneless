import { Component, input, OnInit, inject, signal, computed } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Cities } from '@share/cities';

@Component({
  selector: 'tmf-work-experiences-form',
  imports: [
    InputText,
    InputSelect,
    Button,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './work-experiences-form.html',
  styles: ``
})
export class WorkExperiencesForm implements OnInit {
  private fb = inject(FormBuilder);
  
  // 輸入屬性 - 接收來自父元件的FormGroup
  formGroup = input.required<FormGroup>();

  get TmfIcon() {
    return TmfIconEnum;
  }

  // 取得 FormArray
  get experiencesArray(): FormArray {
    return this.formGroup().get('experiences') as FormArray;
  }

  // 縣市選項 - 從 Cities 資料生成
  cityOptions: SelectOption[] = Cities.map(city => ({
    value: city.name,
    label: city.name
  }));

  // 工作類別選項
  jobCategoryOptions: SelectOption[] = [
    { value: 'education', label: '教育培訓' },
    { value: 'software', label: '軟體開發' },
    { value: 'design', label: '設計創意' },
    { value: 'marketing', label: '行銷企劃' },
    { value: 'finance', label: '財務會計' },
    { value: 'management', label: '管理顧問' },
    { value: 'sales', label: '業務銷售' },
    { value: 'manufacturing', label: '製造業' },
    { value: 'service', label: '服務業' },
    { value: 'other', label: '其他' }
  ];

  // 年份選項 (1980-2024)
  yearOptions: SelectOption[] = Array.from({ length: 45 }, (_, i) => {
    const year = 2024 - i;
    return { value: year.toString(), label: `${year}年` };
  });

  // 月份選項 (1-12)
  monthOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString(), label: `${month}月` };
  });

  // 每個工作經驗的地區選項 - 使用 Map 來管理多個下拉選單
  districtOptionsMap = signal<Map<number, SelectOption[]>>(new Map());

  ngOnInit() {
    // 初始化現有工作經驗項目的選項和監聽器
    this.setupExistingExperiences();
  }

  private setupExistingExperiences() {
    this.experiencesArray.controls.forEach((control, index) => {
      const formGroup = control as FormGroup;
      this.setupExperienceListeners(formGroup, index);

      // 如果已有縣市值，初始化地區選項
      const currentCity = formGroup.get('city')?.value;
      if (currentCity) {
        this.updateDistrictOptions(index, currentCity);
      }
    });
  }

  private setupExperienceListeners(experienceForm: FormGroup, index: number) {
    // 追蹤之前的縣市值，避免初始化時誤清空
    let previousCity = experienceForm.get('city')?.value;

    // 監聽縣市變化，更新地區選項
    experienceForm.get('city')?.valueChanges.subscribe((city: string | null) => {
      this.updateDistrictOptions(index, city);
      // 只有在實際改變時才清空地區
      if (previousCity !== null && previousCity !== city) {
        experienceForm.patchValue({ district: '' });
      }
      previousCity = city;
    });
  }

  private updateDistrictOptions(index: number, city: string | null) {
    const currentMap = this.districtOptionsMap();
    const newMap = new Map(currentMap);

    if (!city) {
      newMap.set(index, []);
      this.districtOptionsMap.set(newMap);
      return;
    }

    const selectedCity = Cities.find(cityData => cityData.name === city);
    if (selectedCity) {
      const districts: SelectOption[] = selectedCity.districts.map(district => ({
        value: district.name,
        label: district.name
      }));
      newMap.set(index, districts);
    } else {
      newMap.set(index, []);
    }

    this.districtOptionsMap.set(newMap);
  }

  // 新增工作經驗
  addExperience(): void {
    const newIndex = this.experiencesArray.length;
    const experienceGroup = this.createExperience();
    this.experiencesArray.push(experienceGroup);

    // 為新項目設定監聽器
    this.setupExperienceListeners(experienceGroup, newIndex);

    // 初始化新項目的地區選項為空
    this.updateDistrictOptions(newIndex, null);
  }

  // 移除工作經驗
  removeExperience(index: number): void {
    if (this.experiencesArray.length > 1) {
      this.experiencesArray.removeAt(index);
    }
  }

  // 建立工作經驗 FormGroup
  private createExperience(): FormGroup {
    const experienceGroup = this.fb.group({
      id: [null], // 新增 id 欄位
      company_name: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      job_category: ['', Validators.required],
      job_title: ['', Validators.required],
      is_working: [false],
      start_year: ['', Validators.required],
      start_month: ['', Validators.required],
      end_year: [''],
      end_month: ['']
    });

    // 監聽目前在職狀態
    experienceGroup.get('is_working')?.valueChanges.subscribe(isWorking => {
      const endYearControl = experienceGroup.get('end_year');
      const endMonthControl = experienceGroup.get('end_month');
      
      if (isWorking) {
        endYearControl?.clearValidators();
        endMonthControl?.clearValidators();
        endYearControl?.setValue('');
        endMonthControl?.setValue('');
      } else {
        endYearControl?.setValidators([Validators.required]);
        endMonthControl?.setValidators([Validators.required]);
      }
      
      endYearControl?.updateValueAndValidity();
      endMonthControl?.updateValueAndValidity();
    });

    return experienceGroup;
  }
}
