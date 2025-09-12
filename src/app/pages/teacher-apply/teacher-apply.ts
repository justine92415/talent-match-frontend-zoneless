import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormArray, FormGroup } from '@angular/forms';
import { Layout1Wapper } from '@components/layout-1-wapper/layout-1-wapper';
import { Stepper, StepItem } from '@components/stepper/stepper';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { InputMultiSelect, MultiSelectOption } from '../../../components/form/input-multi-select/input-multi-select';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Location } from '@angular/common';

@Component({
  selector: 'tmf-teacher-apply',
  imports: [
    Layout1Wapper,
    Stepper,
    InputText,
    InputSelect,
    InputMultiSelect,
    Button,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './teacher-apply.html',
  styles: ``
})
export default class TeacherApply {
  private fb = inject(FormBuilder);
  private location = inject(Location);

  currentStep = signal(1);

  // 自訂陣列長度驗證器
  private arrayRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!Array.isArray(value) || value.length === 0) {
      return { required: true };
    }
    return null;
  }
  
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

  // 縣市選項
  cityOptions: SelectOption[] = [
    { value: 'taipei', label: '台北市' },
    { value: 'new-taipei', label: '新北市' },
    { value: 'taoyuan', label: '桃園市' },
    { value: 'taichung', label: '台中市' },
    { value: 'tainan', label: '台南市' },
    { value: 'kaohsiung', label: '高雄市' }
  ];

  // 地區選項 - 根據縣市動態載入
  districtOptions = signal<SelectOption[]>([]);

  // 教授科目選項 (主分類)
  subjectOptions: SelectOption[] = [
    { value: 'math', label: '數學' },
    { value: 'science', label: '自然科學' },
    { value: 'english', label: '英文' },
    { value: 'chinese', label: '國文' },
    { value: 'social', label: '社會' },
    { value: 'arts', label: '藝術' },
    { value: 'pe', label: '體育' },
    { value: 'computer', label: '資訊' }
  ];

  // 教學專長選項 (次分類) - 根據主分類動態載入
  specialtyOptions = signal<MultiSelectOption[]>([]);

  // 工作類別選項
  jobCategoryOptions: SelectOption[] = [
    { value: 'education', label: '教育培訓' },
    { value: 'software', label: '軟體開發' },
    { value: 'design', label: '設計創意' },
    { value: 'marketing', label: '行銷企劃' },
    { value: 'finance', label: '財務會計' },
    { value: 'management', label: '管理顧問' },
    { value: 'sales', label: '業務銷售' },
    { value: 'manufacturing', label: '製造業' },
    { value: 'service', label: '服務業' },
    { value: 'other', label: '其他' }
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

  // 學位選項
  degreeOptions: SelectOption[] = [
    { value: 'high_school', label: '高中職' },
    { value: 'associate', label: '專科' },
    { value: 'bachelor', label: '學士' },
    { value: 'master', label: '碩士' },
    { value: 'phd', label: '博士' }
  ];

  // 基本資料表單
  basicInfoForm = this.fb.group({
    city: ['', Validators.required],
    district: ['', Validators.required],
    address: ['', Validators.required],
    subject: ['', Validators.required],
    specialties: [[] as string[], this.arrayRequiredValidator],
    introduction: ['', [Validators.required, Validators.minLength(10)]]
  });

  // 工作經驗表單
  workExperienceForm = this.fb.group({
    experiences: this.fb.array([])
  });

  get experiencesArray(): FormArray {
    return this.workExperienceForm.get('experiences') as FormArray;
  }

  // 學歷背景表單
  educationForm = this.fb.group({
    educations: this.fb.array([])
  });

  get educationsArray(): FormArray {
    return this.educationForm.get('educations') as FormArray;
  }

  // 教學證照表單
  certificateForm = this.fb.group({
    certificates: this.fb.array([])
  });

  get certificatesArray(): FormArray {
    return this.certificateForm.get('certificates') as FormArray;
  }

  constructor() {
    // 監聽縣市變化，更新地區選項
    this.basicInfoForm.get('city')?.valueChanges.subscribe(city => {
      this.updateDistrictOptions(city);
      // 清空已選的地區
      this.basicInfoForm.patchValue({ district: '' });
    });

    // 監聽主分類變化，更新專長選項
    this.basicInfoForm.get('subject')?.valueChanges.subscribe(subject => {
      this.updateSpecialtyOptions(subject);
      // 清空已選的專長
      this.basicInfoForm.patchValue({ specialties: [] });
    });

    // 初始化時新增一個工作經驗、一個學歷和一個證照
    this.addExperience();
    this.addEducation();
    this.addCertificate();
  }

  goBack() {
    this.location.back();
  }

  onStepChange(step: number) {
    if (step <= this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  updateDistrictOptions(city: string | null) {
    const districtMap: { [key: string]: SelectOption[] } = {
      'taipei': [
        { value: 'zhongzheng', label: '中正區' },
        { value: 'datong', label: '大同區' },
        { value: 'zhongshan', label: '中山區' },
        { value: 'songshan', label: '松山區' },
        { value: 'daan', label: '大安區' },
        { value: 'wanhua', label: '萬華區' },
        { value: 'xinyi', label: '信義區' },
        { value: 'shilin', label: '士林區' },
        { value: 'beitou', label: '北投區' },
        { value: 'neihu', label: '內湖區' },
        { value: 'nangang', label: '南港區' },
        { value: 'wenshan', label: '文山區' }
      ],
      'new-taipei': [
        { value: 'banqiao', label: '板橋區' },
        { value: 'sanchong', label: '三重區' },
        { value: 'zhonghe', label: '中和區' },
        { value: 'yonghe', label: '永和區' },
        { value: 'xinzhuang', label: '新莊區' },
        { value: 'xindian', label: '新店區' },
        { value: 'tucheng', label: '土城區' },
        { value: 'luzhou', label: '蘆洲區' },
        { value: 'shulin', label: '樹林區' },
        { value: 'yingge', label: '鶯歌區' },
        { value: 'sanxia', label: '三峽區' },
        { value: 'tamsui', label: '淡水區' }
      ],
      'taoyuan': [
        { value: 'taoyuan', label: '桃園區' },
        { value: 'zhongli', label: '中壢區' },
        { value: 'dayuan', label: '大園區' },
        { value: 'yangmei', label: '楊梅區' },
        { value: 'luzhu', label: '蘆竹區' },
        { value: 'daxi', label: '大溪區' },
        { value: 'pingzhen', label: '平鎮區' },
        { value: 'bade', label: '八德區' },
        { value: 'longtan', label: '龍潭區' },
        { value: 'guishan', label: '龜山區' },
        { value: 'dasi', label: '大園區' },
        { value: 'guanyin', label: '觀音區' },
        { value: 'xinwu', label: '新屋區' }
      ],
      'taichung': [
        { value: 'central', label: '中區' },
        { value: 'east', label: '東區' },
        { value: 'south', label: '南區' },
        { value: 'west', label: '西區' },
        { value: 'north', label: '北區' },
        { value: 'beitun', label: '北屯區' },
        { value: 'xitun', label: '西屯區' },
        { value: 'nantun', label: '南屯區' }
      ],
      'tainan': [
        { value: 'central-west', label: '中西區' },
        { value: 'east', label: '東區' },
        { value: 'south', label: '南區' },
        { value: 'north', label: '北區' },
        { value: 'anping', label: '安平區' },
        { value: 'annan', label: '安南區' }
      ],
      'kaohsiung': [
        { value: 'xinxing', label: '新興區' },
        { value: 'qianjin', label: '前金區' },
        { value: 'lingya', label: '苓雅區' },
        { value: 'yancheng', label: '鹽埕區' },
        { value: 'gushan', label: '鼓山區' },
        { value: 'qijin', label: '旗津區' },
        { value: 'qianzhen', label: '前鎮區' },
        { value: 'sanmin', label: '三民區' },
        { value: 'zuoying', label: '左營區' }
      ]
    };

    this.districtOptions.set(city ? districtMap[city] || [] : []);
  }

  updateSpecialtyOptions(subject: string | null) {
    const specialtyMap: { [key: string]: MultiSelectOption[] } = {
      'math': [
        { value: 'algebra', label: '代數' },
        { value: 'geometry', label: '幾何' },
        { value: 'calculus', label: '微積分' },
        { value: 'statistics', label: '統計' }
      ],
      'science': [
        { value: 'physics', label: '物理' },
        { value: 'chemistry', label: '化學' },
        { value: 'biology', label: '生物' },
        { value: 'earth-science', label: '地球科學' }
      ],
      'english': [
        { value: 'grammar', label: '文法' },
        { value: 'conversation', label: '會話' },
        { value: 'writing', label: '寫作' },
        { value: 'reading', label: '閱讀理解' }
      ],
      'chinese': [
        { value: 'classical', label: '古典文學' },
        { value: 'modern', label: '現代文學' },
        { value: 'composition', label: '作文' },
        { value: 'reading', label: '閱讀理解' }
      ]
    };

    this.specialtyOptions.set(subject ? specialtyMap[subject] || [] : []);
  }

  onSubmitBasicInfo() {
    if (this.basicInfoForm.valid) {
      console.log('基本資料:', this.basicInfoForm.value);
      // TODO: 儲存資料並進入下一步
      this.currentStep.set(2);
    } else {
      this.basicInfoForm.markAllAsTouched();
    }
  }

  // 工作經驗相關方法
  createExperience(): FormGroup {
    const experienceGroup = this.fb.group({
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
    experienceGroup.get('is_working')?.valueChanges.subscribe(isWorking => {
      const endYearControl = experienceGroup.get('end_year');
      const endMonthControl = experienceGroup.get('end_month');
      
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

    return experienceGroup;
  }

  addExperience(): void {
    this.experiencesArray.push(this.createExperience());
  }

  removeExperience(index: number): void {
    if (this.experiencesArray.length > 1) {
      this.experiencesArray.removeAt(index);
    }
  }

  onSubmitWorkExperience() {
    if (this.workExperienceForm.valid) {
      console.log('工作經驗:', this.workExperienceForm.value);
      // TODO: 儲存資料並進入下一步
      this.currentStep.set(3);
    } else {
      this.workExperienceForm.markAllAsTouched();
    }
  }

  // 工作經驗地區選項更新
  updateWorkplaceDistrictOptions(city: string | null, experienceIndex: number) {
    const districtMap: { [key: string]: SelectOption[] } = {
      'taipei': [
        { value: 'zhongzheng', label: '中正區' },
        { value: 'datong', label: '大同區' },
        { value: 'zhongshan', label: '中山區' },
        { value: 'songshan', label: '松山區' },
        { value: 'daan', label: '大安區' },
        { value: 'wanhua', label: '萬華區' },
        { value: 'xinyi', label: '信義區' },
        { value: 'shilin', label: '士林區' },
        { value: 'beitou', label: '北投區' },
        { value: 'neihu', label: '內湖區' },
        { value: 'nangang', label: '南港區' },
        { value: 'wenshan', label: '文山區' }
      ],
      'new-taipei': [
        { value: 'banqiao', label: '板橋區' },
        { value: 'sanchong', label: '三重區' },
        { value: 'zhonghe', label: '中和區' },
        { value: 'yonghe', label: '永和區' },
        { value: 'xinzhuang', label: '新莊區' },
        { value: 'xindian', label: '新店區' },
        { value: 'tucheng', label: '土城區' },
        { value: 'luzhou', label: '蘆洲區' },
        { value: 'shulin', label: '樹林區' },
        { value: 'yingge', label: '鶯歌區' },
        { value: 'sanxia', label: '三峽區' },
        { value: 'tamsui', label: '淡水區' }
      ]
      // 可以新增其他縣市的地區選項
    };

    // 這裡需要在模板中動態處理地區選項
    // 暫時返回基本的台北市地區選項作為示例
    return city ? districtMap[city] || [] : [];
  }

  // 學歷背景相關方法
  createEducation(): FormGroup {
    const educationGroup = this.fb.group({
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
    educationGroup.get('is_studying')?.valueChanges.subscribe(isStudying => {
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
    });

    return educationGroup;
  }

  addEducation(): void {
    this.educationsArray.push(this.createEducation());
  }

  removeEducation(index: number): void {
    if (this.educationsArray.length > 1) {
      this.educationsArray.removeAt(index);
    }
  }

  onSubmitEducation() {
    if (this.educationForm.valid) {
      console.log('學歷背景:', this.educationForm.value);
      // TODO: 儲存資料並進入下一步
      this.currentStep.set(4);
    } else {
      this.educationForm.markAllAsTouched();
    }
  }

  // 教學證照相關方法
  createCertificate(): FormGroup {
    return this.fb.group({
      certificate_name: ['', Validators.required],
      issuer: ['', Validators.required],
      year: ['', Validators.required],
      month: ['', Validators.required],
      certificate_file: [null]
    });
  }

  addCertificate(): void {
    this.certificatesArray.push(this.createCertificate());
  }

  removeCertificate(index: number): void {
    if (this.certificatesArray.length > 1) {
      this.certificatesArray.removeAt(index);
    }
  }

  onCertificateFileChange(event: any, certificateIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      // 檔案大小限制 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('檔案大小不能超過 5MB');
        return;
      }
      
      // 檔案類型限制
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('只允許上傳 PDF、JPG、PNG 格式的檔案');
        return;
      }

      const certificateControl = this.certificatesArray.at(certificateIndex);
      certificateControl.patchValue({ certificate_file: file });
    }
  }

  onSubmitCertificate() {
    if (this.certificateForm.valid) {
      console.log('教學證照:', this.certificateForm.value);
      // TODO: 儲存資料並完成申請
      alert('教師申請已提交！');
    } else {
      this.certificateForm.markAllAsTouched();
    }
  }
}
