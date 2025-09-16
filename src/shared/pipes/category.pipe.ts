import { Pipe, PipeTransform } from '@angular/core';

// 主分類映射表 - 根據 API 資料
const CATEGORY_MAP: { [key: number]: string } = {
  1: '樂器演奏',
  2: '藝術創作',
  3: '舞蹈表演',
  4: '手作工藝',
  5: '程式設計',
  6: '語言學習',
  7: '運動健身',
  8: '學術輔導',
  9: '商業技能'
};

@Pipe({
  name: 'category',
  standalone: true,
  pure: true
})
export class CategoryPipe implements PipeTransform {
  transform(categoryId: number): string {
    if (!categoryId) return '';
    return CATEGORY_MAP[categoryId] || '';
  }
}