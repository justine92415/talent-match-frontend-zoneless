import { Component, inject, Inject, signal, computed } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { MatIconModule } from '@angular/material/icon';
import { StarRating } from '@components/star-rating/star-rating';
import { ReviewCard, ReviewData } from '@components/review-card/review-card';
import { Skeleton } from '@components/skeleton/skeleton';
import { ReviewsService } from '@app/api/generated/reviews/reviews.service';
import { CourseReviewsSuccessResponseData } from '@app/api/generated/talentMatchAPI.schemas';

export interface AllReviewsDialogData {
  courseUuid: string;
  courseName: string;
}

@Component({
  selector: 'tmf-all-reviews-dialog',
  standalone: true,
  imports: [MatIconModule, StarRating, ReviewCard, Skeleton],
  templateUrl: './all-reviews-dialog.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AllReviewsDialogComponent {
  private reviewsService = inject(ReviewsService);

  reviewData = signal<CourseReviewsSuccessResponseData | null>(null);
  isLoading = signal(true);
  currentPage = signal(1);
  selectedRating = signal<number | undefined>(undefined);

  reviews = computed(() => this.reviewData()?.reviews || []);
  pagination = computed(() => this.reviewData()?.pagination);
  ratingStats = computed(() => this.reviewData()?.rating_stats);

  // 將 API 評論資料轉換為 ReviewCard 格式
  reviewCards = computed(() => {
    return this.reviews().map(review => ({
      id: review.id?.toString() || '',
      name: review.student?.name || '匿名使用者',
      date: review.created_at || '',
      title: '', // API 無提供標題
      content: review.comment || '',
      rating: review.rate || 0,
      avatar: review.student?.avatar_image || '',
    } as ReviewData));
  });

  // 方法：將 string 轉為 number
  toNumber(value: string | undefined): number {
    return value ? Number(value) : 0;
  }

  // 方法：取得評分分佈值
  getRatingCount(star: number): number {
    const stats = this.ratingStats();
    if (!stats?.rating_distribution) return 0;
    const key = star.toString() as '1' | '2' | '3' | '4' | '5';
    return stats.rating_distribution[key] || 0;
  }

  constructor(
    public dialogRef: DialogRef<void, AllReviewsDialogComponent>,
    @Inject(DIALOG_DATA) public data: AllReviewsDialogData
  ) {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading.set(true);
    const params: any = {
      page: this.currentPage(),
      limit: 10,
    };

    if (this.selectedRating() !== undefined) {
      params.rating = this.selectedRating();
    }

    this.reviewsService.getApiReviewsCoursesUuid(this.data.courseUuid, params).subscribe({
      next: (response: any) => {
        this.reviewData.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('載入評論失敗:', error);
        this.isLoading.set(false);
      },
    });
  }

  filterByRating(rating?: number): void {
    this.selectedRating.set(rating);
    this.currentPage.set(1);
    this.loadReviews();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadReviews();
  }

  close(): void {
    this.dialogRef.close();
  }
}
