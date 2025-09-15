import { Pipe, PipeTransform } from '@angular/core';

// 學歷程式碼映射表
const DEGREE_MAP: { [key: string]: string } = {
  'high_school': '高中',
  'bachelor': '學士',
  'master': '碩士',
  'phd': '博士'
};

@Pipe({
  name: 'degree',
  standalone: true,
  pure: true
})
export class DegreePipe implements PipeTransform {
  transform(degreeCode: string): string {
    if (!degreeCode) return '';
    return DEGREE_MAP[degreeCode] || '';
  }
}