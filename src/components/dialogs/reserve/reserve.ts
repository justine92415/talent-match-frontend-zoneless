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
import { DialogService } from '@share/services/dialog.service';
import { MatIcon } from '@angular/material/icon';
import { Button } from '@components/button/button';
import { finalize, of, switchMap, catchError } from 'rxjs';

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
  `
})
export class ReserveComponent {
  currentYear: WritableSignal<number> = signal(new Date().getFullYear());
  currentMonth: WritableSignal<number> = signal(new Date().getMonth());
  days: WritableSignal<Day[]> = signal([]);
  currentDate: WritableSignal<Day | null> = signal(null);
  currentTime: WritableSignal<string | null> = signal(null);
  morningTimes: WritableSignal<string[]> = signal([]);
  afternoonTimes: WritableSignal<string[]> = signal([]);
  eveningTimes: WritableSignal<string[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(false);
  inProgress: WritableSignal<boolean> = signal(false);

  private dialogService = inject(DialogService);

  constructor(
    public dialogRef: DialogRef<boolean, ReserveComponent>,
    @Inject(DIALOG_DATA)
    public data: {
      student_id: string;
      course_id: string;
      teacher_id: string;
      course_name: string;
    }
  ) {}

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
    this.isLoading.set(true);

    // 使用假資料替代 API 呼叫
    setTimeout(() => {
      const fakeTimeSlots = {
        morningTimes: ['09:00', '10:00', '11:00'],
        afternoonTimes: ['14:00', '15:00', '16:00'],
        eveningTimes: ['19:00', '20:00', '21:00']
      };

      this.morningTimes.set(fakeTimeSlots.morningTimes);
      this.afternoonTimes.set(fakeTimeSlots.afternoonTimes);
      this.eveningTimes.set(fakeTimeSlots.eveningTimes);
      this.isLoading.set(false);
    }, 1000);
  }

  selectTime(time: string): void {
    this.currentTime.set(time);
  }

  reset(): void {
    this.currentDate.set(null);
    this.currentTime.set(null);
  }

  bookNow(): void {
    this.inProgress.set(true);

    // 使用假資料替代 API 呼叫
    setTimeout(() => {
      this.dialogRef.close(true);
      const reserve_time = this.selectedReseveTime().split('T').join(' ');

      this.dialogService.openAlert({
        title: '預約完成',
        message: `預約成功，請於 ${reserve_time} 準時上課。`,
        type: 'success'
      }).subscribe();

      this.inProgress.set(false);
    }, 2000);
  }

  close() {
    this.dialogRef.close(false);
  }
}
