import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Layout1Wapper } from '@components/layout-1-wapper/layout-1-wapper';
import { Stepper, StepItem } from '@components/stepper/stepper';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Location } from '@angular/common';
import { BasicInfoForm } from './basic-info-form/basic-info-form';
import { WorkExperiencesForm } from './work-experiences-form/work-experiences-form';
import { LearningExperiencesForm } from "./learning-experiences-form/learning-experiences-form";
import { CertificatesForm } from './certificates-form/certificates-form';

@Component({
  selector: 'tmf-teacher-apply',
  imports: [
    Layout1Wapper,
    Stepper,
    Button,
    MatIcon,
    BasicInfoForm,
    WorkExperiencesForm,
    ReactiveFormsModule,
    LearningExperiencesForm,
    CertificatesForm
],
  templateUrl: './teacher-apply.html',
  styles: ``
})
export default class TeacherApply {
  private location = inject(Location);
  private fb = inject(FormBuilder);

  // 自訂陣列長度驗證器
  private arrayRequiredValidator(control: any): any {
    const value = control.value;
    if (!Array.isArray(value) || value.length === 0) {
      return { required: true };
    }
    return null;
  }

  // 統一管理所有步驟的表單狀態
  teacherApplyForm = this.fb.group({
    basicInfo: this.fb.group({
      city: ['', Validators.required],
      district: ['', Validators.required],
      address: ['', Validators.required],
      subject: ['', Validators.required],
      specialties: [[] as string[], this.arrayRequiredValidator],
      introduction: ['', [Validators.required, Validators.minLength(10)]]
    }),
    workExperiences: this.fb.group({
      experiences: this.fb.array([])
    }),
    learningExperiences: this.fb.group({
      educations: this.fb.array([])
    }),
    certificates: this.fb.group({
      certificates: this.fb.array([])
    })
  });

  currentStep = signal(1);
  
  get TmfIcon() {
    return TmfIconEnum;
  }

  // 取得特定步驟的FormGroup
  get basicInfoFormGroup() {
    return this.teacherApplyForm.get('basicInfo') as FormGroup;
  }

  get workExperiencesFormGroup() {
    return this.teacherApplyForm.get('workExperiences') as FormGroup;
  }

  get learningExperiencesFormGroup() {
    return this.teacherApplyForm.get('learningExperiences') as FormGroup;
  }

  get certificatesFormGroup() {
    return this.teacherApplyForm.get('certificates') as FormGroup;
  }

  get experiencesFormArray() {
    return this.workExperiencesFormGroup.get('experiences') as FormArray;
  }

  get educationsFormArray() {
    return this.learningExperiencesFormGroup.get('educations') as FormArray;
  }

  get certificatesFormArray() {
    return this.certificatesFormGroup.get('certificates') as FormArray;
  }

  // 檢查各步驟表單的有效性
  get step1Valid() {
    return this.basicInfoFormGroup.valid;
  }

  get step2Valid() {
    return this.workExperiencesFormGroup.valid;
  }

  get step3Valid() {
    return this.learningExperiencesFormGroup.valid;
  }

  get step4Valid() {
    return this.certificatesFormGroup.valid;
  }

  // 步驟配置 (目前支援前四步)
  steps: StepItem[] = [
    { id: 1, label: '基本資料' },
    { id: 2, label: '工作經驗' },
    { id: 3, label: '學歷背景' },
    { id: 4, label: '教學證照' }
  ];

  constructor() {
    // 預設新增一個工作經驗表單
    this.addWorkExperience();
    // 預設新增一個學歷表單
    this.addEducation();
    // 預設新增一個證照表單
    this.addCertificate();
  }

  // 新增工作經驗表單項目
  addWorkExperience() {
    const experienceForm = this.fb.group({
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

    // 監聽目前在職狀態，控制結束日期的必填驗證
    experienceForm.get('is_working')?.valueChanges.subscribe(isWorking => {
      const endYearControl = experienceForm.get('end_year');
      const endMonthControl = experienceForm.get('end_month');
      
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

    // 監聽縣市變化，重置地區選項
    experienceForm.get('workplace_city')?.valueChanges.subscribe(() => {
      experienceForm.patchValue({ workplace_district: '' });
    });

    this.experiencesFormArray.push(experienceForm);
  }

  // 移除工作經驗表單項目
  removeWorkExperience(index: number) {
    if (this.experiencesFormArray.length > 1) {
      this.experiencesFormArray.removeAt(index);
    }
  }

  // 新增學歷表單項目
  addEducation() {
    const educationForm = this.fb.group({
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
    educationForm.get('is_studying')?.valueChanges.subscribe(isStudying => {
      const endYearControl = educationForm.get('end_year');
      const endMonthControl = educationForm.get('end_month');
      
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

    this.educationsFormArray.push(educationForm);
  }

  // 移除學歷表單項目
  removeEducation(index: number) {
    if (this.educationsFormArray.length > 1) {
      this.educationsFormArray.removeAt(index);
    }
  }

  // 新增證照表單項目
  addCertificate() {
    const certificateForm = this.fb.group({
      certificate_name: ['', Validators.required],
      issuer: ['', Validators.required],
      year: ['', Validators.required],
      month: ['', Validators.required],
      certificate_file: [null]
    });

    this.certificatesFormArray.push(certificateForm);
  }

  // 移除證照表單項目
  removeCertificate(index: number) {
    if (this.certificatesFormArray.length > 1) {
      this.certificatesFormArray.removeAt(index);
    }
  }

  goBack() {
    this.location.back();
  }

  onStepChange(step: number) {
    // 只允許回到已完成的步驟
    if (step <= this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  // 上一步/下一步按鈕控制 (目前支援前四步)
  canGoToStep(stepNumber: number): boolean {
    switch (stepNumber) {
      case 1:
        return true;
      case 2:
        return this.step1Valid;
      case 3:
        return this.step1Valid && this.step2Valid;
      case 4:
        return this.step1Valid && this.step2Valid && this.step3Valid;
      default:
        return false;
    }
  }

  goToPrevStep() {
    const currentStepValue = this.currentStep();
    if (currentStepValue > 1) {
      this.currentStep.set(currentStepValue - 1);
    }
  }

  goToNextStep() {
    const currentStepValue = this.currentStep();
    if (currentStepValue < 4 && this.canGoToStep(currentStepValue + 1)) {
      this.currentStep.set(currentStepValue + 1);
    } else if (currentStepValue === 4 && this.step4Valid) {
      // 完成所有步驟
      this.submitForm();
    }
  }

  // 提交完整表單
  private submitForm() {
    if (this.teacherApplyForm.valid) {
      console.log('完整申請資料:', this.teacherApplyForm.value);
      // TODO: 提交到後端API
      alert('前兩步驟完成！');
    } else {
      console.error('表單驗證失敗');
      this.teacherApplyForm.markAllAsTouched();
    }
  }

}