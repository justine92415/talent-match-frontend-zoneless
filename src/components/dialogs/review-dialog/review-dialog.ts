import { Component, inject, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { ReviewsService } from '@app/api/generated/reviews/reviews.service';
import { InputRating } from '@components/form/input-rating/input-rating';
import { InputTextarea } from '@components/form/input-textarea/input-textarea';

export interface ReviewDialogData {
  reservationUuid: string;
}

@Component({
  selector: 'tmf-review-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, Button, InputRating, InputTextarea],
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

  reviewForm: FormGroup = this.fb.group({
    rate: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]],
  });

  constructor(
    public dialogRef: DialogRef<boolean, ReviewDialogComponent>,
    @Inject(DIALOG_DATA) public data: ReviewDialogData
  ) {}

  // 提交評論
  submitReview(): void {
    if (!this.reviewForm.valid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const reviewData = {
      reservation_uuid: this.data.reservationUuid,
      rate: this.reviewForm.get('rate')?.value,
      comment: this.reviewForm.get('comment')?.value,
    };

    this.reviewsService.postApiReviews(reviewData).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('提交評論失敗:', error);
        alert('提交評論失敗，請稍後再試');
      },
    });
  }

  // 關閉 dialog
  close(): void {
    this.dialogRef.close(false);
  }
}
