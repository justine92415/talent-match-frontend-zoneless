import { Component, inject, signal, OnInit } from '@angular/core';
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
import { TeachersService } from '../../api/generated/teachers/teachers.service';
import { catchError, of } from 'rxjs';

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
export default class TeacherApply implements OnInit {
  private location = inject(Location);
  private fb = inject(FormBuilder);
  private teachersService = inject(TeachersService);

  // 申請狀態相關
  isFirstTimeApply = signal(true);  // 是否為初次申請
  isLoading = signal(true);         // 載入中狀態

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
          console.log('初次申請');
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
        console.log('已申請過，申請資料:', response);
        this.isFirstTimeApply.set(false);
        // TODO: 用回應資料初始化表單
        this.initializeFormWithData(response.data);
      }
    });
  }

  // 用申請資料初始化表單
  private initializeFormWithData(data: any) {
    console.log('初始化表單資料:', data);
    
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
          company_name: [exp.company_name || '', Validators.required],
          workplace_city: [exp.workplace_city || '', Validators.required],
          workplace_district: [exp.workplace_district || '', Validators.required],
          workplace_address: [exp.workplace_address || '', Validators.required],
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
          certificate_name: [cert.license_name || '', Validators.required],  // API 使用 license_name
          issuer: [cert.verifying_institution || '', Validators.required],  // API 使用 verifying_institution
          year: [cert.year?.toString() || '', Validators.required],
          month: [cert.month?.toString() || '', Validators.required],
          certificate_file: [null]
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
    experienceForm.get('workplace_city')?.valueChanges.subscribe(() => {
      experienceForm.patchValue({ workplace_district: '' });
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
    
    if (currentStepValue === 1 && this.step1Valid) {
      // 第一步：提交基本資料
      this.submitBasicInfo();
    } else if (currentStepValue === 2 && this.step2Valid) {
      // 第二步：提交工作經驗
      // TODO: 實作工作經驗提交
      this.currentStep.set(currentStepValue + 1);
    } else if (currentStepValue === 3 && this.step3Valid) {
      // 第三步：提交學歷背景
      // TODO: 實作學歷背景提交
      this.currentStep.set(currentStepValue + 1);
    } else if (currentStepValue === 4 && this.step4Valid) {
      // 第四步：提交證照資料
      // TODO: 實作證照提交，完成所有步驟
      this.submitForm();
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
          console.log('基本資料更新成功:', response);
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
          console.log('基本資料建立成功:', response);
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