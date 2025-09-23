import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '@components/button/button';
import { DialogService } from '@share/services/dialog.service';
import { PurchaseRecordsService } from '@app/api/generated/purchase-records/purchase-records.service';
import { rxResource } from '@angular/core/rxjs-interop';


@Component({
  selector: 'tmf-courses',
  imports: [CommonModule, Button],
  templateUrl: './courses.html',
  styles: ``
})
export default class Courses {
  private dialogService = inject(DialogService);
  private purchaseRecordsService = inject(PurchaseRecordsService);

  // 使用 rxResource 載入購買記錄
  purchasesResource = rxResource({
    stream: () => this.purchaseRecordsService.getApiPurchases()
  });

  // 展開的預約記錄 (記錄哪個課程的預約正在顯示)
  expandedReservations: Set<number> = new Set();

  // 模擬預約記錄資料
  reservations: { [courseId: number]: any[] } = {
    26: [
      {
        id: 1,
        date: '2025-09-25',
        time: '10:00-11:00',
        status: 'confirmed',
        teacher_note: '請準備鼓棒'
      },
      {
        id: 2,
        date: '2025-09-27',
        time: '14:00-15:00',
        status: 'pending',
        teacher_note: ''
      }
    ],
    2: [
      {
        id: 3,
        date: '2025-09-26',
        time: '09:00-10:00',
        status: 'completed',
        teacher_note: '表現良好'
      }
    ]
  };

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

  onCancelReservation(reservationId: number) {
    console.log('取消預約:', reservationId);
  }

  // 檢查課程的預約是否展開
  isReservationExpanded(courseId: number): boolean {
    return this.expandedReservations.has(courseId);
  }

  // 取得課程的預約記錄
  getCourseReservations(courseId: number): any[] {
    return this.reservations[courseId] || [];
  }

  // 取得預約狀態文字
  getReservationStatusText(status: string): string {
    switch (status) {
      case 'pending': return '待確認';
      case 'confirmed': return '已確認';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  }

  // 取得預約狀態樣式
  getReservationStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-orange-95 text-orange-55';
      case 'confirmed': return 'bg-green-95 text-green-55';
      case 'completed': return 'bg-blue-95 text-blue-50';
      case 'cancelled': return 'bg-grey-f4 text-grey-66';
      default: return 'bg-grey-f4 text-grey-66';
    }
  }

}
