import { Component, inject, signal, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';

@Component({
  selector: 'tmf-work-experiences-form',
  imports: [
    InputText,
    InputSelect,
    Button,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './work-experiences-form.html',
  styles: ``
})
export class WorkExperiencesForm {
  private fb = inject(FormBuilder);

  // 輸入屬性
  initialData = input<any>(null);

  // 輸出事件
  formSubmit = output<any>();
  formValid = output<boolean>();

  get TmfIcon() {
    return TmfIconEnum;
  }

  // 縣市選項
  cityOptions: SelectOption[] = [
    { value: 'taipei', label: '台北市' },
    { value: 'new-taipei', label: '新北市' },
    { value: 'taoyuan', label: '桃園市' },
    { value: 'taichung', label: '台中市' },
    { value: 'tainan', label: '台南市' },
    { value: 'kaohsiung', label: '高雄市' }
  ];

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

  // 工作經驗表單
  workExperienceForm = this.fb.group({
    experiences: this.fb.array([])
  });

  get experiencesArray(): FormArray {
    return this.workExperienceForm.get('experiences') as FormArray;
  }

  constructor() {
    // 監聽表單狀態變化
    this.workExperienceForm.statusChanges.subscribe(status => {
      this.formValid.emit(status === 'VALID');
    });

    // 如果有初始資料，填入表單
    if (this.initialData()) {
      this.loadInitialData();
    } else {
      // 預設新增一個工作經驗
      this.addExperience();
    }
  }

  private loadInitialData() {
    const data = this.initialData();
    if (data?.experiences && Array.isArray(data.experiences)) {
      // 清空現有的工作經驗
      while (this.experiencesArray.length !== 0) {
        this.experiencesArray.removeAt(0);
      }
      
      // 加載初始資料
      data.experiences.forEach((exp: any) => {
        const experienceGroup = this.createExperience();
        experienceGroup.patchValue(exp);
        this.experiencesArray.push(experienceGroup);
      });
    } else {
      this.addExperience();
    }
  }

  // 建立工作經驗 FormGroup
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

    // 監聽縣市變化，重置地區選項
    experienceGroup.get('workplace_city')?.valueChanges.subscribe(() => {
      experienceGroup.patchValue({ workplace_district: '' });
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

  // 取得地區選項
  getDistrictOptions(city: string | null): SelectOption[] {
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

    return city ? districtMap[city] || [] : [];
  }

  onSubmit() {
    if (this.workExperienceForm.valid) {
      this.formSubmit.emit(this.workExperienceForm.value);
    } else {
      this.workExperienceForm.markAllAsTouched();
    }
  }

  // 取得表單資料
  getFormData() {
    return this.workExperienceForm.value;
  }

  // 檢查表單是否有效
  isFormValid() {
    return this.workExperienceForm.valid;
  }

  // 檢查表單是否有變更
  isFormDirty() {
    return this.workExperienceForm.dirty;
  }
}
