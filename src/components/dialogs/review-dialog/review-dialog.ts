import { Component, inject, signal, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { ReviewsService } from '@app/api/generated/reviews/reviews.service';

export interface ReviewDialogData {
  reservationUuid: string;
}

@Component({
  selector: 'tmf-review-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, Button],
  templateUrl: './review-dialog.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ReviewDialogComponent {
  private fb = inject(FormBuilder);
  private reviewsService = inject(ReviewsService);

  selectedRating = signal<number>(0);
  isSubmitting = signal<boolean>(false);

  reviewForm: FormGroup = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]],
  });

  constructor(
    public dialogRef: DialogRef<boolean, ReviewDialogComponent>,
    @Inject(DIALOG_DATA) public data: ReviewDialogData
  ) {}

  // 設定評分
  setRating(rating: number): void {
    this.selectedRating.set(rating);
  }

  // 提交評論
  submitReview(): void {
    if (!this.reviewForm.valid || this.selectedRating() === 0) {
      return;
    }

    this.isSubmitting.set(true);

    const reviewData = {
      reservation_uuid: this.data.reservationUuid,
      rate: this.selectedRating(),
      comment: this.reviewForm.get('comment')?.value,
    };

    this.reviewsService.postApiReviews(reviewData).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('提交評論失敗:', error);
        this.isSubmitting.set(false);
        alert('提交評論失敗，請稍後再試');
      },
    });
  }

  // 關閉 dialog
  close(): void {
    this.dialogRef.close(false);
  }
}
