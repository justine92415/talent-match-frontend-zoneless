import { Component, input, OnInit, inject } from '@angular/core';
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

  ngOnInit() {
    // FormGroup 已經由父元件創建和管理，這裡不需要額外的初始化
  }

  // 新增工作經驗
  addExperience(): void {
    // 由於 FormArray 是由父元件管理，這裡需要透過父元件的方法來新增
    // 但為了保持元件的獨立性，我們可以直接操作 FormArray
    const experienceGroup = this.createExperience();
    this.experiencesArray.push(experienceGroup);
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
      workplace_city: ['', Validators.required],
      workplace_district: ['', Validators.required],
      workplace_address: ['', Validators.required],
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

    // 監聽縣市變化
    experienceGroup.get('workplace_city')?.valueChanges.subscribe(() => {
      experienceGroup.patchValue({ workplace_district: '' });
    });

    return experienceGroup;
  }

  // 取得地區選項 - 根據選擇的縣市從 Cities 資料動態生成
  getDistrictOptions(cityValue: string | null): SelectOption[] {
    if (!cityValue) {
      return [];
    }

    // 找到對應的城市資料
    const selectedCity = Cities.find(city => city.name === cityValue);
    
    if (selectedCity) {
      // 將鄉鎮區轉換為選項格式
      return selectedCity.districts.map(district => ({
        value: district.name,
        label: district.name
      }));
    }

    return [];
  }
}
