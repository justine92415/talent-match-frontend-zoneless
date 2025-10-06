import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { Stepper, StepItem } from '@components/stepper/stepper';
import { Button } from '@components/button/button';
import { OrdersService } from '../../../api/generated/orders/orders.service';
import { PurchaseWayPipe } from '../../../../share/pipes/purchase-way.pipe';
import { PaymentStatusPipe } from '../../../../share/pipes/payment-status.pipe';

@Component({
  selector: 'tmf-payment-result',
  imports: [CommonModule, Stepper, Button, PurchaseWayPipe, PaymentStatusPipe],
  templateUrl: './payment-result.html'
})
export default class PaymentResultComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);

  // 步驟定義
  steps: StepItem[] = [
    { id: 1, label: '購物清單' },
    { id: 2, label: '訂單資訊' },
    { id: 3, label: '付款完成' }
  ];

  // 取得訂單詳情
  orderResource = rxResource({
    params: () => Number(this.route.snapshot.paramMap.get('orderId')),
    stream: ({params}) => this.ordersService.getApiOrdersOrderId(params)
  });


  goToShopping() {
    this.router.navigate(['/result-tag']);
  }

  goToOrders() {
    this.router.navigate(['/dashboard/student/record']);
  }

  goToReservation() {
    this.router.navigate(['/dashboard/student/courses']);
  }
}