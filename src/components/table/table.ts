import { 
  ChangeDetectionStrategy, 
  Component
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tmf-table',
  imports: [CommonModule],
  templateUrl: './table.html',
  styles: `
    :host ::ng-deep [tbody] {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
      padding: 1rem 0;
      transition: background-color 0.2s ease-in-out;
    }
    
    :host ::ng-deep [tbody].selected {
      background-color: #fef7ed;
    }
    
    :host ::ng-deep [tbody]:not(.selected) {
      background-color: white;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Table {
  // 表格元件提供語義化結構，內容由父元件透過 ng-content 投影
}
