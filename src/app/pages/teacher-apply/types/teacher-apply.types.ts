export interface ApplyStatusData {
  basic_info: BasicInfoData | null;
  work_experiences: WorkExperienceData[];
  learning_experiences: LearningExperienceData[];
  certificates: CertificateData[];
  application_submitted_at: string | null;
  status: 'pending' | 'approved' | 'rejected' | null;
}

export interface BasicInfoData {
  city: string;
  district: string;
  address: string;
  main_category_id: number;
  sub_category_ids: number[];
  introduction: string;
}

export interface WorkExperienceData {
  id?: number;
  company_name: string;
  city: string;
  district: string;
  job_category: string;
  job_title: string;
  is_working: boolean;
  start_year: number;
  start_month: number;
  end_year: number | null;
  end_month: number | null;
}

export interface LearningExperienceData {
  id?: number;
  school_name: string;
  department: string;
  degree: string;
  is_in_school: boolean;
  start_year: number;
  start_month: number;
  end_year: number | null;
  end_month: number | null;
}

export interface CertificateData {
  id?: number;
  verifying_institution: string;
  license_name: string;
  holder_name: string;
  license_number: string;
  file_path: string;
  category_id: number;
  issue_year: number;
  issue_month: number;
}

export interface ApplyStepStatus {
  hasBasicInfo: boolean;
  hasWorkExperiences: boolean;
  hasLearningExperiences: boolean;
  hasCertificates: boolean;
}

export type ApplyStep = 1 | 2 | 3 | 4 | 5;