import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reservationStatus',
  standalone: true
})
export class ReservationStatusPipe implements PipeTransform {
  transform(
    teacherStatus: string | undefined,
    studentStatus: string | undefined,
  ): string {
    // 處理新的狀態邏輯
    if (teacherStatus === 'pending' && studentStatus === 'reserved') {
      return '待教師確認';
    }

    if (teacherStatus === 'reserved' && studentStatus === 'reserved') {
      return '已預約';
    }

    if (teacherStatus === 'overdue') {
      return '已結束';
    }

    if (teacherStatus === 'completed') {
      return '已完成';
    }

    if (teacherStatus === 'cancelled' || studentStatus === 'cancelled') {
      return '已取消';
    }

    // 向下兼容舊的單一狀態邏輯 (如果只傳入一個參數)
    const status = teacherStatus || studentStatus || '';
    switch (status) {
      case 'reserved':
        return '已預約';
      case 'overdue':
        return '已結束';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  }
}

@Pipe({
  name: 'reservationStatusClass',
  standalone: true
})
export class ReservationStatusClassPipe implements PipeTransform {
  transform(
    teacherStatus: string | undefined,
    studentStatus: string | undefined,
  ): string {
    if (teacherStatus === 'pending' && studentStatus === 'reserved') {
      return 'bg-orange-95 text-orange-55';
    }
    if (teacherStatus === 'reserved' && studentStatus === 'reserved') {
      return 'bg-green-95 text-green-55';
    }
    if (teacherStatus === 'overdue' || studentStatus === 'overdue') {
      return 'bg-grey-f4 text-grey-66';
    }
    if (teacherStatus === 'completed' && studentStatus === 'completed') {
      return 'bg-blue-95 text-blue-50';
    }
    if (teacherStatus === 'cancelled' || studentStatus === 'cancelled') {
      return 'bg-grey-d4 text-grey-66';
    }
    return 'bg-grey-f4 text-grey-66';
  }
}
