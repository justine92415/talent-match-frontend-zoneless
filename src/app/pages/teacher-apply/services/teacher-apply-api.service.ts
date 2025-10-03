import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TeachersService } from '../../../api/generated/teachers/teachers.service';
import {
  ApplyStatusData,
  BasicInfoData,
  WorkExperienceData,
  LearningExperienceData,
  CertificateData
} from '../types/teacher-apply.types';

@Injectable({
  providedIn: 'root'
})
export class TeacherApplyApiService {
  private teachersService = inject(TeachersService);

  /**
   * 檢查教師申請狀態
   */
  checkApplyStatus(): Observable<ApplyStatusData | null> {
    return this.teachersService.getApiTeachersApplyStatus().pipe(
      map((response: any) => {
        // 處理 API 回應結構 { status, message, data }
        if (response && response.data) {
          const data = response.data;
          return {
            basic_info: data.basic_info,
            work_experiences: data.work_experiences || [],
            learning_experiences: data.learning_experiences || [],
            certificates: data.certificates || [],
            application_submitted_at: data.application_submitted_at,
            status: data.application_status // API 使用 application_status，我們的型別使用 status
          } as ApplyStatusData;
        }
        return null;
      }),
      catchError(error => {
        if (error.status === 404) {
          // 404 表示未申請過
          return of(null);
        }
        console.error('檢查申請狀態失敗:', error);
        throw error;
      })
    );
  }

  /**
   * 提交基本資料 - 首次申請
   */
  submitBasicInfo(data: BasicInfoData): Observable<any> {
    return this.teachersService.postApiTeachersApply(data);
  }

  /**
   * 更新基本資料 - 修改申請
   */
  updateBasicInfo(data: BasicInfoData): Observable<any> {
    return this.teachersService.putApiTeachersBasicInfo(data);
  }

  /**
   * 提交工作經驗 - 首次申請
   */
  submitWorkExperiences(experiences: WorkExperienceData[]): Observable<any> {
    return this.teachersService.postApiTeachersWorkExperiences({
      work_experiences: experiences
    });
  }

  /**
   * 更新工作經驗 - 修改申請
   */
  updateWorkExperiences(experiences: WorkExperienceData[]): Observable<any> {
    return this.teachersService.putApiTeachersWorkExperiences({
      work_experiences: experiences
    });
  }

  /**
   * 提交學歷背景 - 首次申請
   */
  submitLearningExperiences(experiences: LearningExperienceData[]): Observable<any> {
    const transformedExperiences = experiences.map(exp =>
      this.transformLearningExperienceForApi(exp)
    );
    return this.teachersService.postApiTeachersLearningExperiences({
      learning_experiences: transformedExperiences as any
    });
  }

  /**
   * 更新學歷背景 - 修改申請
   */
  updateLearningExperiences(experiences: LearningExperienceData[]): Observable<any> {
    const transformedExperiences = experiences.map(exp =>
      this.transformLearningExperienceForApi(exp)
    );
    return this.teachersService.putApiTeachersLearningExperiences({
      learning_experiences: transformedExperiences as any
    });
  }

  /**
   * 提交證照資料 - 首次申請
   */
  submitCertificates(certificates: CertificateData[]): Observable<any> {
    return this.teachersService.postApiTeachersCertificates({
      certificates
    });
  }

  /**
   * 更新證照資料 - 修改申請
   */
  updateCertificates(certificates: CertificateData[]): Observable<any> {
    return this.teachersService.putApiTeachersCertificates({
      certificates
    });
  }

  /**
   * 最終提交申請
   */
  submitFinalApplication(): Observable<any> {
    return this.teachersService.postApiTeachersSubmit();
  }

  /**
   * 重新提交申請
   */
  resubmitApplication(): Observable<any> {
    return this.teachersService.postApiTeachersResubmit();
  }

  /**
   * 轉換表單資料為 API 格式 - 工作經驗
   */
  transformWorkExperienceForApi(formData: any): WorkExperienceData {
    // 當 is_working 為 true 時,強制將結束日期設為 null
    const shouldClearEndDate = formData.is_working === true;

    return {
      ...(formData.id && { id: formData.id }),
      company_name: formData.company_name,
      city: formData.city,
      district: formData.district,
      job_category: formData.job_category,
      job_title: formData.job_title,
      is_working: formData.is_working,
      start_year: parseInt(formData.start_year),
      start_month: parseInt(formData.start_month),
      end_year: shouldClearEndDate ? null : (formData.end_year ? parseInt(formData.end_year) : null),
      end_month: shouldClearEndDate ? null : (formData.end_month ? parseInt(formData.end_month) : null)
    };
  }

  /**
   * 轉換表單資料為 API 格式 - 學歷背景
   */
  transformLearningExperienceForApi(formData: any): any {
    // 當 is_in_school 為 true 時,強制將結束日期設為 null
    const shouldClearEndDate = formData.is_in_school === true;

    return {
      ...(formData.id && { id: formData.id }),
      school_name: formData.school_name,
      department: formData.department,
      degree: formData.degree,
      is_in_school: formData.is_in_school,
      start_year: parseInt(formData.start_year),
      start_month: parseInt(formData.start_month),
      end_year: shouldClearEndDate ? null : (formData.end_year ? parseInt(formData.end_year) : null),
      end_month: shouldClearEndDate ? null : (formData.end_month ? parseInt(formData.end_month) : null)
    };
  }

  /**
   * 轉換表單資料為 API 格式 - 證照資料
   */
  transformCertificateForApi(formData: any): CertificateData {
    return {
      ...(formData.id && { id: formData.id }),
      verifying_institution: formData.verifying_institution,
      license_name: formData.license_name,
      holder_name: formData.holder_name,
      license_number: formData.license_number,
      file_path: formData.file_path || '',
      category_id: parseInt(formData.category_id) || 1,
      issue_year: parseInt(formData.issue_year),
      issue_month: parseInt(formData.issue_month)
    };
  }
}