import { Component, inject, signal, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';

@Component({
  selector: 'tmf-learning-experiences-form',
  imports: [
    InputText,
    InputSelect,
    Button,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './learning-experiences-form.html',
  styles: ``
})
export class LearningExperiencesForm {
  private fb = inject(FormBuilder);

  // 輸入屬性
  initialData = input<any>(null);

  // 輸出事件
  formSubmit = output<any>();
  formValid = output<boolean>();

  get TmfIcon() {
    return TmfIconEnum;
  }

  // 學位選項
  degreeOptions: SelectOption[] = [
    { value: 'high_school', label: '高中職' },
    { value: 'associate', label: '專科' },
    { value: 'bachelor', label: '學士' },
    { value: 'master', label: '碩士' },
    { value: 'phd', label: '博士' }
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

  // 學歷背景表單
  educationForm = this.fb.group({
    educations: this.fb.array([])
  });

  get educationsArray(): FormArray {
    return this.educationForm.get('educations') as FormArray;
  }

  constructor() {
    // 監聽表單狀態變化
    this.educationForm.statusChanges.subscribe(status => {
      this.formValid.emit(status === 'VALID');
    });

    // 如果有初始資料，填入表單
    if (this.initialData()) {
      this.loadInitialData();
    } else {
      // 預設新增一個學歷
      this.addEducation();
    }
  }

  private loadInitialData() {
    const data = this.initialData();
    if (data?.educations && Array.isArray(data.educations)) {
      // 清空現有的學歷
      while (this.educationsArray.length !== 0) {
        this.educationsArray.removeAt(0);
      }
      
      // 加載初始資料
      data.educations.forEach((edu: any) => {
        const educationGroup = this.createEducation();
        educationGroup.patchValue(edu);
        this.educationsArray.push(educationGroup);
      });
    } else {
      this.addEducation();
    }
  }

  // 建立學歷 FormGroup
  createEducation(): FormGroup {
    const educationGroup = this.fb.group({
      school_name: ['', Validators.required],
      major: ['', Validators.required],
      degree: ['', Validators.required],
      is_studying: [false],
      start_year: ['', Validators.required],
      start_month: ['', Validators.required],
      end_year: [''],
      end_month: ['']
    });

    // 監聽目前就學狀態，控制結束日期的必填驗證
    educationGroup.get('is_studying')?.valueChanges.subscribe(isStudying => {
      const endYearControl = educationGroup.get('end_year');
      const endMonthControl = educationGroup.get('end_month');
      
      if (isStudying) {
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

    return educationGroup;
  }

  addEducation(): void {
    this.educationsArray.push(this.createEducation());
  }

  removeEducation(index: number): void {
    if (this.educationsArray.length > 1) {
      this.educationsArray.removeAt(index);
    }
  }

  onSubmit() {
    if (this.educationForm.valid) {
      this.formSubmit.emit(this.educationForm.value);
    } else {
      this.educationForm.markAllAsTouched();
    }
  }

  // 取得表單資料
  getFormData() {
    return this.educationForm.value;
  }

  // 檢查表單是否有效
  isFormValid() {
    return this.educationForm.valid;
  }

  // 檢查表單是否有變更
  isFormDirty() {
    return this.educationForm.dirty;
  }
}
