import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  Component,
  inject,
  WritableSignal,
  computed,
  signal,
  Inject
} from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { DialogService, ReserveDialogResult } from '@share/services/dialog.service';
import { MatIcon } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { finalize, of, switchMap, catchError } from 'rxjs';
import { CoursesService } from '@app/api/generated/courses/courses.service';
import { ReservationManagementService } from '@app/api/generated/reservation-management/reservation-management.service';
import { rxResource } from '@angular/core/rxjs-interop';
import type { AvailableSlotInfo, CreateReservationRequest } from '@app/api/generated/talentMatchAPI.schemas';

interface Day {
  year: number;
  month: number;
  date: number;
  currentMonth: boolean;
  disabled: boolean;
}

@Component({
  selector: 'tmf-reserve',
  imports: [NgClass, CommonModule, MatIcon, Button],
  templateUrl: './reserve.html',
  styles: `
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    .spin {
      animation: spin 1s linear infinite;
      border-top-color: transparent;
    }
    .afterimage {
      animation: spin 1s linear infinite;
      opacity: 0.5;
      border-top-color: transparent;
    }
    .time-slot {
      border-radius: 0.375rem;
      padding: 0.25rem;
      transition: all 0.2s ease;
      text-align: center;
    }
    .time-slot.available {
      color: #00b300;
      cursor: pointer;
    }
    .time-slot.available:hover {
      background-color: #f36923;
      color: white;
    }
    .time-slot.unavailable {
      color: #666666;
      cursor: not-allowed;
    }
    .time-slot.selected {
      background-color: #f36923;
      color: white;
    }
  `
})
export class ReserveComponent {
  currentYear: WritableSignal<number> = signal(new Date().getFullYear());
  currentMonth: WritableSignal<number> = signal(new Date().getMonth());
  days: WritableSignal<Day[]> = signal([]);
  currentDate: WritableSignal<Day | null> = signal(null);
  currentTime: WritableSignal<string | null> = signal(null);
  inProgress: WritableSignal<boolean> = signal(false);

  // 使用 rxResource 載入可用時段
  timeSlotsResource = rxResource({
    params: () => ({
      date: this.currentDate() ? this.getFormattedDate(this.currentDate()!) : null
    }),
    stream: ({ params }) => {
      if (!params.date) {
        return of({
          status: 'success' as const,
          message: '',
          data: {
            date: '',
            available_slots: []
          }
        });
      }
      return this.coursesService.getApiCoursesIdAvailableSlots(
        parseInt(this.data.course_id),
        { date: params.date }
      );
    }
  });

  private dialogService = inject(DialogService);
  private coursesService = inject(CoursesService);
  private reservationService = inject(ReservationManagementService);

  constructor(
    public dialogRef: DialogRef<ReserveDialogResult, ReserveComponent>,
    @Inject(DIALOG_DATA)
    public data: {
      student_id: string;
      course_id: string;
      teacher_id: string;
      course_name: string;
    }
  ) {}

  // 格式化日期為 YYYY-MM-DD
  getFormattedDate(day: Day): string {
    return `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
  }

  // 分類時段為早上、下午、晚上
  morningTimes = computed(() => {
    const slots: AvailableSlotInfo[] = this.timeSlotsResource.value()?.data?.available_slots || [];
    return slots
      .filter((slot: AvailableSlotInfo) => {
        const hour = parseInt(slot.start_time?.split(':')[0] || '0');
        return hour >= 6 && hour < 12;
      });
  });

  afternoonTimes = computed(() => {
    const slots: AvailableSlotInfo[] = this.timeSlotsResource.value()?.data?.available_slots || [];
    return slots
      .filter((slot: AvailableSlotInfo) => {
        const hour = parseInt(slot.start_time?.split(':')[0] || '0');
        return hour >= 12 && hour < 18;
      });
  });

  eveningTimes = computed(() => {
    const slots: AvailableSlotInfo[] = this.timeSlotsResource.value()?.data?.available_slots || [];
    return slots
      .filter((slot: AvailableSlotInfo) => {
        const hour = parseInt(slot.start_time?.split(':')[0] || '0');
        return hour >= 18;
      });
  });

  selectedReseveTime = computed(() => {
    if (this.currentDate()) {
      const zeroPad = (num: number) => String(num).padStart(2, '0');
      return `${this.currentDate()!.year}-${zeroPad(this.currentDate()!.month + 1)}-${zeroPad(this.currentDate()!.date)}T${this.currentTime()}`;
    } else {
      return '';
    }
  });

  btnDisabled = computed(() => {
    return !this.currentDate() || !this.currentTime();
  });

  ngOnInit(): void {
    this.generateDays(this.currentYear(), this.currentMonth());
  }

  generateDays(year: number, month: number): void {
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const lastDatePrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // 上個月日期
    for (let i = firstDay - 1; i >= 0; i--) {
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear--;
      }
      const date = new Date(prevYear, prevMonth, lastDatePrevMonth - i);
      days.push({
        year: prevYear,
        month: prevMonth,
        date: lastDatePrevMonth - i,
        currentMonth: false,
        disabled: date < today
      });
    }

    // 本月日期
    for (let i = 1; i <= lastDate; i++) {
      const date = new Date(year, month, i);
      days.push({
        year: year,
        month: month,
        date: i,
        currentMonth: true,
        disabled: date < today
      });
    }

    // 下個月日期
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      let nextMonth = month + 1;
      let nextYear = year;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      const date = new Date(nextYear, nextMonth, i);
      days.push({
        year: nextYear,
        month: nextMonth,
        date: i,
        currentMonth: false,
        disabled: date < today
      });
    }

    this.days.set(days);
  }

  previousMonth(): void {
    if (this.currentMonth() > 0) {
      this.currentMonth.set(this.currentMonth() - 1);
    } else {
      this.currentMonth.set(11);
      this.currentYear.set(this.currentYear() - 1);
    }
    this.generateDays(this.currentYear(), this.currentMonth());
  }

  nextMonth(): void {
    if (this.currentMonth() < 11) {
      this.currentMonth.set(this.currentMonth() + 1);
    } else {
      this.currentMonth.set(0);
      this.currentYear.set(this.currentYear() + 1);
    }
    this.generateDays(this.currentYear(), this.currentMonth());
  }

  selectDate(day: Day): void {
    if (day.disabled) return;
    this.currentDate.set(day);
    this.currentTime.set(null);
    if (!day.currentMonth) {
      if (day.date < 15) {
        // 下個月的日期
        this.nextMonth();
      } else {
        // 上個月的日期
        this.previousMonth();
      }
    }
  }

  selectTime(slot: AvailableSlotInfo): void {
    // 只允許點擊 available 狀態的時段
    if (slot.status !== 'available') return;
    this.currentTime.set(slot.start_time || null);
  }

  reset(): void {
    this.currentDate.set(null);
    this.currentTime.set(null);
  }

  bookNow(): void {
    const currentDate = this.currentDate();
    const currentTime = this.currentTime();

    if (!currentDate || !currentTime) {
      return;
    }

    this.inProgress.set(true);

    const reservationRequest: CreateReservationRequest = {
      course_id: parseInt(this.data.course_id),
      teacher_id: parseInt(this.data.teacher_id),
      reserve_date: this.getFormattedDate(currentDate),
      reserve_time: currentTime
    };

    this.reservationService.postApiReservations(reservationRequest)
      .pipe(
        finalize(() => this.inProgress.set(false))
      )
      .subscribe({
        next: (response) => {
          // 關閉對話框並傳回剩餘堂數資訊
          this.dialogRef.close({
            success: true,
            remainingLessons: response.data?.remaining_lessons
          });

          const reserve_datetime = `${this.getFormattedDate(currentDate)} ${currentTime}`;
          this.dialogService.openAlert({
            title: '預約提交成功',
            message: `預約已提交 (${reserve_datetime})，請等待教師確認。`,
            type: 'success'
          }).subscribe();
        },
        error: (error) => {
          console.error('Reservation failed:', error);
          this.dialogService.openAlert({
            title: '預約失敗',
            message: error.error?.message || '發生錯誤，請稍後再試。',
            type: 'error'
          }).subscribe();
        }
      });
  }

  close() {
    this.dialogRef.close({
      success: false
    });
  }
}
