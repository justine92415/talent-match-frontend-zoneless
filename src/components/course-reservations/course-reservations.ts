import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '@components/button/button';
import { ReservationStatusPipe } from './reservation-status.pipe';
import { ReservationManagementService } from '@app/api/generated/reservation-management/reservation-management.service';
import { rxResource } from '@angular/core/rxjs-interop';
import type { GetApiReservationsRole } from '@app/api/generated/talentMatchAPI.schemas';
import { Observable, merge, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'tmf-course-reservations',
  imports: [CommonModule, Button, ReservationStatusPipe],
  templateUrl: './course-reservations.html',
  styles: ``
})
export class CourseReservationsComponent {
  courseId = input.required<number>();
  reservationUpdated$ = input<Observable<number>>();

  private reservationService = inject(ReservationManagementService);

  // 使用 rxResource 載入預約記錄
  reservationsResource = rxResource({
    params: () => ({
      courseId: this.courseId(),
      updateTrigger: this.reservationUpdated$()
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
        switchMap(() => this.reservationService.getApiReservations({
          role: 'student' as GetApiReservationsRole,
          course_id: params.courseId
        } as any))
      );
    }
  });


  onCancelReservation(reservationId: number) {
    console.log('取消預約:', reservationId);
  }
}