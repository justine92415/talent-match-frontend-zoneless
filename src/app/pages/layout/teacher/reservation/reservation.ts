import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@components/button/button';
import { InputSelect } from '@components/form/input-select/input-select';
import { InputText } from '@components/form/input-text/input-text';
import { Skeleton } from '@components/skeleton/skeleton';
import type { SelectOption } from '@components/form/input-select/input-select';
import { ReservationManagementService } from '@app/api/generated/reservation-management/reservation-management.service';
import { TeacherManagementService } from '@app/api/generated/teacher-management/teacher-management.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { DialogService } from '@share/services/dialog.service';

@Component({
  selector: 'tmf-reservation',
  imports: [
    CommonModule,
    Button,
    InputSelect,
    InputText,
    ReactiveFormsModule,
    Skeleton,
  ],
  templateUrl: './reservation.html',
  styles: ``,
})
export default class Reservation {
  private fb = new FormBuilder();
  private reservationService = inject(ReservationManagementService);
  private teacherService = inject(TeacherManagementService);
  private dialogService = inject(DialogService);

  // 分頁狀態
  currentPage = signal(1);
  perPage = 10;

  // 搜尋觸發信號
  searchTrigger = signal(0);

  // 篩選表單
  filterForm: FormGroup = this.fb.group({
    course: ['all'],
    timeRange: ['all'],
    status: ['all'],
    student: [''],
  });

  // 教師課程列表資源
  teacherCoursesResource = rxResource({
    stream: () =>
      this.teacherService
        .getApiTeachersMyCourses()
        .pipe(map((response) => response.data || [])),
  });

  // 課程選項 (動態生成)
  get courseOptions(): SelectOption[] {
    const courses = this.teacherCoursesResource.value() || [];
    return [
      { value: 'all', label: '全部課程' },
      ...courses.map((course: any) => ({
        value: course.value?.toString() || '',
        label: course.label || '',
      })),
    ];
  }

  // 時間範圍選項
  timeRangeOptions: SelectOption[] = [
    { value: 'all', label: '全部時間' },
    { value: 'today', label: '當日' },
    { value: 'week', label: '近一週' },
    { value: 'month', label: '近一個月' },
  ];

  // 預約狀態選項
  statusOptions: SelectOption[] = [
    { value: 'all', label: '全部狀態' },
    { value: 'pending', label: '待確認' },
    { value: 'reserved', label: '已預約' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  // 預約記錄資源
  reservationsResource = rxResource({
    params: () => ({
      courseId: this.filterForm.get('course')?.value || 'all',
      timeRange: this.filterForm.get('timeRange')?.value || 'all',
      status: this.filterForm.get('status')?.value || 'all',
      student: this.filterForm.get('student')?.value || '',
      page: this.currentPage(),
      trigger: this.searchTrigger(), // 添加觸發信號
    }),
    stream: ({ params }) => {
      const apiParams: any = {
        time_range: params.timeRange,
        status: params.status,
        page: params.page,
        per_page: this.perPage,
      };

      // 只有當不是 'all' 時才添加 course_id
      if (params.courseId !== 'all') {
        apiParams.course_id = parseInt(params.courseId);
      }

      // 只有當有搜尋內容時才添加 student_search
      if (params.student && params.student.trim() !== '') {
        apiParams.student_search = params.student.trim();
      }

      return this.reservationService.getApiReservationsCourseReservations(
        apiParams,
      );
    },
  });

  // 搜尋篩選
  onSearchFilter() {
    this.currentPage.set(1);
    this.searchTrigger.set(this.searchTrigger() + 1); // 觸發重新載入
  }

  // 重置篩選
  onResetFilter() {
    this.filterForm.reset({
      course: 'all',
      timeRange: 'all',
      status: 'all',
      student: '',
    });
    this.currentPage.set(1);
    this.searchTrigger.set(this.searchTrigger() + 1); // 觸發重新載入
  }

  // 分頁切換
  onPageChange(page: number) {
    const totalPages =
      this.reservationsResource.value()?.data?.pagination?.total_pages || 1;
    if (page >= 1 && page <= totalPages) {
      this.currentPage.set(page);
    }
  }

  // 確認預約
  onConfirmReservation(reservationId: number) {
    this.dialogService
      .openConfirm({
        title: '確認預約',
        message: '確定要確認這個預約嗎？',
        type: 'warning',
      })
      .subscribe((result) => {
        if (result.confirmed) {
          this.reservationService
            .postApiReservationsIdConfirm(reservationId)
            .subscribe({
              next: () => {
                this.reservationsResource.reload();
                this.dialogService
                  .openAlert({
                    title: '成功',
                    message: '預約已確認',
                    type: 'success',
                  })
                  .subscribe();
              },
              error: (error) => {
                console.error('確認預約失敗:', error);
                this.dialogService
                  .openAlert({
                    title: '錯誤',
                    message: '確認預約失敗，請稍後再試',
                    type: 'error',
                  })
                  .subscribe();
              },
            });
        }
      });
  }

  // 拒絕預約
  onRejectReservation(reservationId: number) {
    this.dialogService
      .openInput({
        title: '拒絕預約',
        message: '請輸入拒絕原因，這將會通知學生',
        placeholder: '請輸入拒絕原因...',
        required: true,
        type: 'warning',
        confirmText: '確認拒絕',
      })
      .subscribe((result) => {
        if (result.confirmed) {
          this.reservationService
            .postApiReservationsIdReject(reservationId, {
              reason: result.data || '教師拒絕預約',
            })
            .subscribe({
              next: () => {
                this.reservationsResource.reload();
                this.dialogService
                  .openAlert({
                    title: '成功',
                    message: '預約已拒絕，學生將收到通知',
                    type: 'success',
                  })
                  .subscribe();
              },
              error: (error) => {
                console.error('拒絕預約失敗:', error);
                this.dialogService
                  .openAlert({
                    title: '錯誤',
                    message: '拒絕預約失敗，請稍後再試',
                    type: 'error',
                  })
                  .subscribe();
              },
            });
        }
      });
  }

  // 取消預約
  onCancelReservation(reservationId: number) {
    this.dialogService
      .openInput({
        title: '取消預約',
        message: '請輸入取消原因，這將會通知學生並退還課程堂數',
        inputLabel: '取消原因',
        placeholder: '請輸入取消原因...',
        required: true,
        type: 'warning',
        confirmText: '確認取消',
        validator: (value: string) => {
          if (value.trim().length < 5) {
            return '取消原因至少需要5個字元';
          }
          return null;
        },
      })
      .subscribe((result) => {
        if (result.confirmed) {
          this.reservationService
            .deleteApiReservationsId(reservationId)
            .subscribe({
              next: () => {
                this.reservationsResource.reload();
                this.dialogService
                  .openAlert({
                    title: '成功',
                    message: '預約已取消，學生將收到通知並退還課程堂數',
                    type: 'success',
                  })
                  .subscribe();
              },
              error: (error) => {
                console.error('取消預約失敗:', error);

                // 處理特定錯誤碼
                if (error?.error?.code === 'RESERVATION_CANCEL_TIME_LIMIT') {
                  this.dialogService
                    .openAlert({
                      title: '無法取消預約',
                      message: '預約時間太近，無法取消。請於預約24小時前取消。',
                      type: 'error',
                    })
                    .subscribe();
                } else {
                  this.dialogService
                    .openAlert({
                      title: '錯誤',
                      message: '取消預約失敗，請稍後再試',
                      type: 'error',
                    })
                    .subscribe();
                }
              },
            });
        }
      });
  }

  // 獲取狀態顯示文字
  getStatusText(
    teacherStatus: string | undefined,
    studentStatus: string | undefined,
  ): string {
    if (teacherStatus === 'pending' && studentStatus === 'reserved') {
      return '待確認';
    }
    if (teacherStatus === 'reserved' && studentStatus === 'reserved') {
      return '已確認';
    }
    if (teacherStatus === 'completed' && studentStatus === 'completed') {
      return '已完成';
    }
    if (teacherStatus === 'cancelled' || studentStatus === 'cancelled') {
      return '已取消';
    }
    return '未知';
  }

  // 獲取狀態樣式
  getStatusClass(
    teacherStatus: string | undefined,
    studentStatus: string | undefined,
  ): string {
    if (teacherStatus === 'pending' && studentStatus === 'reserved') {
      return 'bg-orange-95 text-orange-55';
    }
    if (teacherStatus === 'reserved' && studentStatus === 'reserved') {
      return 'bg-green-95 text-green-55';
    }
    if (teacherStatus === 'completed' && studentStatus === 'completed') {
      return 'bg-blue-95 text-blue-50';
    }
    if (teacherStatus === 'cancelled' || studentStatus === 'cancelled') {
      return 'bg-grey-f4 text-grey-66';
    }
    return 'bg-grey-f4 text-grey-66';
  }
}
