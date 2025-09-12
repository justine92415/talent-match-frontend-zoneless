import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

  // 基本資料表單
  basicInfoForm = this.fb.group({
    city: ['', Validators.required],
    district: ['', Validators.required],
    address: ['', Validators.required],
    subject: ['', Validators.required],
    specialties: [[] as string[], Validators.required],
    introduction: ['', [Validators.required, Validators.minLength(10)]]
  });

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
}
