import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
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
import { TeachersService } from '../../api/generated/teachers/teachers.service';
import { AuthService } from '../../services/auth.service';
import { catchError, of, switchMap, tap } from 'rxjs';
import { CategoryPipe, SubcategoryPipe, DegreePipe, JobCategoryPipe } from '../../../shared/pipes';

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
  private location = inject(Location);
  private fb = inject(FormBuilder);
  private teachersService = inject(TeachersService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // 申請狀態相關
  isFirstTimeApply = signal(true);  // 是否為初次申請
  isLoading = signal(true);         // 載入中狀態
  isSubmitted = signal(false);      // 是否已提交申請

  // 各步驟資料存在狀態
  hasBasicInfo = signal(false);           // 是否已有基本資料
  hasWorkExperiences = signal(false);     // 是否已有工作經驗資料
  hasLearningExperiences = signal(false); // 是否已有學歷背景資料
  hasCertificates = signal(false);        // 是否已有證照資料

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
      main_category_id: [null, Validators.required],
      sub_category_ids: [[] as number[], this.arrayRequiredValidator],
      introduction: ['', [Validators.required, Validators.minLength(100)]]
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
    { id: 4, label: '教學證照' },
    { id: 5, label: '確認資料' }
  ];

  constructor() {
    // 預設新增一個工作經驗表單
    this.addWorkExperience();
    // 預設新增一個學歷表單
    this.addEducation();
    // 預設新增一個證照表單
    this.addCertificate();
  }

  ngOnInit() {
    this.checkApplyStatus();
  }

  // 檢查申請狀態
  private checkApplyStatus() {
    this.isLoading.set(true);
    
    this.teachersService.getApiTeachersApplyStatus().pipe(
      catchError(error => {
        if (error.status === 404) {
          // 404 表示初次申請
          this.isFirstTimeApply.set(true);
          return of(null);
        }
        // 其他錯誤
        console.error('檢查申請狀態失敗:', error);
        return of(null);
      })
    ).subscribe(response => {
      this.isLoading.set(false);
      
      if (response) {
        // 有申請記錄，表示已申請過
        this.isFirstTimeApply.set(false);
        // TODO: 用回應資料初始化表單
        this.initializeFormWithData(response.data);
      }
    });
  }

  // 用申請資料初始化表單
  private initializeFormWithData(data: any) {
    
    // 初始化基本資料
    if (data.basic_info) {
      const basicInfo = data.basic_info;
      // 檢查基本資料是否完整
      const isBasicInfoComplete = basicInfo.city && basicInfo.district && 
        basicInfo.address && basicInfo.main_category_id && 
        basicInfo.sub_category_ids?.length > 0 && basicInfo.introduction;
      
      if (isBasicInfoComplete) {
        this.hasBasicInfo.set(true);
        this.basicInfoFormGroup.patchValue({
          city: basicInfo.city || '',
          district: basicInfo.district || '',
          address: basicInfo.address || '',
          main_category_id: basicInfo.main_category_id || null,
          sub_category_ids: basicInfo.sub_category_ids || [],
          introduction: basicInfo.introduction || ''
        });
      }
    }

    // 初始化工作經驗
    if (data.work_experiences && data.work_experiences.length > 0) {
      this.hasWorkExperiences.set(true);
      
      // 清空現有的工作經驗表單
      while (this.experiencesFormArray.length > 0) {
        this.experiencesFormArray.removeAt(0);
      }
      
      // 重新建立工作經驗表單
      data.work_experiences.forEach((exp: any) => {
        const experienceForm = this.fb.group({
          id: [exp.id || null], // 包含 id 欄位
          company_name: [exp.company_name || '', Validators.required],
          city: [exp.city || '', Validators.required],
          district: [exp.district || '', Validators.required],
          job_category: [exp.job_category || '', Validators.required],
          job_title: [exp.job_title || '', Validators.required],
          is_working: [exp.is_working || false],
          start_year: [exp.start_year?.toString() || '', Validators.required],
          start_month: [exp.start_month?.toString() || '', Validators.required],
          end_year: [exp.end_year?.toString() || ''],
          end_month: [exp.end_month?.toString() || '']
        });

        // 重新設定監聽器
        this.setupWorkExperienceListeners(experienceForm);
        this.experiencesFormArray.push(experienceForm);
      });
    }

    // 初始化學歷背景
    if (data.learning_experiences && data.learning_experiences.length > 0) {
      this.hasLearningExperiences.set(true);
      
      // 清空現有的學歷表單
      while (this.educationsFormArray.length > 0) {
        this.educationsFormArray.removeAt(0);
      }
      
      // 重新建立學歷表單
      data.learning_experiences.forEach((edu: any) => {
        const educationForm = this.fb.group({
          id: [edu.id || null], // 包含 id 欄位
          school_name: [edu.school_name || '', Validators.required],
          major: [edu.department || '', Validators.required],  // API 使用 department，表單使用 major
          degree: [edu.degree || '', Validators.required],
          is_studying: [edu.is_in_school || false],  // API 使用 is_in_school，表單使用 is_studying
          start_year: [edu.start_year?.toString() || '', Validators.required],
          start_month: [edu.start_month?.toString() || '', Validators.required],
          end_year: [edu.end_year?.toString() || ''],
          end_month: [edu.end_month?.toString() || '']
        });

        // 重新設定監聽器
        this.setupEducationListeners(educationForm);
        this.educationsFormArray.push(educationForm);
      });
    }

    // 初始化證照資料
    if (data.certificates && data.certificates.length > 0) {
      this.hasCertificates.set(true);
      
      // 清空現有的證照表單
      while (this.certificatesFormArray.length > 0) {
        this.certificatesFormArray.removeAt(0);
      }
      
      // 重新建立證照表單
      data.certificates.forEach((cert: any) => {
        const certificateForm = this.fb.group({
          id: [cert.id || null], // 包含 id 欄位
          holder_name: [cert.holder_name || '', Validators.required],  // 持有人姓名
          license_number: [cert.license_number || '', Validators.required],  // 證書號碼
          license_name: [cert.license_name || '', Validators.required],  // 證照名稱
          category_id: [cert.category_id?.toString() || '', Validators.required],  // 分類 ID
          verifying_institution: [cert.verifying_institution || '', Validators.required],  // 核發機構
          issue_year: [cert.issue_year?.toString() || '', Validators.required],    // 核發年份
          issue_month: [cert.issue_month?.toString() || '', Validators.required],  // 核發月份
          file_path: [null], // 檔案路徑
          file_name: [''] // 檔案名稱
        });

        this.certificatesFormArray.push(certificateForm);
      });
    }

    // 確保每個步驟至少有一個表單項目
    if (this.experiencesFormArray.length === 0) {
      this.addWorkExperience();
    }
    if (this.educationsFormArray.length === 0) {
      this.addEducation();
    }
    if (this.certificatesFormArray.length === 0) {
      this.addCertificate();
    }
  }

  // 設定工作經驗表單監聽器
  private setupWorkExperienceListeners(experienceForm: FormGroup) {
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
    experienceForm.get('city')?.valueChanges.subscribe(() => {
      experienceForm.patchValue({ district: '' });
    });
  }

  // 設定學歷表單監聽器
  private setupEducationListeners(educationForm: FormGroup) {
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
  }

  // 新增工作經驗表單項目
  addWorkExperience() {
    const experienceForm = this.fb.group({
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

    // 設定監聽器
    this.setupWorkExperienceListeners(experienceForm);

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
      id: [null], // 新增 id 欄位
      school_name: ['', Validators.required],
      major: ['', Validators.required],
      degree: ['', Validators.required],
      is_studying: [false],
      start_year: ['', Validators.required],
      start_month: ['', Validators.required],
      end_year: [''],
      end_month: ['']
    });

    // 設定監聽器
    this.setupEducationListeners(educationForm);

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
      id: [null], // 新增 id 欄位
      holder_name: ['', Validators.required], // 持有人姓名
      license_number: ['', Validators.required], // 證書號碼
      license_name: ['', Validators.required], // 證照名稱
      category_id: ['', Validators.required], // 證書主題分類 ID
      verifying_institution: ['', Validators.required], // 核發機構
      issue_year: ['', Validators.required], // 核發年份
      issue_month: ['', Validators.required], // 核發月份
      file_path: [null], // 證照檔案路徑
      file_name: [''] // 檔案名稱
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

  // 導航到教師後台
  goToTeacherDashboard(): void {
    this.router.navigate(['/dashboard/teacher']);
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
      case 5:
        return this.step1Valid && this.step2Valid && this.step3Valid && this.step4Valid;
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
    
    if (currentStepValue === 1 && this.step1Valid) {
      // 第一步：提交基本資料
      this.submitBasicInfo();
    } else if (currentStepValue === 2 && this.step2Valid) {
      // 第二步：提交工作經驗
      this.submitWorkExperiences();
    } else if (currentStepValue === 3 && this.step3Valid) {
      // 第三步：提交學歷背景
      this.submitLearningExperiences();
    } else if (currentStepValue === 4 && this.step4Valid) {
      // 第四步：提交證照資料
      this.submitCertificates();
    } else if (currentStepValue === 5) {
      // 第五步：確認資料後提交申請
      this.submitFinalApplication();
    }
  }

  // 提交基本資料 (第一步)
  private submitBasicInfo() {
    if (!this.step1Valid) {
      this.basicInfoFormGroup.markAllAsTouched();
      return;
    }

    const formData = this.basicInfoFormGroup.value;
    
    // 確保資料格式符合 API 需求
    const apiData = {
      city: formData.city,
      district: formData.district,
      address: formData.address,
      main_category_id: formData.main_category_id,
      sub_category_ids: formData.sub_category_ids,
      introduction: formData.introduction
    };

    // 根據基本資料狀態決定使用 POST 或 PUT
    if (this.hasBasicInfo()) {
      // 已有基本資料，使用 PUT 更新
      this.teachersService.putApiTeachersBasicInfo(apiData).subscribe({
        next: (response: any) => {
          this.currentStep.set(2);
        },
        error: (error: any) => {
          console.error('基本資料更新失敗:', error);
          // TODO: 顯示錯誤訊息給使用者
        }
      });
    } else {
      // 尚無基本資料，使用 POST 建立
      this.teachersService.postApiTeachersApply(apiData).subscribe({
        next: (response: any) => {
          // 成功後更新狀態
          this.isFirstTimeApply.set(false);
          this.hasBasicInfo.set(true);
          this.currentStep.set(2);
        },
        error: (error: any) => {
          console.error('基本資料建立失敗:', error);
          // TODO: 顯示錯誤訊息給使用者
        }
      });
    }
  }

  // 用 API 回應的 ID 更新表單
  private updateWorkExperiencesWithIds(responseData: any[]) {
    const formArray = this.experiencesFormArray;
    
    responseData.forEach((item, index) => {
      if (formArray.at(index)) {
        const currentFormValue = formArray.at(index).value;
        formArray.at(index).patchValue({ id: item.id });
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
    
    // 準備 API 資料格式
    const workExperiences = formData.experiences?.map((exp: any) => ({
      ...(exp.id && { id: exp.id }), // 如果有 id 就包含
      company_name: exp.company_name,
      city: exp.city,
      district: exp.district,
      job_category: exp.job_category,
      job_title: exp.job_title,
      is_working: exp.is_working,
      start_year: parseInt(exp.start_year),
      start_month: parseInt(exp.start_month),
      end_year: exp.end_year ? parseInt(exp.end_year) : null,
      end_month: exp.end_month ? parseInt(exp.end_month) : null
    })) || [];

    const apiData = {
      work_experiences: workExperiences
    };

    // 調試資訊：檢查當前狀態
    
    // 額外檢查：如果表單中有任何一個工作經驗包含 id，就表示已有資料
    const hasExistingExperience = this.experiencesFormArray.controls.some(control => control.get('id')?.value);
    
    // 調試：檢查每個工作經驗的 ID
    
    // 合併檢查：signal 狀態或表單中有 ID
    const shouldUseUpdate = this.hasWorkExperiences() || hasExistingExperience;
    
    // 根據工作經驗狀態決定使用 POST 或 PUT
    if (shouldUseUpdate) {
      // 已有工作經驗資料，使用 PUT 更新
      this.teachersService.putApiTeachersWorkExperiences(apiData).subscribe({
        next: (response: any) => {
          this.currentStep.set(3);
        },
        error: (error: any) => {
          console.error('工作經驗更新失敗:', error);
          // TODO: 顯示錯誤訊息給使用者
        }
      });
    } else {
      // 尚無工作經驗資料，使用 POST 建立
      this.teachersService.postApiTeachersWorkExperiences(apiData).subscribe({
        next: (response: any) => {
          
          // 從回應中取得 work_experiences 陣列及其 id
          if (response.data && response.data.work_experiences) {
            this.updateWorkExperiencesWithIds(response.data.work_experiences);
          } else if (response.work_experiences) {
            this.updateWorkExperiencesWithIds(response.work_experiences);
          }
          
          // 成功後更新狀態
          this.hasWorkExperiences.set(true);
          this.currentStep.set(3);
        },
        error: (error: any) => {
          console.error('工作經驗建立失敗:', error);
          // TODO: 顯示錯誤訊息給使用者
        }
      });
    }
  }

  // 提交學歷背景 (第三步)
  private submitLearningExperiences() {
    if (!this.step3Valid) {
      this.learningExperiencesFormGroup.markAllAsTouched();
      return;
    }

    const formData = this.learningExperiencesFormGroup.value;
    
    // 準備 API 資料格式
    const learningExperiences = formData.educations?.map((edu: any) => ({
      ...(edu.id && { id: edu.id }), // 如果有 id 就包含
      school_name: edu.school_name,
      department: edu.major,  // 表單使用 major，API 使用 department
      degree: edu.degree,
      is_in_school: edu.is_studying,  // 表單使用 is_studying，API 使用 is_in_school
      start_year: parseInt(edu.start_year),
      start_month: parseInt(edu.start_month),
      end_year: edu.end_year ? parseInt(edu.end_year) : null,
      end_month: edu.end_month ? parseInt(edu.end_month) : null
    })) || [];

    const apiData = {
      learning_experiences: learningExperiences
    };

    // 調試資訊：檢查當前狀態
    
    // 額外檢查：如果表單中有任何一個學歷包含 id，就表示已有資料
    const hasExistingEducation = this.educationsFormArray.controls.some(control => control.get('id')?.value);
    
    // 調試：檢查每個學歷背景的 ID
    
    // 合併檢查：signal 狀態或表單中有 ID
    const shouldUseUpdate = this.hasLearningExperiences() || hasExistingEducation;
    
    // 根據學歷背景狀態決定使用 POST 或 PUT
    if (shouldUseUpdate) {
      // 已有學歷背景資料，使用 PUT 更新
      this.teachersService.putApiTeachersLearningExperiences(apiData).subscribe({
        next: (response: any) => {
          this.currentStep.set(4);
        },
        error: (error: any) => {
          console.error('學歷背景更新失敗:', error);
          // TODO: 顯示錯誤訊息給使用者
        }
      });
    } else {
      // 尚無學歷背景資料，使用 POST 建立
      this.teachersService.postApiTeachersLearningExperiences(apiData).subscribe({
        next: (response: any) => {
          
          // 從回應中取得 learning_experiences 陣列及其 id
          if (response.data && response.data.learning_experiences) {
            this.updateLearningExperiencesWithIds(response.data.learning_experiences);
          } else if (response.learning_experiences) {
            this.updateLearningExperiencesWithIds(response.learning_experiences);
          } else {
          }
          
          // 成功後更新狀態
          this.hasLearningExperiences.set(true);
          this.currentStep.set(4);
        },
        error: (error: any) => {
          console.error('學歷背景建立失敗:', error);
          // TODO: 顯示錯誤訊息給使用者
        }
      });
    }
  }

  // 更新學歷背景表單中的 ID
  private updateLearningExperiencesWithIds(responseData: any[]) {
    const formArray = this.educationsFormArray;
    
    responseData.forEach((item, index) => {
      if (formArray.at(index)) {
        const currentFormValue = formArray.at(index).value;
        formArray.at(index).patchValue({ id: item.id });
      } else {
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
    
    // 準備 API 資料格式
    const certificates = formData.certificates?.map((cert: any) => ({
      ...(cert.id && { id: cert.id }), // 如果有 id 就包含
      verifying_institution: cert.verifying_institution,
      license_name: cert.license_name,
      holder_name: cert.holder_name,
      license_number: cert.license_number,
      file_path: cert.file_path || '',  // 檔案路徑，如果沒有則為空字串
      category_id: parseInt(cert.category_id) || 1,
      issue_year: parseInt(cert.issue_year),
      issue_month: parseInt(cert.issue_month)
    })) || [];

    const apiData = {
      certificates
    };

    // 調試資訊：檢查當前狀態
    
    // 額外檢查：如果表單中有任何一個證照包含 id，就表示已有資料
    const hasExistingCertificate = this.certificatesFormArray.controls.some(control => control.get('id')?.value);
    
    // 調試：檢查每個證照的 ID
    
    // 合併檢查：signal 狀態或表單中有 ID
    const shouldUseUpdate = this.hasCertificates() || hasExistingCertificate;
    
    // 根據證照狀態決定使用 POST 或 PUT
    if (shouldUseUpdate) {
      // 已有證照資料，使用 PUT 更新
      this.teachersService.putApiTeachersCertificates(apiData).subscribe({
        next: (response: any) => {
          // 跳到第五步確認資料
          this.currentStep.set(5);
        },
        error: (error: any) => {
          console.error('證照更新失敗:', error);
          // TODO: 顯示錯誤訊息給使用者
        }
      });
    } else {
      // 尚無證照資料，使用 POST 建立
      this.teachersService.postApiTeachersCertificates(apiData).subscribe({
        next: (response: any) => {
          
          // 從回應中取得 certificates 陣列及其 id
          if (response.data && response.data.certificates) {
            this.updateCertificatesWithIds(response.data.certificates);
          } else if (response.certificates) {
            this.updateCertificatesWithIds(response.certificates);
          } else {
          }
          
          // 成功後更新狀態
          this.hasCertificates.set(true);
          // 跳到第五步確認資料
          this.currentStep.set(5);
        },
        error: (error: any) => {
          console.error('證照建立失敗:', error);
          // TODO: 顯示錯誤訊息給使用者
        }
      });
    }
  }

  // 更新證照表單中的 ID
  private updateCertificatesWithIds(responseData: any[]) {
    const formArray = this.certificatesFormArray;
    
    responseData.forEach((item, index) => {
      if (formArray.at(index)) {
        const currentFormValue = formArray.at(index).value;
        formArray.at(index).patchValue({ id: item.id });
      } else {
      }
    });
  }

  // 最終申請提交
  private submitFinalApplication() {
    
    // 檢查所有步驟是否都已完成
    if (!this.hasBasicInfo() || !this.hasWorkExperiences() || 
        !this.hasLearningExperiences() || !this.hasCertificates()) {
      console.error('申請提交失敗：尚有步驟未完成');
      return;
    }

    
    // 呼叫最終提交 API
    this.teachersService.postApiTeachersSubmit().pipe(
      tap((response: any) => {
        console.log('申請提交成功:', response);
        this.isSubmitted.set(true); // 設定為已提交狀態
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
      next: (success) => {
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
      error: (error) => {
        console.error('角色更新失敗:', error);
        // 即使角色更新失敗，申請仍然成功提交
        alert('申請已成功提交！請重新登入以更新權限。');
      }
    });
  }
}