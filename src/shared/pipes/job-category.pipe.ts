import { Pipe, PipeTransform } from '@angular/core';

// 工作類別映射表 - 根據表單選項
const JOB_CATEGORY_MAP: { [key: string]: string } = {
  'education': '教育培訓',
  'software': '軟體開發',
  'design': '設計創意',
  'marketing': '行銷企劃',
  'finance': '財務會計',
  'management': '管理顧問',
  'sales': '業務銷售',
  'manufacturing': '製造業',
  'service': '服務業',
  'other': '其他'
};

@Pipe({
  name: 'jobCategory',
  standalone: true,
  pure: true
})
export class JobCategoryPipe implements PipeTransform {
  transform(categoryCode: string): string {
    if (!categoryCode) return '';
    return JOB_CATEGORY_MAP[categoryCode] || categoryCode;
  }
}