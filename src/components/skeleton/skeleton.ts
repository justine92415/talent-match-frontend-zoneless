import { Component, input } from '@angular/core';

@Component({
  selector: 'tmf-skeleton',
  template: `
    <div 
      [class]="'animate-shimmer ' + class()"
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `,
  styles: `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .animate-shimmer {
      animation: shimmer 2s ease-in-out infinite;
      background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
      background-size: 200% 100%;
    }

    /* 優化視覺效果 */
    :host {
      display: block;
    }
  `
})
export class Skeleton {
  width = input<string>();
  height = input<string>();
  class = input<string>('rounded-md w-full h-4');
}