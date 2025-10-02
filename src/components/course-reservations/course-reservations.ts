import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { ReservationStatusPipe } from './reservation-status.pipe';
import { ReservationManagementService } from '@app/api/generated/reservation-management/reservation-management.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, merge, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { DialogService } from '@share/services/dialog.service';
import { ReviewDialogComponent } from '@components/dialogs/review-dialog/review-dialog';

@Component({
  selector: 'tmf-course-reservations',
  imports: [CommonModule, Button, MatIconModule, ReservationStatusPipe],
  templateUrl: './course-reservations.html',
  styles: ``
})
export class CourseReservationsComponent {
  courseId = input.required<number>();
  reservationUpdated$ = input<Observable<number>>();

  // 預約取消事件
  reservationCancelled = output<number>();

  // 分頁狀態
  currentPage = signal(1);
  perPage = 10;

  private reservationService = inject(ReservationManagementService);
  private dialogService = inject(DialogService);
  private dialog = inject(Dialog);

  // 使用 rxResource 載入預約記錄
  reservationsResource = rxResource({
    params: () => ({
      courseId: this.courseId(),
      updateTrigger: this.reservationUpdated$(),
      page: this.currentPage()
    }),
    stream: ({ params }) => {
      // 初始載入和更新事件的合併流
      const initialLoad$ = of(null);
      const updateStream$ = params.updateTrigger
        ? params.updateTrigger.pipe(
            filter(updatedCourseId => updatedCourseId === params.courseId)
          )
        : of();

      return merge(initialLoad$, updateStream$).pipe(
        switchMap(() => this.reservationService.getApiReservationsMyReservations({
          course_id: params.courseId,
          page: params.page,
          per_page: this.perPage
        } as any))
      );
    }
  });


  onCancelReservation(reservationId: number) {
    this.dialogService.openConfirm({
      title: '取消預約',
      message: '確定要取消這個預約嗎？',
      type: 'warning'
    }).subscribe(result => {
      if (result.confirmed) {
        this.reservationService.deleteApiReservationsId(reservationId).subscribe({
          next: () => {
            // 取消成功，重新載入預約記錄
            this.reservationsResource.reload();
            // 通知父元件更新堂數
            this.reservationCancelled.emit(this.courseId());
          },
          error: (error) => {
            console.error('取消預約失敗:', error);

            // 處理特定錯誤碼
            if (error?.error?.code === 'RESERVATION_CANCEL_TIME_LIMIT') {
              this.dialogService.openAlert({
                title: '無法取消預約',
                message: '預約時間太近，無法取消。請於預約24小時前取消。',
                type: 'error'
              }).subscribe();
            } else {
              this.dialogService.openAlert({
                title: '錯誤',
                message: '取消預約失敗，請稍後再試',
                type: 'error'
              }).subscribe();
            }
          }
        });
      }
    });
  }

  // 開啟評論 dialog
  openReviewDialog(reservation: any) {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      data: {
        reservationUuid: reservation.uuid,
        studentStatus: reservation.student_status
      },
      width: '800px'
    });

    dialogRef.closed.subscribe((success) => {
      if (success) {
        // 提交成功，重新載入列表
        this.reservationsResource.reload();

        // 根據狀態顯示不同訊息
        const message = reservation.student_status === 'overdue'
          ? '感謝您的評價！課程已自動標記為完成。'
          : '感謝您的評價！';

        this.dialogService.openAlert({
          title: '成功',
          message: message,
          type: 'success'
        }).subscribe();
      }
    });
  }

  // 分頁切換
  onPageChange(page: number) {
    if (page >= 1 && page <= (this.reservationsResource.value()?.data?.pagination?.total_pages || 1)) {
      this.currentPage.set(page);
    }
  }
}