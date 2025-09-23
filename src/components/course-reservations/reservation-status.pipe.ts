import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reservationStatus'
})
export class ReservationStatusPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'reserved': return '已預約';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  }
}