import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';

interface City {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  type: 'class' | 'system';
  title: string;
  timeAgo: string;
  icon: string;
  backgroundColor: string;
  iconColor: string;
}

interface CartItem {
  id: string;
  title: string;
  tags: string[];
  courseType: string;
  price: number;
  imageUrl: string;
}

interface UserMenuItem {
  id: string;
  label: string;
  icon: string;
  isDivider?: boolean;
}

@Component({
  selector: 'tmf-header',
  imports: [MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  // 城市 Mock Data
  cities: City[] = [
    { id: 'all', name: '探索全部' },
    { id: 'taipei', name: '台北市' },
    { id: 'taoyuan', name: '桃園市' },
    { id: 'tainan', name: '台南市' },
    { id: 'kaohsiung', name: '高雄市' },
    { id: 'new-taipei', name: '新北市' },
    { id: 'taichung', name: '台中市' },
    { id: 'hsinchu', name: '新竹市' },
    { id: 'chiayi', name: '嘉義市' },
    { id: 'keelung', name: '基隆市' },
    { id: 'hualien', name: '花蓮縣' },
    { id: 'taitung', name: '台東縣' },
  ];

  // 課程分類 Mock Data
  categories: Category[] = [
    {
      id: 'all',
      name: '探索全部',
      subcategories: [],
    },
    {
      id: 'cooking',
      name: '烹飪料理',
      subcategories: [
        { id: 'all-cooking', name: '所有料理' },
        { id: 'chinese', name: '中式料理' },
        { id: 'western', name: '西式料理' },
        { id: 'japanese', name: '日式料理' },
        { id: 'baking', name: '烘焙甜點' },
      ],
    },
    {
      id: 'finance',
      name: '理財投資',
      subcategories: [
        { id: 'all-finance', name: '所有投資' },
        { id: 'stocks', name: '股票投資' },
        { id: 'crypto', name: '加密貨幣' },
        { id: 'real-estate', name: '房地產' },
        { id: 'insurance', name: '保險規劃' },
      ],
    },
    {
      id: 'art',
      name: '藝術創作',
      subcategories: [
        { id: 'all-art', name: '所有藝術' },
        { id: 'digital', name: '電腦繪圖' },
        { id: '3d-model', name: '3D 模型' },
        { id: 'sketch', name: '鉛筆素描' },
        { id: 'web-design', name: '網頁設計' },
        { id: 'animation', name: '動畫特效' },
        { id: 'color', name: '色彩學' },
        { id: 'graphic', name: '平面設計' },
        { id: 'watercolor', name: '水彩插圖' },
      ],
    },
    {
      id: 'craft',
      name: '手作工藝',
      subcategories: [
        { id: 'all-craft', name: '所有工藝' },
        { id: 'pottery', name: '陶藝製作' },
        { id: 'knitting', name: '編織刺繡' },
        { id: 'woodwork', name: '木工雕刻' },
        { id: 'jewelry', name: '首飾製作' },
      ],
    },
  ];

  // 通知 Mock Data
  notifications: Notification[] = [
    {
      id: 'class-reminder-1',
      type: 'class',
      title: '上課提醒：明天上午9:00有課程...',
      timeAgo: '1 天前',
      icon: TmfIconEnum.NotificationsActive,
      backgroundColor: 'bg-orange-90',
      iconColor: 'text-primary'
    },
    {
      id: 'system-update-1',
      type: 'system',
      title: '系統通知：今日 23:00 系統日常性更新',
      timeAgo: '4 天前',
      icon: TmfIconEnum.Campaign,
      backgroundColor: 'bg-blue-95',
      iconColor: 'text-blue-50'
    },
    {
      id: 'class-reminder-2',
      type: 'class',
      title: '課程提醒：新的作業已經發布',
      timeAgo: '1 週前',
      icon: TmfIconEnum.NotificationsActive,
      backgroundColor: 'bg-orange-90',
      iconColor: 'text-primary'
    }
  ];

  // 購物車 Mock Data
  cartItems: CartItem[] = [
    {
      id: 'cooking-workshop',
      title: '饗宴廚藝：美食烹飪工作坊',
      tags: ['高手班', '烹飪料理'],
      courseType: '十堂課程',
      price: 12000,
      imageUrl: 'assets/images/cooking-course.jpg'
    },
    {
      id: 'piano-masterclass',
      title: '琴韻魔法：鋼琴彈奏交響指南',
      tags: ['大師班', '音樂', '鋼琴'],
      courseType: '單堂課程',
      price: 1200,
      imageUrl: 'assets/images/piano-course.jpg'
    }
  ];

  // 用戶選單 Mock Data
  userMenuItems: UserMenuItem[] = [
    {
      id: 'teacher-profile',
      label: '教師資訊管理',
      icon: TmfIconEnum.Face,
    },
    {
      id: 'video-management',
      label: '影片管理',
      icon: TmfIconEnum.SmartDisplay,
    },
    {
      id: 'calendar-management',
      label: '行事曆管理',
      icon: TmfIconEnum.EditCalendar,
    },
    {
      id: 'course-management',
      label: '課程管理',
      icon: TmfIconEnum.LabProfile,
    },
    {
      id: 'transaction-history',
      label: '交易紀錄',
      icon: TmfIconEnum.AccountBalanceWallet,
    },
    {
      id: 'account-settings',
      label: '帳戶管理',
      icon: TmfIconEnum.Settings,
    },
    {
      id: 'divider-1',
      label: '',
      icon: '',
      isDivider: true,
    },
    {
      id: 'messages',
      label: '訊息',
      icon: TmfIconEnum.Forum,
    },
    {
      id: 'announcements',
      label: '公告',
      icon: TmfIconEnum.Notifications,
    },
    {
      id: 'divider-2',
      label: '',
      icon: '',
      isDivider: true,
    },
    {
      id: 'logout',
      label: '登出',
      icon: TmfIconEnum.MoveItem,
    },
  ];

  selectedCity = signal<string>('台北市');
  selectedCategory = signal<Category | null>(null);

  get TmfIconEnum() {
    return TmfIconEnum;
  }

  selectCity(city: City): void {
    this.selectedCity.set(city.name);
  }

  selectCategory(category: Category): void {
    // 如果點擊的是同一個分類，則取消選擇
    if (this.selectedCategory()?.id === category.id) {
      this.selectedCategory.set(null);
    } else {
      this.selectedCategory.set(category);
    }
  }

  get totalItems(): number {
    return this.cartItems.length;
  }

  get totalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price, 0);
  }

  onUserMenuItemClick(item: UserMenuItem): void {
    if (item.isDivider) return;
    
    console.log('點擊用戶選單項目：', item.label);
    // TODO: 實作各個選單項目的功能
    if (item.id === 'logout') {
      console.log('執行登出邏輯');
    }
  }
}
