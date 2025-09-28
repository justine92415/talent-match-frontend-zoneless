import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '@components/button/button';
import { DialogService } from '@share/services/dialog.service';
import { PurchaseRecordsService } from '@app/api/generated/purchase-records/purchase-records.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CourseReservationsComponent } from '@components/course-reservations/course-reservations';
import { Subject } from 'rxjs';


@Component({
  selector: 'tmf-courses',
  imports: [CommonModule, Button, CourseReservationsComponent],
  templateUrl: './courses.html',
  styles: ``
})
export default class Courses {
  private dialogService = inject(DialogService);
  private purchaseRecordsService = inject(PurchaseRecordsService);

  // 課程預約更新事件流
  private courseReservationUpdated$ = new Subject<number>();
  reservationUpdated$ = this.courseReservationUpdated$.asObservable();

  // 使用 rxResource 載入購買記錄
  purchasesResource = rxResource({
    stream: () => this.purchaseRecordsService.getApiPurchases()
  });

  // 展開的預約記錄 (記錄哪個課程的預約正在顯示)
  expandedReservations: Set<number> = new Set();

  // 預約課程方法
  onBookCourse(courseId: number) {
    const purchases = this.purchasesResource.value()?.data?.purchases || [];

    // 找到課程資訊
    const purchase = purchases.find(p => p.course?.id === courseId);
    if (!purchase || !purchase.course || !purchase.course.teacher) {
      this.dialogService.openAlert({
        title: '錯誤',
        message: '找不到課程資訊',
        type: 'error'
      }).subscribe();
      return;
    }

    // 開啟預約對話框
    this.dialogService.openReserve({
      student_id: purchase.user_id?.toString() || '',
      course_id: courseId.toString(),
      teacher_id: purchase.course.teacher.id?.toString() || '',
      course_name: purchase.course.name || ''
    }).subscribe(result => {
      if (result.confirmed && result.data?.success && result.data?.remainingLessons) {
        // 更新本地購課記錄的堂數狀態
        this.updateLocalPurchaseRecord(courseId, result.data.remainingLessons);
        // 通知該課程的預約記錄需要更新
        this.courseReservationUpdated$.next(courseId);
      }
    });
  }

  // 更新本地購課記錄狀態
  private updateLocalPurchaseRecord(courseId: number, remainingLessons: any) {
    const currentData = this.purchasesResource.value();
    if (!currentData?.data?.purchases) return;

    const updatedPurchases = currentData.data.purchases.map(purchase => {
      if (purchase.course?.id === courseId) {
        return {
          ...purchase,
          quantity_total: remainingLessons.total || purchase.quantity_total,
          quantity_used: remainingLessons.used || purchase.quantity_used,
          quantity_remaining: remainingLessons.remaining ?? purchase.quantity_remaining
        };
      }
      return purchase;
    });

    // 更新 resource 的值
    this.purchasesResource.update(() => ({
      ...currentData,
      data: {
        ...currentData.data,
        purchases: updatedPurchases
      }
    }));
  }

  onViewReservations(courseId: number) {
    if (this.expandedReservations.has(courseId)) {
      this.expandedReservations.delete(courseId);
    } else {
      this.expandedReservations.add(courseId);
    }
  }

  // 檢查課程的預約是否展開
  isReservationExpanded(courseId: number): boolean {
    return this.expandedReservations.has(courseId);
  }

  // 處理預約取消事件
  onReservationCancelled(courseId: number) {
    // 重新載入購課記錄以更新剩餘堂數
    this.purchasesResource.reload();
  }

}
