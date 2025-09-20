import { Component, signal, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { EditableWeeklyCalendar } from '@components/editable-weekly-calendar/editable-weekly-calendar';
import { Button } from '@components/button/button';
import { TeachersService } from '@app/api/generated/teachers/teachers.service';
import { WeeklyScheduleRequest } from '@app/api/generated/talentMatchAPI.schemas';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface ScheduleData {
  week_day: number;
  available_times: string[];
}

@Component({
  selector: 'tmf-reservation',
  imports: [EditableWeeklyCalendar, Button, MatIcon],
  templateUrl: './reservation.html',
  styles: ``
})
export default class Reservation implements OnInit {
  private teachersService = inject(TeachersService);

  // 當前的排程資料
  scheduleData = signal<ScheduleData[]>([]);

  // 備份的原始排程資料（用於取消編輯時還原）
  originalScheduleData = signal<ScheduleData[]>([]);

  // 載入狀態
  isLoading = signal(false);
  loadError = signal<string | null>(null);

  // 編輯狀態
  isEditing = signal(false);

  // 儲存狀態
  isSaving = signal(false);
  saveSuccess = signal(false);

  async ngOnInit() {
    await this.loadScheduleData();
  }

  // 載入排程資料
  async loadScheduleData() {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const response = await firstValueFrom(this.teachersService.getApiTeachersSchedule());
      const scheduleData = this.transformApiResponseToScheduleData(response);
      this.scheduleData.set(scheduleData);
      // 同時更新備份資料
      this.originalScheduleData.set([...scheduleData]);
    } catch (error) {
      console.error('載入排程資料失敗:', error);

      let errorMessage = '載入排程資料失敗';
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            errorMessage = '登入已過期，請重新登入';
            break;
          case 403:
            errorMessage = '沒有權限查看排程';
            break;
          case 500:
            errorMessage = '伺服器錯誤，請稍後再試';
            break;
          default:
            errorMessage = `載入失敗：${error.message}`;
        }
      }

      this.loadError.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  // 進入編輯模式
  enterEditMode() {
    // 備份當前資料
    this.originalScheduleData.set([...this.scheduleData()]);
    this.isEditing.set(true);
    this.saveSuccess.set(false); // 重置儲存狀態
  }

  // 退出編輯模式
  exitEditMode() {
    this.isEditing.set(false);
    // 還原備份的資料，放棄未儲存的變更
    this.scheduleData.set([...this.originalScheduleData()]);
  }

  // 處理排程變更
  onScheduleChange(newSchedule: ScheduleData[]) {
    console.log('排程已變更:', newSchedule);
    this.scheduleData.set(newSchedule);
    this.saveSuccess.set(false); // 重置儲存狀態
  }

  // 轉換排程資料格式為API格式
  private transformScheduleToApiFormat(scheduleData: ScheduleData[]): WeeklyScheduleRequest {
    const weeklySchedule: { [key: string]: string[] } = {};

    scheduleData.forEach(schedule => {
      const dayKey = schedule.week_day.toString();
      weeklySchedule[dayKey] = schedule.available_times;
    });

    return {
      weekly_schedule: weeklySchedule
    };
  }

  // 轉換API回應為本地格式
  private transformApiResponseToScheduleData(apiResponse: any): ScheduleData[] {
    const scheduleData: ScheduleData[] = [];

    // 新的API回應格式有一個包裝結構，實際資料在 data.weekly_schedule 中
    const weeklySchedule = apiResponse?.data?.weekly_schedule || apiResponse?.weekly_schedule;

    if (weeklySchedule) {
      Object.entries(weeklySchedule).forEach(([dayKey, times]) => {
        const week_day = parseInt(dayKey);
        if (Array.isArray(times) && times.length > 0) {
          scheduleData.push({
            week_day,
            available_times: times as string[]
          });
        }
      });
    }

    return scheduleData;
  }

  // 儲存排程
  async saveSchedule() {
    this.isSaving.set(true);
    this.saveSuccess.set(false);

    try {
      // 轉換資料格式
      const requestData = this.transformScheduleToApiFormat(this.scheduleData());

      console.log('準備發送給後端的資料:', requestData);

      // 呼叫真實API
      await firstValueFrom(this.teachersService.putApiTeachersSchedule(requestData));

      // 儲存成功後更新備份資料
      this.originalScheduleData.set([...this.scheduleData()]);
      this.saveSuccess.set(true);
      this.isEditing.set(false); // 儲存成功後退出編輯模式
      setTimeout(() => this.saveSuccess.set(false), 3000); // 3秒後隱藏成功訊息

    } catch (error) {
      console.error('儲存失敗:', error);

      let errorMessage = '儲存失敗，請稍後再試';

      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 400:
            errorMessage = '排程資料格式錯誤，請檢查時間設定';
            break;
          case 401:
            errorMessage = '登入已過期，請重新登入';
            break;
          case 403:
            errorMessage = '沒有權限修改排程';
            break;
          case 500:
            errorMessage = '伺服器錯誤，請稍後再試';
            break;
          default:
            errorMessage = `儲存失敗：${error.message}`;
        }
      }

      alert(errorMessage);
    } finally {
      this.isSaving.set(false);
    }
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
