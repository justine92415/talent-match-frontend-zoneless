import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApplyStatusData } from '../types/teacher-apply.types';
import { requiredValidator, minLengthValidator, arrayRequiredValidator, dateRangeValidator } from '@share/validator';

@Injectable({
  providedIn: 'root'
})
export class TeacherApplyFormService {
  private fb = inject(FormBuilder);

  /**
   * 建立完整的教師申請表單
   */
  createTeacherApplyForm(): FormGroup {
    return this.fb.group({
      basicInfo: this.createBasicInfoForm(),
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
  }

  /**
   * 建立基本資料表單
   */
  private createBasicInfoForm(): FormGroup {
    return this.fb.group({
      city: ['', requiredValidator('縣市')],
      district: ['', requiredValidator('地區')],
      address: ['', requiredValidator('詳細地址')],
      main_category_id: [null, requiredValidator('教授科目')],
      sub_category_ids: [[] as number[], arrayRequiredValidator('教學專長')],
      introduction: ['', minLengthValidator('自我介紹', 100)]
    });
  }

  /**
   * 建立工作經驗表單項目
   */
  createWorkExperienceForm(): FormGroup {
    const experienceForm = this.fb.group({
      id: [null],
      company_name: ['', requiredValidator('公司名稱')],
      city: ['', requiredValidator('縣市')],
      district: ['', requiredValidator('地區')],
      job_category: ['', requiredValidator('工作類別')],
      job_title: ['', requiredValidator('職稱')],
      is_working: [false],
      start_year: ['', requiredValidator('開始年份')],
      start_month: ['', requiredValidator('開始月份')],
      end_year: [''],
      end_month: ['']
    }, { validators: dateRangeValidator });

    // 設定監聽器
    this.setupWorkExperienceListeners(experienceForm);

    return experienceForm;
  }

  /**
   * 建立學歷背景表單項目
   */
  createEducationForm(): FormGroup {
    const educationForm = this.fb.group({
      id: [null],
      school_name: ['', requiredValidator('學校名稱')],
      department: ['', requiredValidator('科系')],
      degree: ['', requiredValidator('學位')],
      is_in_school: [false],
      start_year: ['', requiredValidator('入學年份')],
      start_month: ['', requiredValidator('入學月份')],
      end_year: [''],
      end_month: ['']
    }, { validators: dateRangeValidator });

    // 設定監聽器
    this.setupEducationListeners(educationForm);

    return educationForm;
  }

  /**
   * 建立證照表單項目
   */
  createCertificateForm(): FormGroup {
    return this.fb.group({
      id: [null],
      holder_name: ['', requiredValidator('持有人姓名')],
      license_number: ['', requiredValidator('證書號碼')],
      license_name: ['', requiredValidator('證照名稱')],
      category_id: ['', requiredValidator('證書主題')],
      verifying_institution: ['', requiredValidator('核發機構')],
      issue_year: ['', requiredValidator('取得年份')],
      issue_month: ['', requiredValidator('取得月份')],
      file_path: [null],
      file_name: ['']
    });
  }

  /**
   * 設定工作經驗表單監聽器
   */
  private setupWorkExperienceListeners(experienceForm: FormGroup): void {
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
        endYearControl?.setValidators([requiredValidator('結束年份')]);
        endMonthControl?.setValidators([requiredValidator('結束月份')]);
      }

      endYearControl?.updateValueAndValidity();
      endMonthControl?.updateValueAndValidity();
      // 觸發表單層級的日期範圍驗證
      experienceForm.updateValueAndValidity();
    });

    // 監聽日期欄位變化，觸發日期範圍驗證
    ['start_year', 'start_month', 'end_year', 'end_month'].forEach(fieldName => {
      experienceForm.get(fieldName)?.valueChanges.subscribe(() => {
        experienceForm.updateValueAndValidity();
      });
    });

    // 監聽縣市變化，重置地區選項
    experienceForm.get('city')?.valueChanges.subscribe(() => {
      experienceForm.patchValue({ district: '' });
    });
  }

  /**
   * 設定學歷表單監聽器
   */
  private setupEducationListeners(educationForm: FormGroup): void {
    // 監聽目前就學狀態，控制結束日期的必填驗證
    educationForm.get('is_in_school')?.valueChanges.subscribe(isStudying => {
      const endYearControl = educationForm.get('end_year');
      const endMonthControl = educationForm.get('end_month');

      if (isStudying) {
        endYearControl?.clearValidators();
        endMonthControl?.clearValidators();
        endYearControl?.setValue('');
        endMonthControl?.setValue('');
      } else {
        endYearControl?.setValidators([requiredValidator('畢業年份')]);
        endMonthControl?.setValidators([requiredValidator('畢業月份')]);
      }

      endYearControl?.updateValueAndValidity();
      endMonthControl?.updateValueAndValidity();
      // 觸發表單層級的日期範圍驗證
      educationForm.updateValueAndValidity();
    });

    // 監聽日期欄位變化，觸發日期範圍驗證
    ['start_year', 'start_month', 'end_year', 'end_month'].forEach(fieldName => {
      educationForm.get(fieldName)?.valueChanges.subscribe(() => {
        educationForm.updateValueAndValidity();
      });
    });
  }

  /**
   * 用申請資料初始化表單
   */
  populateFormWithData(form: FormGroup, data: ApplyStatusData): void {
    // 初始化基本資料
    if (data.basic_info) {
      const basicInfo = data.basic_info;
      form.get('basicInfo')?.patchValue({
        city: basicInfo.city || '',
        district: basicInfo.district || '',
        address: basicInfo.address || '',
        main_category_id: basicInfo.main_category_id || null,
        sub_category_ids: basicInfo.sub_category_ids || [],
        introduction: basicInfo.introduction || ''
      });
    }

    // 初始化工作經驗
    if (data.work_experiences && data.work_experiences.length > 0) {
      const experiencesArray = form.get('workExperiences.experiences') as FormArray;

      // 清空現有的工作經驗表單
      while (experiencesArray.length > 0) {
        experiencesArray.removeAt(0);
      }

      // 重新建立工作經驗表單
      data.work_experiences.forEach((exp: any) => {
        const experienceForm = this.fb.group({
          id: [exp.id || null],
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
        }, { validators: dateRangeValidator });

        // 重新設定監聽器
        this.setupWorkExperienceListeners(experienceForm);
        experiencesArray.push(experienceForm);
      });
    }

    // 初始化學歷背景
    if (data.learning_experiences && data.learning_experiences.length > 0) {
      const educationsArray = form.get('learningExperiences.educations') as FormArray;

      // 清空現有的學歷表單
      while (educationsArray.length > 0) {
        educationsArray.removeAt(0);
      }

      // 重新建立學歷表單
      data.learning_experiences.forEach((edu: any) => {
        const educationForm = this.fb.group({
          id: [edu.id || null],
          school_name: [edu.school_name || '', Validators.required],
          department: [edu.department || '', Validators.required], // API 使用 department，表單使用 department
          degree: [edu.degree || '', Validators.required],
          is_in_school: [edu.is_in_school || false], // API 使用 is_in_school，表單使用 is_in_school
          start_year: [edu.start_year?.toString() || '', Validators.required],
          start_month: [edu.start_month?.toString() || '', Validators.required],
          end_year: [edu.end_year?.toString() || ''],
          end_month: [edu.end_month?.toString() || '']
        }, { validators: dateRangeValidator });

        // 重新設定監聽器
        this.setupEducationListeners(educationForm);
        educationsArray.push(educationForm);
      });
    }

    // 初始化證照資料
    if (data.certificates && data.certificates.length > 0) {
      const certificatesArray = form.get('certificates.certificates') as FormArray;

      // 清空現有的證照表單
      while (certificatesArray.length > 0) {
        certificatesArray.removeAt(0);
      }

      // 重新建立證照表單
      data.certificates.forEach((cert: any) => {
        const certificateForm = this.fb.group({
          id: [cert.id || null],
          holder_name: [cert.holder_name || '', Validators.required],
          license_number: [cert.license_number || '', Validators.required],
          license_name: [cert.license_name || '', Validators.required],
          category_id: [cert.category_id?.toString() || '', Validators.required],
          verifying_institution: [cert.verifying_institution || '', Validators.required],
          issue_year: [cert.issue_year?.toString() || '', Validators.required],
          issue_month: [cert.issue_month?.toString() || '', Validators.required],
          file_path: [null],
          file_name: ['']
        });

        certificatesArray.push(certificateForm);
      });
    }
  }

  /**
   * 確保每個步驟至少有一個表單項目
   */
  ensureMinimumFormItems(form: FormGroup): void {
    const experiencesArray = form.get('workExperiences.experiences') as FormArray;
    const educationsArray = form.get('learningExperiences.educations') as FormArray;
    const certificatesArray = form.get('certificates.certificates') as FormArray;

    if (experiencesArray.length === 0) {
      experiencesArray.push(this.createWorkExperienceForm());
    }

    if (educationsArray.length === 0) {
      educationsArray.push(this.createEducationForm());
    }

    if (certificatesArray.length === 0) {
      certificatesArray.push(this.createCertificateForm());
    }
  }

  /**
   * 更新表單中的 ID（用於 API 回應後更新）
   */
  updateFormArrayIds(formArray: FormArray, responseData: any[]): void {
    responseData.forEach((item, index) => {
      if (formArray.at(index)) {
        formArray.at(index).patchValue({ id: item.id });
      }
    });
  }
}