import { Component, input, OnInit, inject } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { InputCheckbox } from '@components/form/input-checkbox/input-checkbox';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { dateRangeValidator } from '@share/validator';

@Component({
  selector: 'tmf-learning-experiences-form',
  imports: [
    InputText,
    InputSelect,
    InputCheckbox,
    Button,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './learning-experiences-form.html',
  styles: ``
})
export class LearningExperiencesForm implements OnInit {
  private fb = inject(FormBuilder);
  
  // 輸入屬性 - 接收來自父元件的FormGroup
  formGroup = input.required<FormGroup>();

  get TmfIcon() {
    return TmfIconEnum;
  }

  // 取得 FormArray
  get educationsArray(): FormArray {
    return this.formGroup().get('educations') as FormArray;
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

  ngOnInit() {
    // FormGroup 已經由父元件創建和管理，這裡不需要額外的初始化
  }

  // 新增學歷
  addEducation(): void {
    const educationGroup = this.createEducation();
    this.educationsArray.push(educationGroup);
  }

  // 移除學歷
  removeEducation(index: number): void {
    if (this.educationsArray.length > 1) {
      this.educationsArray.removeAt(index);
    }
  }

  // 建立學歷 FormGroup
  private createEducation(): FormGroup {
    const educationGroup = this.fb.group({
      id: [null], // 用於更新現有學歷時的 ID
      school_name: ['', Validators.required],
      department: ['', Validators.required],
      degree: ['', Validators.required],
      is_in_school: [false],
      start_year: ['', Validators.required],
      start_month: ['', Validators.required],
      end_year: [''],
      end_month: ['']
    }, { validators: dateRangeValidator });

    // 監聽目前就學狀態
    educationGroup.get('is_in_school')?.valueChanges.subscribe(isStudying => {
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
      // 觸發表單層級的日期範圍驗證
      educationGroup.updateValueAndValidity();
    });

    // 監聽日期欄位變化，觸發日期範圍驗證
    ['start_year', 'start_month', 'end_year', 'end_month'].forEach(fieldName => {
      educationGroup.get(fieldName)?.valueChanges.subscribe(() => {
        educationGroup.updateValueAndValidity();
      });
    });

    return educationGroup;
  }
}
