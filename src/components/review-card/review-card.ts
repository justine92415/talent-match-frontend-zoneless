import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
} from '@angular/core';
import { StarRating } from '@components/star-rating/star-rating';

export interface ReviewData {
  id: string;
  name: string;
  date: string;
  title: string;
  content: string;
  rating: number;
  avatar?: string;
}

type ReviewCardType = 'bordered' | 'shadowed';

@Component({
  selector: 'tmf-review-card',
  imports: [StarRating, NgClass],
  templateUrl: './review-card.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCard {
  review = input.required<ReviewData>();
  type = input<ReviewCardType>('bordered');
}
