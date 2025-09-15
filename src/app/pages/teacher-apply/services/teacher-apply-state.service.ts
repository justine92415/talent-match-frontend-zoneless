import { Injectable, signal, computed } from '@angular/core';
import { ApplyStatusData, ApplyStepStatus, ApplyStep } from '../types/teacher-apply.types';

@Injectable({
  providedIn: 'root'
})
export class TeacherApplyStateService {
  // 基本狀態
  private _isFirstTimeApply = signal(true);
  private _isLoading = signal(true);
  private _isSubmitted = signal(false);
  private _currentStep = signal<ApplyStep>(1);

  // 各步驟資料存在狀態
  private _hasBasicInfo = signal(false);
  private _hasWorkExperiences = signal(false);
  private _hasLearningExperiences = signal(false);
  private _hasCertificates = signal(false);

  // 只讀的 computed signals
  readonly isFirstTimeApply = computed(() => this._isFirstTimeApply());
  readonly isLoading = computed(() => this._isLoading());
  readonly isSubmitted = computed(() => this._isSubmitted());
  readonly currentStep = computed(() => this._currentStep());
  readonly hasBasicInfo = computed(() => this._hasBasicInfo());
  readonly hasWorkExperiences = computed(() => this._hasWorkExperiences());
  readonly hasLearningExperiences = computed(() => this._hasLearningExperiences());
  readonly hasCertificates = computed(() => this._hasCertificates());

  // 步驟驗證狀態
  readonly stepStatus = computed<ApplyStepStatus>(() => ({
    hasBasicInfo: this._hasBasicInfo(),
    hasWorkExperiences: this._hasWorkExperiences(),
    hasLearningExperiences: this._hasLearningExperiences(),
    hasCertificates: this._hasCertificates()
  }));

  // 是否可以進入下一步
  readonly canGoToNextStep = computed(() => {
    const currentStep = this._currentStep();
    const status = this.stepStatus();

    switch (currentStep) {
      case 1:
        return status.hasBasicInfo;
      case 2:
        return status.hasBasicInfo && status.hasWorkExperiences;
      case 3:
        return status.hasBasicInfo && status.hasWorkExperiences && status.hasLearningExperiences;
      case 4:
        return status.hasBasicInfo && status.hasWorkExperiences &&
               status.hasLearningExperiences && status.hasCertificates;
      case 5:
        return true; // 確認頁面，可以提交
      default:
        return false;
    }
  });

  // 是否可以最終提交
  readonly canSubmitFinal = computed(() => {
    const status = this.stepStatus();
    return status.hasBasicInfo && status.hasWorkExperiences &&
           status.hasLearningExperiences && status.hasCertificates;
  });

  /**
   * 設定基本狀態
   */
  setFirstTimeApply(value: boolean): void {
    this._isFirstTimeApply.set(value);
  }

  setLoading(value: boolean): void {
    this._isLoading.set(value);
  }

  setSubmitted(value: boolean): void {
    this._isSubmitted.set(value);
  }

  setCurrentStep(step: ApplyStep): void {
    this._currentStep.set(step);
  }

  /**
   * 設定各步驟完成狀態
   */
  setBasicInfoStatus(hasData: boolean): void {
    this._hasBasicInfo.set(hasData);
  }

  setWorkExperiencesStatus(hasData: boolean): void {
    this._hasWorkExperiences.set(hasData);
  }

  setLearningExperiencesStatus(hasData: boolean): void {
    this._hasLearningExperiences.set(hasData);
  }

  setCertificatesStatus(hasData: boolean): void {
    this._hasCertificates.set(hasData);
  }

  /**
   * 批量更新步驟狀態
   */
  updateStepStatus(status: ApplyStepStatus): void {
    this._hasBasicInfo.set(status.hasBasicInfo);
    this._hasWorkExperiences.set(status.hasWorkExperiences);
    this._hasLearningExperiences.set(status.hasLearningExperiences);
    this._hasCertificates.set(status.hasCertificates);
  }

  /**
   * 根據申請資料初始化狀態
   */
  initializeFromApplyData(data: ApplyStatusData): void {
    // 設定基本狀態
    this._isFirstTimeApply.set(false);

    // 檢查各步驟資料完整性
    const basicInfoComplete = data.basic_info &&
      data.basic_info.city &&
      data.basic_info.district &&
      data.basic_info.address &&
      data.basic_info.main_category_id &&
      data.basic_info.sub_category_ids?.length > 0 &&
      data.basic_info.introduction;

    this._hasBasicInfo.set(!!basicInfoComplete);
    this._hasWorkExperiences.set(data.work_experiences?.length > 0);
    this._hasLearningExperiences.set(data.learning_experiences?.length > 0);
    this._hasCertificates.set(data.certificates?.length > 0);

    // 設定提交狀態
    this._isSubmitted.set(!!data.application_submitted_at);
  }

  /**
   * 下一步
   */
  goToNextStep(): void {
    const current = this._currentStep();
    if (current < 5) {
      this._currentStep.set((current + 1) as ApplyStep);
    }
  }

  /**
   * 上一步
   */
  goToPrevStep(): void {
    const current = this._currentStep();
    if (current > 1) {
      this._currentStep.set((current - 1) as ApplyStep);
    }
  }

  /**
   * 跳到指定步驟
   */
  goToStep(step: ApplyStep): void {
    // 只允許回到已完成的步驟或當前步驟
    if (step <= this._currentStep()) {
      this._currentStep.set(step);
    }
  }

  /**
   * 重設所有狀態
   */
  reset(): void {
    this._isFirstTimeApply.set(true);
    this._isLoading.set(true);
    this._isSubmitted.set(false);
    this._currentStep.set(1);
    this._hasBasicInfo.set(false);
    this._hasWorkExperiences.set(false);
    this._hasLearningExperiences.set(false);
    this._hasCertificates.set(false);
  }
}