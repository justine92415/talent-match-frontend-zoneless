import { Component, inject, signal, ViewChild } from '@angular/core';
import { Layout1Wapper } from '@components/layout-1-wapper/layout-1-wapper';
import { Stepper, StepItem } from '@components/stepper/stepper';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Location } from '@angular/common';
import { BasicInfoForm } from './basic-info-form/basic-info-form';
import { WorkExperiencesForm } from './work-experiences-form/work-experiences-form';
import { LearningExperiencesForm } from './learning-experiences-form/learning-experiences-form';
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
    LearningExperiencesForm,
    CertificatesForm
  ],
  templateUrl: './teacher-apply.html',
  styles: ``
})
export default class TeacherApply {
  private location = inject(Location);

  // ViewChild 參考各個表單元件
  @ViewChild('basicInfoForm') basicInfoFormRef!: BasicInfoForm;
  @ViewChild('workExperiencesForm') workExperiencesFormRef!: WorkExperiencesForm;
  @ViewChild('learningExperiencesForm') learningExperiencesFormRef!: LearningExperiencesForm;
  @ViewChild('certificatesForm') certificatesFormRef!: CertificatesForm;

  currentStep = signal(1);

  // 追蹤各步驟表單的有效性
  step1Valid = signal(false);
  step2Valid = signal(false);
  step3Valid = signal(false);
  step4Valid = signal(false);

  // 儲存各步驟的表單資料
  formData = {
    basicInfo: null as any,
    workExperiences: null as any,
    learningExperiences: null as any,
    certificates: null as any
  };
  
  get TmfIcon() {
    return TmfIconEnum;
  }

  // 步驟配置
  steps: StepItem[] = [
    { id: 1, label: '基本資料' },
    { id: 2, label: '工作經驗' },
    { id: 3, label: '學歷背景' },
    { id: 4, label: '教學證照' }
  ];


  goBack() {
    this.location.back();
  }

  onStepChange(step: number) {
    // 只允許回到已完成的步驟
    if (step <= this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  // 表單驗證狀態更新方法
  onStep1ValidChange(isValid: boolean) {
    this.step1Valid.set(isValid);
  }

  onStep2ValidChange(isValid: boolean) {
    this.step2Valid.set(isValid);
  }

  onStep3ValidChange(isValid: boolean) {
    this.step3Valid.set(isValid);
  }

  onStep4ValidChange(isValid: boolean) {
    this.step4Valid.set(isValid);
  }

  // 步驟提交方法
  onStep1Submit(data: any) {
    this.formData.basicInfo = data;
    console.log('基本資料:', data);
    this.currentStep.set(2);
  }

  onStep2Submit(data: any) {
    this.formData.workExperiences = data;
    console.log('工作經驗:', data);
    this.currentStep.set(3);
  }

  onStep3Submit(data: any) {
    this.formData.learningExperiences = data;
    console.log('學歷背景:', data);
    this.currentStep.set(4);
  }

  onStep4Submit(data: any) {
    this.formData.certificates = data;
    console.log('教學證照:', data);
    console.log('完整申請資料:', this.formData);
    // TODO: 提交到後端API
    alert('教師申請已提交！');
  }

  // 上一步/下一步按鈕控制
  canGoToStep(stepNumber: number): boolean {
    switch (stepNumber) {
      case 1:
        return true;
      case 2:
        return this.step1Valid();
      case 3:
        return this.step1Valid() && this.step2Valid();
      case 4:
        return this.step1Valid() && this.step2Valid() && this.step3Valid();
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
    if (this.canGoToStep(currentStepValue + 1)) {
      // 觸發當前步驟的提交
      this.submitCurrentStep();
    }
  }

  private submitCurrentStep() {
    const currentStepValue = this.currentStep();
    switch (currentStepValue) {
      case 1:
        this.basicInfoFormRef?.onSubmit();
        break;
      case 2:
        this.workExperiencesFormRef?.onSubmit();
        break;
      case 3:
        this.learningExperiencesFormRef?.onSubmit();
        break;
      case 4:
        this.certificatesFormRef?.onSubmit();
        break;
    }
  }

}