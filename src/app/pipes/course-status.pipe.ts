import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'courseStatus',
  standalone: true
})
export class CourseStatusPipe implements PipeTransform {

  transform(status: string | undefined): string {
    // 完整的課程狀態對應
    const statusMap: { [key: string]: string } = {
      'draft': '草稿',
      'submitted': '審核中',
      'approved': '已核准',
      'rejected': '已拒絕',
      'published': '已發布',
      'archived': '已封存'
    };

    return statusMap[status || ''] || status || '未知狀態';
  }
}