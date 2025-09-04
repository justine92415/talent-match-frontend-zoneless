import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'tmf-star-rating',
  imports: [MatIconModule],
  templateUrl: './star-rating.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRating {
  rating = input<number>(0); // 接收評分，範圍從 0 到 5
  
  // 確保評分在 0-5 範圍內的計算屬性
  validatedRating = computed(() => {
    const currentRating = this.rating();
    return Math.min(Math.max(currentRating, 0), 5);
  });
  
  fullStars = computed<number[]>(() => {
    const fullStarCount = Math.floor(this.validatedRating());
    return Array(fullStarCount).fill(0);
  });

  halfStars = computed<number>(() => {
    const decimalPart = this.validatedRating() - Math.floor(this.validatedRating());
    return decimalPart >= 0.5 ? 1 : 0;
  });

  emptyStars = computed<number[]>(() => {
    const totalStars = 5;
    const filledStars = this.fullStars().length + this.halfStars();
    return Array(totalStars - filledStars).fill(0);
  });
  
}
