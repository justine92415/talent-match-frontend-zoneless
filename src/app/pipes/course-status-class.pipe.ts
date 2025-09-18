import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'courseStatusClass',
  standalone: true
})
export class CourseStatusClassPipe implements PipeTransform {

  transform(status: string | undefined): string {
    // 使用專案現有的顏色系統設計狀態樣式
    const statusClassMap: { [key: string]: string } = {
      'draft': 'px-2 py-1 rounded-sm text-sm text-center text-grey-66 bg-grey-d4',
      'submitted': 'px-2 py-1 rounded-sm text-sm text-center text-yellow bg-orange-95',
      'approved': 'px-2 py-1 rounded-sm text-sm text-center text-primary bg-orange-95',
      'rejected': 'px-2 py-1 rounded-sm text-sm text-center text-red-50 bg-grey-e9',
      'published': 'px-2 py-1 rounded-sm text-sm text-center text-primary bg-orange-90',
      'archived': 'px-2 py-1 rounded-sm text-sm text-center text-grey-66 bg-grey-e9'
    };

    return statusClassMap[status || ''] || 'px-2 py-1 rounded-sm text-sm text-center text-grey-66 bg-grey-d4';
  }
}