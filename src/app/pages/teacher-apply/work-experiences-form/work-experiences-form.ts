import { Component, input, OnInit, inject } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { InputCheckbox } from '@components/form/input-checkbox/input-checkbox';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Cities } from '@share/cities';

@Component({
  selector: 'tmf-work-experiences-form',
  imports: [
    InputText,
    InputSelect,
    InputCheckbox,
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

  ngOnInit() {
    // 初始化現有工作經驗項目的選項和監聽器
    this.setupExistingExperiences();
  }

  private setupExistingExperiences() {
    this.experiencesArray.controls.forEach((control) => {
      const formGroup = control as FormGroup;
      this.setupExperienceListeners(formGroup);

      // 如果已有縣市值，初始化地區選項
      const currentCity = formGroup.get('city')?.value;
      if (currentCity) {
        this.updateDistrictOptions(formGroup, currentCity);
      }

      // 設定目前在職狀態的驗證邏輯
      this.setupWorkingStatusValidation(formGroup);
    });
  }

  private setupExperienceListeners(experienceForm: FormGroup) {
    // 追蹤之前的縣市值，避免初始化時誤清空
    let previousCity = experienceForm.get('city')?.value;

    // 監聽縣市變化，更新地區選項
    experienceForm.get('city')?.valueChanges.subscribe((city: string | null) => {
      this.updateDistrictOptions(experienceForm, city);
      // 只有在實際改變時才清空地區
      if (previousCity !== null && previousCity !== city) {
        experienceForm.patchValue({ district: '' });
      }
      previousCity = city;
    });
  }

  private updateDistrictOptions(experienceForm: FormGroup, city: string | null) {
    if (!city) {
      // 在 FormGroup 上存儲空陣列
      (experienceForm as any)._districtOptions = [];
      return;
    }

    const selectedCity = Cities.find(cityData => cityData.name === city);
    if (selectedCity) {
      const districts: SelectOption[] = selectedCity.districts.map(district => ({
        value: district.name,
        label: district.name
      }));
      // 在 FormGroup 上存儲地區選項
      (experienceForm as any)._districtOptions = districts;
    } else {
      (experienceForm as any)._districtOptions = [];
    }
  }

  // 取得特定工作經驗的地區選項
  getDistrictOptions(index: number): SelectOption[] {
    const experienceForm = this.experiencesArray.at(index) as FormGroup;
    return (experienceForm as any)._districtOptions || [];
  }

  // 新增工作經驗
  addExperience(): void {
    const experienceGroup = this.createExperience();
    this.experiencesArray.push(experienceGroup);

    // 為新項目設定監聽器
    this.setupExperienceListeners(experienceGroup);

    // 初始化新項目的地區選項為空
    this.updateDistrictOptions(experienceGroup, null);
  }

  // 移除工作經驗
  removeExperience(index: number): void {
    if (this.experiencesArray.length > 1) {
      this.experiencesArray.removeAt(index);
    }
  }

  // 設定目前在職狀態的驗證邏輯
  private setupWorkingStatusValidation(experienceGroup: FormGroup) {
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

    // 初始化時也檢查一次，確保現有資料的驗證狀態正確
    const isWorking = experienceGroup.get('is_working')?.value;
    const endYearControl = experienceGroup.get('end_year');
    const endMonthControl = experienceGroup.get('end_month');

    if (!isWorking) {
      endYearControl?.setValidators([Validators.required]);
      endMonthControl?.setValidators([Validators.required]);
      endYearControl?.updateValueAndValidity();
      endMonthControl?.updateValueAndValidity();
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

    // 設定目前在職狀態的驗證邏輯
    this.setupWorkingStatusValidation(experienceGroup);

    return experienceGroup;
  }
}
