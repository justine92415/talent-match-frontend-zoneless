import { Pipe, PipeTransform } from '@angular/core';

export enum PurchaseWay {
  ALL = 'all',
  LINE_PAY = 'line_pay',
  CREDIT_CARD = 'credit_card',
  ATM = 'atm',
  CVS = 'cvs'
}

@Pipe({
  name: 'purchaseWay',
  standalone: true
})
export class PurchaseWayPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    switch (value) {
      case PurchaseWay.LINE_PAY:
        return 'LINE Pay';
      case PurchaseWay.CREDIT_CARD:
        return '信用卡';
      case PurchaseWay.ATM:
        return 'ATM 轉帳';
      case PurchaseWay.CVS:
        return '超商代碼';
      case PurchaseWay.ALL:
        return '全部';
      default:
        return '信用卡';
    }
  }
}