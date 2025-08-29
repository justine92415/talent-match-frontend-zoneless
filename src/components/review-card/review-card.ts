import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';

export interface ReviewData {
  id: string;
  name: string;
  date: string;
  title: string;
  content: string;
  rating: number;
  avatar?: string;
}

@Component({
  selector: 'tmf-review-card',
  imports: [MatIcon],
  templateUrl: './review-card.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewCard {
  @Input() review!: ReviewData;

  get TmfIcon() {
    return TmfIconEnum;
  }

  get fullStars(): number[] {
    return Array.from({ length: Math.floor(this.review.rating) }, (_, i) => i + 1);
  }

  get hasHalfStar(): boolean {
    return this.review.rating % 1 !== 0;
  }

  get emptyStars(): number[] {
    const emptyCount = 5 - Math.ceil(this.review.rating);
    return Array.from({ length: emptyCount }, (_, i) => i + 1);
  }
}
