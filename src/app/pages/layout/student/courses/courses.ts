import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '@components/button/button';
import { DialogService } from '@share/services/dialog.service';

// 購買記錄介面定義
interface PurchaseRecord {
  id: number;
  uuid: string;
  user_id: number;
  course_id: number;
  order_id: number;
  quantity_total: number;
  quantity_used: number;
  quantity_remaining: number;
  created_at: string;
  course: {
    id: number;
    uuid: string;
    name: string;
    main_image: string;
    teacher: {
      id: number;
      user: {
        name: string;
        nick_name: string;
      };
    };
  };
  order: {
    id: number;
    uuid: string;
    total_amount: string;
    paid_at: string;
  };
}

@Component({
  selector: 'tmf-courses',
  imports: [CommonModule, Button],
  templateUrl: './courses.html',
  styles: ``
})
export default class Courses {
  private dialogService = inject(DialogService);

  // 模擬購買記錄資料
  purchases: PurchaseRecord[] = [
    {
      id: 5,
      uuid: "78417b77-88ac-4795-af70-1bbe306a1c66",
      user_id: 6,
      course_id: 26,
      order_id: 17,
      quantity_total: 11,
      quantity_used: 0,
      quantity_remaining: 11,
      created_at: "2025-09-22T10:03:11.563Z",
      course: {
        id: 26,
        uuid: "b18b0803-d8a1-409e-99da-83af6e5063b8",
        name: "搖滾鼓技進階",
        main_image: "",
        teacher: {
          id: 8,
          user: {
            name: "王建民",
            nick_name: "鼓神老師"
          }
        }
      },
      order: {
        id: 17,
        uuid: "b054492b-d728-48f4-acc6-3c77e36162a0",
        total_amount: "22000.00",
        paid_at: "2025-09-22T10:03:11.563Z"
      }
    },
    {
      id: 4,
      uuid: "95aade23-ddf7-451e-b3f9-f3fc0d43b5d6",
      user_id: 6,
      course_id: 2,
      order_id: 15,
      quantity_total: 16,
      quantity_used: 0,
      quantity_remaining: 16,
      created_at: "2025-09-22T09:59:27.949Z",
      course: {
        id: 2,
        uuid: "2728eb42-48d8-4356-9091-39e971ebce0c",
        name: "測試課程2",
        main_image: "https://firebasestorage.googleapis.com/v0/b/talent-match-2.firebasestorage.app/o/course_images%2Fteacher_4%2F83a3ac18-5be7-46bc-820f-8b3ca67e16dd.jpeg?alt=media",
        teacher: {
          id: 5,
          user: {
            name: "",
            nick_name: "小明劍魔"
          }
        }
      },
      order: {
        id: 15,
        uuid: "1aca7efb-0ca5-4939-99c5-9a2b971cf0ff",
        total_amount: "1200.00",
        paid_at: "2025-09-22T09:59:27.942Z"
      }
    }
  ];

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

  // 方法實作 (僅切版，不實作邏輯)
  onBookCourse(courseId: number) {
    console.log('預約課程:', courseId);
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

  // Dialog 測試方法
  testConfirmDialog() {
    this.dialogService.openConfirm({
      title: '確認測試',
      message: '這是一個確認對話框的測試，請選擇您的操作。',
      type: 'warning',
      confirmText: '確定',
      cancelText: '取消'
    }).subscribe(result => {
      if (result.confirmed) {
        this.testAlertDialog('success', '您點擊了確認按鈕！');
      } else {
        this.testAlertDialog('info', '您點擊了取消按鈕！');
      }
    });
  }

  testAlertDialog(type: 'info' | 'warning' | 'error' | 'success' = 'info', customMessage?: string) {
    const messages = {
      info: customMessage || '這是一個資訊提示對話框。',
      warning: customMessage || '這是一個警告提示對話框。',
      error: customMessage || '這是一個錯誤提示對話框。',
      success: customMessage || '這是一個成功提示對話框。'
    };

    this.dialogService.openAlert({
      title: `${type.toUpperCase()} 測試`,
      message: messages[type],
      type: type,
      confirmText: '我知道了'
    }).subscribe(() => {
      console.log('Alert dialog closed');
    });
  }

  testReserveDialog() {
    this.dialogService.openReserve({
      student_id: '6',
      course_id: '26',
      teacher_id: '8',
      course_name: '搖滾鼓技進階'
    }).subscribe(result => {
      if (result.confirmed) {
        this.testAlertDialog('success', '預約已成功提交！');
      } else {
        console.log('預約對話框已取消');
      }
    });
  }
}
