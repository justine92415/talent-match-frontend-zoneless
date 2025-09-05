import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

type Status = 'unavailable' | 'available' | 'reserved';

interface StatusConfig {
  icon: string;
  text?: string;
  bgColor: string;
  textColor: string;
  iconSize: string;
  ariaLabel: string;
}

@Component({
  selector: 'tmf-reserve-tag',
  imports: [],
  templateUrl: './reserve-tag.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReserveTag {
  reserveStatus = input<Status>('unavailable');

  // 狀態配置映射
  private readonly statusConfigs: Record<Status, StatusConfig> = {
    reserved: {
      icon: 'beenhere',
      text: '已預約',
      bgColor: 'bg-purple',
      textColor: 'text-white',
      iconSize: 'text-xl',
      ariaLabel: '已預約狀態'
    },
    available: {
      icon: 'add',
      bgColor: 'bg-grey-f7',
      textColor: 'text-grey-33',
      iconSize: 'text-2xl',
      ariaLabel: '可預約狀態'
    },
    unavailable: {
      icon: 'do_not_disturb_on',
      bgColor: 'bg-grey-66',
      textColor: 'text-white',
      iconSize: 'text-2xl',
      ariaLabel: '不可預約狀態'
    }
  };

  // 計算當前狀態配置
  currentConfig = computed(() => {
    return this.statusConfigs[this.reserveStatus()];
  });
}
