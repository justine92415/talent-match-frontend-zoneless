import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, output, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { StarRating } from "@components/star-rating/star-rating";

export interface CourseCardData {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  level: string;
  category: string;
  price: number;
  teacher: {
    name: string;
    avatar: string;
  };
  rating: {
    score: number;
    count: number;
  };
}

@Component({
  selector: 'tmf-course-card',
  imports: [MatIcon, StarRating],
  templateUrl: './course-card.html',
  styles: `
    :host {
      display: block;
    }

    /* 優化圖片容器的渲染性能 */
    .swiper-slide :host {
      will-change: transform;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseCard {
  course = input.required<CourseCardData>();
  hasShadow = input(true);
  courseClick = output<string>();

  // Math object for template use
  Math = Math;

  get TmfIcon() {
    return TmfIconEnum;
  }

  onCourseClick(): void {
    this.courseClick.emit(this.course().id);
  }
}
