import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { EditableWeeklyCalendar } from '@components/editable-weekly-calendar/editable-weekly-calendar';
import { Button } from '@components/button/button';

interface ScheduleData {
  week_day: number;
  available_times: string[];
}

@Component({
  selector: 'tmf-reservation',
  imports: [EditableWeeklyCalendar, Button, MatIcon, JsonPipe],
  templateUrl: './reservation.html',
  styles: ``
})
export default class Reservation {
  // 當前的排程資料
  scheduleData = signal<ScheduleData[]>([
    {
      week_day: 1, // 週一
      available_times: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
    },
    {
      week_day: 2, // 週二
      available_times: ['10:00', '11:00', '13:00', '14:00']
    },
    {
      week_day: 4, // 週四
      available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00']
    },
    {
      week_day: 5, // 週五
      available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '17:00', '19:00']
    },
    {
      week_day: 6, // 週六
      available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00']
    }
    // 週三和週日沒有資料，表示不工作
  ]);

  // 儲存狀態
  isSaving = signal(false);
  saveSuccess = signal(false);

  // 處理排程變更
  onScheduleChange(newSchedule: ScheduleData[]) {
    console.log('排程已變更:', newSchedule);
    this.scheduleData.set(newSchedule);
    this.saveSuccess.set(false); // 重置儲存狀態
  }

  // 儲存排程
  async saveSchedule() {
    this.isSaving.set(true);
    this.saveSuccess.set(false);

    try {
      // 準備API請求資料
      const requestData = {
        operation: "replace",
        schedule_data: this.scheduleData()
      };

      console.log('準備發送給後端的資料:', requestData);

      // 模擬API呼叫
      await this.mockApiCall(requestData);

      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000); // 3秒後隱藏成功訊息

    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      this.isSaving.set(false);
    }
  }

  // 模擬API呼叫
  private mockApiCall(data: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('模擬API回應: 排程儲存成功');
        resolve();
      }, 1500);
    });
  }

  // 重置為預設排程
  resetToDefault() {
    if (confirm('確定要重置為預設排程嗎？')) {
      this.scheduleData.set([
        {
          week_day: 1,
          available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        },
        {
          week_day: 2,
          available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        },
        {
          week_day: 3,
          available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        },
        {
          week_day: 4,
          available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        },
        {
          week_day: 5,
          available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        },
        {
          week_day: 6,
          available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        },
        {
          week_day: 7,
          available_times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        }
      ]);
    }
  }

  // 清空所有排程
  clearAllSchedule() {
    if (confirm('確定要清空所有排程嗎？')) {
      this.scheduleData.set([]);
    }
  }
}
