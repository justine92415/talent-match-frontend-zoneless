import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reservationStatus'
})
export class ReservationStatusPipe implements PipeTransform {
  transform(teacherStatus: string | undefined, studentStatus: string | undefined): string {
    // 處理新的狀態邏輯
    if (teacherStatus === 'pending' && studentStatus === 'reserved') {
      return '待教師確認';
    }

    if (teacherStatus === 'reserved' && studentStatus === 'reserved') {
      return '已預約';
    }

    if (teacherStatus === 'completed' && studentStatus === 'completed') {
      return '已完成';
    }

    if (teacherStatus === 'cancelled' || studentStatus === 'cancelled') {
      return '已取消';
    }

    // 向下兼容舊的單一狀態邏輯 (如果只傳入一個參數)
    const status = teacherStatus || studentStatus || '';
    switch (status) {
      case 'reserved': return '已預約';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  }
}