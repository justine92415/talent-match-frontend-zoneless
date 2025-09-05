import { Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Stepper, StepItem } from '../../../../components/stepper/stepper';

@Component({
  selector: 'tmf-cart',
  imports: [MatIcon, Stepper],
  templateUrl: './cart.html',
  styles: ``
})
export default class Cart {
  // 步驟定義
  steps: StepItem[] = [
    { id: 1, label: '購物清單' },
    { id: 2, label: '訂單資訊' },
    { id: 3, label: '訂單完成' }
  ];

  // 當前步驟 (1: 購物清單, 2: 訂單資訊, 3: 訂單完成)
  currentStep = signal(3);

  // 處理步驟變更
  onStepChange(step: number): void {
    this.currentStep.set(step);
  }
}
