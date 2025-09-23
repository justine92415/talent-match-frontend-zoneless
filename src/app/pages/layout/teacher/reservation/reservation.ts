import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@components/button/button';
import { InputSelect } from '@components/form/input-select/input-select';
import { InputText } from '@components/form/input-text/input-text';
import type { SelectOption } from '@components/form/input-select/input-select';

@Component({
  selector: 'tmf-reservation',
  imports: [CommonModule, Button, InputSelect, InputText, ReactiveFormsModule],
  templateUrl: './reservation.html',
  styles: ``
})
export default class Reservation {
  private fb = new FormBuilder();

  // 篩選表單
  filterForm: FormGroup = this.fb.group({
    course: [''],
    timeRange: [''],
    status: [''],
    student: ['']
  });

  // 課程選項
  courseOptions: SelectOption[] = [
    { value: '', label: '全部課程' },
    { value: 1, label: 'Python 程式設計進階' },
    { value: 2, label: 'JavaScript 前端開發' },
    { value: 3, label: 'React 框架應用' }
  ];

  // 時間範圍選項
  timeRangeOptions: SelectOption[] = [
    { value: '', label: '全部時間' },
    { value: 'today', label: '當日' },
    { value: 'week', label: '近一週' },
    { value: 'month', label: '近一個月' }
  ];

  // 預約狀態選項
  statusOptions: SelectOption[] = [
    { value: '', label: '全部狀態' },
    { value: 'reserved', label: '已預約' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
  ];

  // TODO: 實作教師查看學生預約功能
  // - API 整合
  // - 篩選功能
  // - 分頁功能
  // - 預約狀態管理
}