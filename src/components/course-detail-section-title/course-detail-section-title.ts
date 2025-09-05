import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tmf-course-detail-section-title',
  imports: [],
  templateUrl: './course-detail-section-title.html',
  styles: `
    :host { display: block; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseDetailSectionTitle {}
