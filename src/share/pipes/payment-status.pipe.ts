import { Pipe, PipeTransform } from '@angular/core';

export enum PaymentStatus {
  PENDING = 'pending',        // 待付款 (對應原 OrderStatus.PENDING)
  PROCESSING = 'processing',  // 付款處理中
  COMPLETED = 'completed',    // 付款完成 (對應原 OrderStatus.PAID)
  FAILED = 'failed',          // 付款失敗
  CANCELLED = 'cancelled',    // 訂單取消 (對應原 OrderStatus.CANCELLED)
  EXPIRED = 'expired',        // 付款過期
  REFUNDED = 'refunded'       // 已退款
}

@Pipe({
  name: 'paymentStatus',
  standalone: true
})
export class PaymentStatusPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    switch (value) {
      case PaymentStatus.PENDING:
        return '待付款';
      case PaymentStatus.PROCESSING:
        return '付款處理中';
      case PaymentStatus.COMPLETED:
      case 'paid': // 支援舊的 API 回應格式
        return '已完成';
      case PaymentStatus.FAILED:
        return '付款失敗';
      case PaymentStatus.CANCELLED:
        return '已取消';
      case PaymentStatus.EXPIRED:
        return '付款過期';
      case PaymentStatus.REFUNDED:
        return '已退款';
      default:
        return '未知狀態';
    }
  }
}