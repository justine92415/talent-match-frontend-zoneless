import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
  HostListener,
} from '@angular/core';

type SlotStatus = 'available' | 'unavailable';

interface TimeSlot {
  time: string;
  status: SlotStatus;
  selected?: boolean;
  cssClass?: string;
}

interface DaySchedule {
  week: string;
  week_day: number; // 1-7 (Monday-Sunday)
  slots: TimeSlot[];
}

interface ScheduleData {
  week_day: number;
  available_times: string[];
}

@Component({
  selector: 'tmf-editable-weekly-calendar',
  imports: [],
  templateUrl: './editable-weekly-calendar.html',
  styles: `
    .calendar-container {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
    .slot-available {
      background-color: #f6fee7;
      border-color: #9f9f9f;
      color: #333333;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
    .slot-available:hover {
      background-color: #feefe7;
      border-color: #f36923;
    }
    .slot-unavailable {
      background-color: #f7f7f7;
      border-color: #d4d4d4;
      color: #666666;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
    .slot-unavailable:hover {
      background-color: #e9e9e9;
    }
    .slot-selected {
      box-shadow: 0 0 0 2px #8d0099;
      background-color: rgba(141, 0, 153, 0.1);
    }
    .dragging {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableWeeklyCalendar {
  // 輸入屬性
  initialData = input<ScheduleData[]>([]);
  readonly = input<boolean>(false);

  // 輸出事件
  scheduleChange = output<ScheduleData[]>();

  // 標準時間段
  times = [
    '09:00',
    '10:00',
    '11:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '19:00',
    '20:00',
  ];

  // 週資料
  weekDays = [
    { week: '週日', week_day: 7 },
    { week: '週一', week_day: 1 },
    { week: '週二', week_day: 2 },
    { week: '週三', week_day: 3 },
    { week: '週四', week_day: 4 },
    { week: '週五', week_day: 5 },
    { week: '週六', week_day: 6 },
  ];

  // 狀態管理
  private isSelecting = signal(false);
  private selectionMode = signal<'select' | 'deselect'>('select');
  private selectedSlots = signal<Set<string>>(new Set());
  isDragging = signal(false);
  private mouseDownPosition = signal<{ x: number; y: number } | null>(null);
  private isMouseUpHandled = signal(false);

  // 計算屬性：排程資料
  schedule = computed(() => {
    const initialSchedule = this.initialData();

    return this.weekDays.map((day) => {
      const dayData = initialSchedule.find((d) => d.week_day === day.week_day);
      const availableTimes = dayData?.available_times || [];

      const slots: TimeSlot[] = this.times.map((time) => {
        const isSelected = this.selectedSlots().has(`${day.week_day}-${time}`);
        const status = availableTimes.includes(time) ? 'available' : 'unavailable';
        let cssClass = status === 'available' ? 'slot-available' : 'slot-unavailable';
        if (isSelected) {
          cssClass += ' slot-selected';
        }

        return {
          time,
          status,
          selected: isSelected,
          cssClass,
        };
      });

      return {
        ...day,
        slots,
      };
    });
  });


  // 處理時段點擊
  onSlotClick(dayIndex: number, slotIndex: number, event: MouseEvent) {
    // 如果是唯讀模式，不處理點擊
    if (this.readonly()) {
      return;
    }
    // 如果有拖拽行為，不處理點擊
    if (this.isDragging()) {
      return;
    }

    event.preventDefault();
    const day = this.schedule()[dayIndex];
    const slot = day.slots[slotIndex];

    this.toggleSlotStatus(day.week_day, slot.time);
  }

  // 處理滑鼠按下
  onMouseDown(dayIndex: number, slotIndex: number, event: MouseEvent) {
    // 如果是唯讀模式，不處理滑鼠事件
    if (this.readonly()) {
      return;
    }
    if (event.button !== 0) return; // 只處理左鍵

    event.preventDefault();

    // 記錄滑鼠按下位置
    this.mouseDownPosition.set({ x: event.clientX, y: event.clientY });
    this.isDragging.set(false);

    const day = this.schedule()[dayIndex];
    const slot = day.slots[slotIndex];

    this.isSelecting.set(true);
    this.selectionMode.set(slot.status === 'available' ? 'deselect' : 'select');

    // 清空之前的選擇
    this.selectedSlots.set(new Set());

    // 開始選擇當前時段
    const slotKey = `${day.week_day}-${slot.time}`;
    this.selectedSlots.update((set) => new Set([...set, slotKey]));
  }

  // 處理滑鼠移動（拖拽）
  onMouseMove(dayIndex: number, slotIndex: number, event: MouseEvent) {
    // 嚴格檢查：必須有mousedown、正在選取、且滑鼠按鈕確實按下
    if (!this.isSelecting() ||
        event.buttons !== 1 ||
        !this.mouseDownPosition()) {
      return;
    }

    // 防止文字選取
    event.preventDefault();

    // 檢查是否開始拖拽（滑鼠移動超過閾值）
    const mouseDownPos = this.mouseDownPosition();
    if (mouseDownPos && !this.isDragging()) {
      const distance = Math.sqrt(
        Math.pow(event.clientX - mouseDownPos.x, 2) +
        Math.pow(event.clientY - mouseDownPos.y, 2)
      );

      // 如果移動距離超過 5px，視為拖拽
      if (distance > 5) {
        this.isDragging.set(true);
      }
    }

    // 如果確定是拖拽，則選取時段
    if (this.isDragging()) {
      const day = this.schedule()[dayIndex];
      const slot = day.slots[slotIndex];
      const slotKey = `${day.week_day}-${slot.time}`;

      this.selectedSlots.update((set) => new Set([...set, slotKey]));
    }
  }

  // 處理滑鼠釋放
  onMouseUp() {
    if (!this.isSelecting() || this.isMouseUpHandled()) {
      return;
    }

    this.isMouseUpHandled.set(true);
    const wasDragging = this.isDragging();

    // 如果有拖拽行為，先應用批量變更
    if (wasDragging) {
      this.applySelectedChanges();
    }

    // 然後重置所有狀態
    this.isSelecting.set(false);
    this.isDragging.set(false);
    this.mouseDownPosition.set(null);
    this.selectedSlots.set(new Set());
    this.isMouseUpHandled.set(false);
  }

  // 切換單個時段狀態
  private toggleSlotStatus(weekDay: number, time: string) {
    const currentData = this.initialData();
    const updatedData = [...currentData];

    const dayIndex = updatedData.findIndex((d) => d.week_day === weekDay);

    if (dayIndex === -1) {
      // 新增這一天的資料
      updatedData.push({
        week_day: weekDay,
        available_times: [time],
      });
    } else {
      const day = updatedData[dayIndex];
      const timeIndex = day.available_times.indexOf(time);

      if (timeIndex === -1) {
        // 新增時段
        day.available_times.push(time);
      } else {
        // 移除時段
        day.available_times.splice(timeIndex, 1);
      }
    }

    this.scheduleChange.emit(updatedData);
  }

  // 應用選擇的變更
  private applySelectedChanges() {
    const mode = this.selectionMode();
    const selectedKeys = Array.from(this.selectedSlots());
    const currentData = this.initialData();
    const updatedData = [...currentData];

    selectedKeys.forEach((slotKey) => {
      const [weekDayStr, time] = slotKey.split('-');
      const weekDay = parseInt(weekDayStr);

      const dayIndex = updatedData.findIndex((d) => d.week_day === weekDay);

      if (mode === 'select') {
        // 新增時段
        if (dayIndex === -1) {
          updatedData.push({
            week_day: weekDay,
            available_times: [time],
          });
        } else {
          const day = updatedData[dayIndex];
          if (!day.available_times.includes(time)) {
            day.available_times.push(time);
          }
        }
      } else {
        // 移除時段
        if (dayIndex !== -1) {
          const day = updatedData[dayIndex];
          const timeIndex = day.available_times.indexOf(time);
          if (timeIndex !== -1) {
            day.available_times.splice(timeIndex, 1);
          }
        }
      }
    });

    this.scheduleChange.emit(updatedData);
  }



  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent) {
    // 全域 mouseup 只作為備用，防止拖拽狀態卡住
    if (this.isSelecting() && !this.isMouseUpHandled()) {
      this.onMouseUp();
    }
  }

  @HostListener('document:mouseleave', ['$event'])
  onDocumentMouseLeave(event: MouseEvent) {
    // 當滑鼠離開文檔時，確保重置所有選取狀態
    if (this.isSelecting()) {
      this.resetSelectionState();
    }
  }

  private resetSelectionState() {
    this.isSelecting.set(false);
    this.isDragging.set(false);
    this.mouseDownPosition.set(null);
    this.selectedSlots.set(new Set());
    this.isMouseUpHandled.set(false);
  }
}
