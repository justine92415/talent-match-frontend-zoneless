import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '@components/button/button';
import { ReservationStatusPipe } from './reservation-status.pipe';
import { ReservationManagementService } from '@app/api/generated/reservation-management/reservation-management.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, merge, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { DialogService } from '@share/services/dialog.service';

@Component({
  selector: 'tmf-course-reservations',
  imports: [CommonModule, Button, ReservationStatusPipe],
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

  // 完成課程
  onCompleteReservation(reservationId: number) {
    this.dialogService.openConfirm({
      title: '完成課程',
      message: '確認此課程已完成？',
      type: 'info'
    }).subscribe(result => {
      if (result.confirmed) {
        this.reservationService.putApiReservationsIdStatus(reservationId, {
          status_type: 'student-complete'
        }).subscribe({
          next: () => {
            // 完成成功，重新載入預約記錄
            this.reservationsResource.reload();
            this.dialogService.openAlert({
              title: '成功',
              message: '課程已標記為完成',
              type: 'success'
            }).subscribe();
          },
          error: (error) => {
            console.error('完成課程失敗:', error);
            this.dialogService.openAlert({
              title: '錯誤',
              message: '完成課程失敗，請稍後再試',
              type: 'error'
            }).subscribe();
          }
        });
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