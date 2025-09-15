import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { AuthService } from '../../services/auth.service';
import { switchMap, tap, catchError, of } from 'rxjs';
import { CategoryPipe, SubcategoryPipe, DegreePipe, JobCategoryPipe } from '../../../shared/pipes';

// 新的服務層
import { TeacherApplyApiService } from './services/teacher-apply-api.service';
import { TeacherApplyStateService } from './services/teacher-apply-state.service';
import { TeacherApplyFormService } from './services/teacher-apply-form.service';
import { ApplyStep } from './types/teacher-apply.types';

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
    CertificatesForm,
    CategoryPipe,
    SubcategoryPipe,
    DegreePipe,
    JobCategoryPipe
],
  templateUrl: './teacher-apply.html',
  styles: ``
})
export default class TeacherApply implements OnInit {
  // 注入服務
  private location = inject(Location);
  private router = inject(Router);
  private authService = inject(AuthService);

  // 新的服務層
  private apiService = inject(TeacherApplyApiService);
  private stateService = inject(TeacherApplyStateService);
  private formService = inject(TeacherApplyFormService);

  // 從狀態服務中取得狀態（只讀）
  readonly isFirstTimeApply = this.stateService.isFirstTimeApply;
  readonly isLoading = this.stateService.isLoading;
  readonly isSubmitted = this.stateService.isSubmitted;
  readonly currentStep = this.stateService.currentStep;
  readonly hasBasicInfo = this.stateService.hasBasicInfo;
  readonly hasWorkExperiences = this.stateService.hasWorkExperiences;
  readonly hasLearningExperiences = this.stateService.hasLearningExperiences;
  readonly hasCertificates = this.stateService.hasCertificates;

  // 主要表單（透過 FormService 建立）
  teacherApplyForm: FormGroup;
  
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
    { id: 4, label: '教學證照' },
    { id: 5, label: '確認資料' }
  ];

  constructor() {
    // 透過 FormService 建立表單
    this.teacherApplyForm = this.formService.createTeacherApplyForm();

    // 確保每個步驟至少有一個表單項目
    this.formService.ensureMinimumFormItems(this.teacherApplyForm);
  }

  ngOnInit() {
    this.checkApplyStatus();
  }

  // 檢查申請狀態
  private checkApplyStatus(): void {
    this.stateService.setLoading(true);

    this.apiService.checkApplyStatus().subscribe({
      next: (data) => {
        console.log('收到申請狀態資料:', data);
        if (data) {
          // 已申請過，初始化狀態和表單
          console.log('初始化申請資料...');
          this.stateService.initializeFromApplyData(data);
          this.formService.populateFormWithData(this.teacherApplyForm, data);
          this.formService.ensureMinimumFormItems(this.teacherApplyForm);
          console.log('表單初始化完成，基本資料:', this.basicInfoFormGroup.value);
        } else {
          // 未申請過，保持預設狀態
          console.log('未申請過，保持預設狀態');
          this.stateService.setFirstTimeApply(true);
        }
        this.stateService.setLoading(false);
      },
      error: (error) => {
        console.error('檢查申請狀態失敗:', error);
        this.stateService.setLoading(false);
      }
    });
  }



  // 新增工作經驗表單項目
  addWorkExperience(): void {
    const experienceForm = this.formService.createWorkExperienceForm();
    this.experiencesFormArray.push(experienceForm);
  }

  // 移除工作經驗表單項目
  removeWorkExperience(index: number): void {
    if (this.experiencesFormArray.length > 1) {
      this.experiencesFormArray.removeAt(index);
    }
  }

  // 新增學歷表單項目
  addEducation(): void {
    const educationForm = this.formService.createEducationForm();
    this.educationsFormArray.push(educationForm);
  }

  // 移除學歷表單項目
  removeEducation(index: number): void {
    if (this.educationsFormArray.length > 1) {
      this.educationsFormArray.removeAt(index);
    }
  }

  // 新增證照表單項目
  addCertificate(): void {
    const certificateForm = this.formService.createCertificateForm();
    this.certificatesFormArray.push(certificateForm);
  }

  // 移除證照表單項目
  removeCertificate(index: number): void {
    if (this.certificatesFormArray.length > 1) {
      this.certificatesFormArray.removeAt(index);
    }
  }

  goBack(): void {
    this.location.back();
  }

  // 導航到教師後台
  goToTeacherDashboard(): void {
    this.router.navigate(['/dashboard/teacher']);
  }

  onStepChange(step: number): void {
    this.stateService.goToStep(step as ApplyStep);
  }

  goToPrevStep(): void {
    this.stateService.goToPrevStep();
  }

  // 步驟驗證狀態（使用 computed signals）
  readonly canSubmitFinal = this.stateService.canSubmitFinal;

  // 檢查當前步驟是否可以進入下一步（基於表單驗證狀態）
  canGoToNextStep(): boolean {
    const currentStep = this.currentStep();

    switch (currentStep) {
      case 1:
        return this.step1Valid;
      case 2:
        return this.step2Valid;
      case 3:
        return this.step3Valid;
      case 4:
        return this.step4Valid;
      case 5:
        return true; // 確認頁面，可以提交
      default:
        return false;
    }
  }

  // 檢查是否可以進入指定步驟
  canGoToStep(step: number): boolean {
    const currentStep = this.currentStep();
    const status = this.stateService.stepStatus();

    switch (step) {
      case 1:
        return true;
      case 2:
        return status.hasBasicInfo;
      case 3:
        return status.hasBasicInfo && status.hasWorkExperiences;
      case 4:
        return status.hasBasicInfo && status.hasWorkExperiences && status.hasLearningExperiences;
      case 5:
        return status.hasBasicInfo && status.hasWorkExperiences &&
               status.hasLearningExperiences && status.hasCertificates;
      default:
        return false;
    }
  }

  goToNextStep(): void {
    const currentStep = this.currentStep();

    if (!this.canGoToNextStep()) {
      return;
    }

    switch (currentStep) {
      case 1:
        this.submitBasicInfo();
        break;
      case 2:
        this.submitWorkExperiences();
        break;
      case 3:
        this.submitLearningExperiences();
        break;
      case 4:
        this.submitCertificates();
        break;
      case 5:
        this.submitFinalApplication();
        break;
    }
  }

  // 提交基本資料 (第一步)
  private submitBasicInfo(): void {
    if (!this.step1Valid) {
      this.basicInfoFormGroup.markAllAsTouched();
      return;
    }

    const formData = this.basicInfoFormGroup.value;
    const apiCall = this.hasBasicInfo()
      ? this.apiService.updateBasicInfo(formData)
      : this.apiService.submitBasicInfo(formData);

    apiCall.subscribe({
      next: () => {
        this.stateService.setFirstTimeApply(false);
        this.stateService.setBasicInfoStatus(true);
        this.stateService.goToNextStep();
      },
      error: (error) => {
        console.error('基本資料提交失敗:', error);
        // TODO: 顯示錯誤訊息給使用者
      }
    });
  }


  // 提交工作經驗 (第二步)
  private submitWorkExperiences() {
    if (!this.step2Valid) {
      this.workExperiencesFormGroup.markAllAsTouched();
      return;
    }

    const formData = this.workExperiencesFormGroup.value;

    // 準備 API 資料格式 - 使用 ApiService 的轉換方法
    const workExperiences = formData.experiences?.map((exp: any) =>
      this.apiService.transformWorkExperienceForApi(exp)
    ) || [];

    // 額外檢查：如果表單中有任何一個工作經驗包含 id，就表示已有資料
    const hasExistingExperience = this.experiencesFormArray.controls.some(control => control.get('id')?.value);

    // 合併檢查：signal 狀態或表單中有 ID
    const shouldUseUpdate = this.hasWorkExperiences() || hasExistingExperience;

    // 根據工作經驗狀態決定使用 POST 或 PUT
    const apiCall = shouldUseUpdate
      ? this.apiService.updateWorkExperiences(workExperiences)
      : this.apiService.submitWorkExperiences(workExperiences);

    apiCall.subscribe({
      next: (response: any) => {
        // 從回應中取得 work_experiences 陣列及其 id（僅在 POST 時需要）
        if (!shouldUseUpdate && response) {
          if (response.data && response.data.work_experiences) {
            this.formService.updateFormArrayIds(this.experiencesFormArray, response.data.work_experiences);
          } else if (response.work_experiences) {
            this.formService.updateFormArrayIds(this.experiencesFormArray, response.work_experiences);
          }
        }

        // 成功後更新狀態並進入下一步
        this.stateService.setWorkExperiencesStatus(true);
        this.stateService.goToNextStep();
      },
      error: (error: any) => {
        console.error('工作經驗提交失敗:', error);
        // TODO: 顯示錯誤訊息給使用者
      }
    });
  }

  // 提交學歷背景 (第三步)
  private submitLearningExperiences() {
    if (!this.step3Valid) {
      this.learningExperiencesFormGroup.markAllAsTouched();
      return;
    }

    const formData = this.learningExperiencesFormGroup.value;

    // 準備 API 資料格式 - 使用 ApiService 的轉換方法
    const learningExperiences = formData.educations?.map((edu: any) =>
      this.apiService.transformLearningExperienceForApi(edu)
    ) || [];

    // 額外檢查：如果表單中有任何一個學歷包含 id，就表示已有資料
    const hasExistingEducation = this.educationsFormArray.controls.some(control => control.get('id')?.value);

    // 合併檢查：signal 狀態或表單中有 ID
    const shouldUseUpdate = this.hasLearningExperiences() || hasExistingEducation;

    // 根據學歷背景狀態決定使用 POST 或 PUT
    const apiCall = shouldUseUpdate
      ? this.apiService.updateLearningExperiences(learningExperiences)
      : this.apiService.submitLearningExperiences(learningExperiences);

    apiCall.subscribe({
      next: (response: any) => {
        // 從回應中取得 learning_experiences 陣列及其 id（僅在 POST 時需要）
        if (!shouldUseUpdate && response) {
          if (response.data && response.data.learning_experiences) {
            this.formService.updateFormArrayIds(this.educationsFormArray, response.data.learning_experiences);
          } else if (response.learning_experiences) {
            this.formService.updateFormArrayIds(this.educationsFormArray, response.learning_experiences);
          }
        }

        // 成功後更新狀態並進入下一步
        this.stateService.setLearningExperiencesStatus(true);
        this.stateService.goToNextStep();
      },
      error: (error: any) => {
        console.error('學歷背景提交失敗:', error);
        // TODO: 顯示錯誤訊息給使用者
      }
    });
  }

  // 提交證照資料 (第四步)
  private submitCertificates() {
    if (!this.step4Valid) {
      this.certificatesFormGroup.markAllAsTouched();
      return;
    }

    const formData = this.certificatesFormGroup.value;

    // 準備 API 資料格式 - 使用 ApiService 的轉換方法
    const certificates = formData.certificates?.map((cert: any) =>
      this.apiService.transformCertificateForApi(cert)
    ) || [];

    // 額外檢查：如果表單中有任何一個證照包含 id，就表示已有資料
    const hasExistingCertificate = this.certificatesFormArray.controls.some(control => control.get('id')?.value);

    // 合併檢查：signal 狀態或表單中有 ID
    const shouldUseUpdate = this.hasCertificates() || hasExistingCertificate;

    // 根據證照狀態決定使用 POST 或 PUT
    const apiCall = shouldUseUpdate
      ? this.apiService.updateCertificates(certificates)
      : this.apiService.submitCertificates(certificates);

    apiCall.subscribe({
      next: (response: any) => {
        // 從回應中取得 certificates 陣列及其 id（僅在 POST 時需要）
        if (!shouldUseUpdate && response) {
          if (response.data && response.data.certificates) {
            this.formService.updateFormArrayIds(this.certificatesFormArray, response.data.certificates);
          } else if (response.certificates) {
            this.formService.updateFormArrayIds(this.certificatesFormArray, response.certificates);
          }
        }

        // 成功後更新狀態並進入下一步
        this.stateService.setCertificatesStatus(true);
        this.stateService.goToNextStep();
      },
      error: (error: any) => {
        console.error('證照提交失敗:', error);
        // TODO: 顯示錯誤訊息給使用者
      }
    });
  }

  // 最終申請提交
  private submitFinalApplication() {
    // 檢查所有步驟是否都已完成
    if (!this.canSubmitFinal()) {
      console.error('申請提交失敗：尚有步驟未完成');
      return;
    }

    // 呼叫最終提交 API
    this.apiService.submitFinalApplication().pipe(
      tap((response: any) => {
        console.log('申請提交成功:', response);
        this.stateService.setSubmitted(true); // 設定為已提交狀態
      }),
      switchMap(() => {
        // 提交成功後，刷新 token 以取得 teacher_pending 角色
        return this.authService.refreshToken();
      }),
      catchError((error) => {
        console.error('申請提交失敗:', error);
        alert('申請提交失敗，請稍後再試。');
        return of(false); // 回傳 false 表示失敗
      })
    ).subscribe({
      next: (success: any) => {
        if (success) {
          console.log('角色更新成功，已獲得 teacher_pending 角色');
          // 重定向到適當頁面，例如待審核狀態頁面
          this.router.navigate(['/dashboard']);
        } else {
          // 角色更新失敗的情況
          console.error('角色更新失敗');
          alert('申請已成功提交！請重新登入以更新權限。');
        }
      },
      error: (error: any) => {
        console.error('角色更新失敗:', error);
        // 即使角色更新失敗，申請仍然成功提交
        alert('申請已成功提交！請重新登入以更新權限。');
      }
    });
  }
}