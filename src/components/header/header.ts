import {
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChild,
  TemplateRef,
  ViewContainerRef,
  computed,
  inject,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterLink, Router } from '@angular/router';
import { TmfIconEnum } from '@share/icon.enum';
import { DropdownManagerService } from './dropdown-manager.service';
import { Button } from '@components/button/button';
import { AuthService } from '@app/services/auth.service';

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
  route?: string; // 路由路徑
}

// 下拉選單 ID 常數
const DROPDOWN_IDS = {
  CITY: 'city',
  EXPLORE: 'explore',
  NOTIFICATION: 'notification',
  CART: 'cart',
  USER: 'user',
} as const;

@Component({
  selector: 'tmf-header',
  imports: [MatIconModule, OverlayModule, Button, RouterLink],
  providers: [DropdownManagerService],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit, AfterViewInit {
  readonly cityDropdownTemplate = viewChild.required<TemplateRef<any>>(
    'cityDropdownTemplate',
  );
  readonly exploreDropdownTemplate = viewChild.required<TemplateRef<any>>(
    'exploreDropdownTemplate',
  );
  readonly notificationDropdownTemplate = viewChild.required<TemplateRef<any>>(
    'notificationDropdownTemplate',
  );
  readonly cartDropdownTemplate = viewChild.required<TemplateRef<any>>(
    'cartDropdownTemplate',
  );
  readonly userDropdownTemplate = viewChild.required<TemplateRef<any>>(
    'userDropdownTemplate',
  );

  dropdownManager = inject(DropdownManagerService);
  viewContainerRef = inject(ViewContainerRef);
  authService = inject(AuthService);
  private router = inject(Router);

  // 認證相關的計算屬性
  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
  userName = computed(() => this.user()?.nick_name || this.user()?.name || '用戶');
  userRole = computed(() => this.user()?.account_status);


  // 城市 Mock Data
  readonly cities = signal<City[]>([
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
  ]);

  // 課程分類 Mock Data
  readonly categories = signal<Category[]>([
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
  ]);

  // 通知 Mock Data
  readonly notifications = signal<Notification[]>([
    {
      id: 'class-reminder-1',
      type: 'class',
      title: '上課提醒：明天上午9:00有課程...',
      timeAgo: '1 天前',
      backgroundColor: 'bg-orange-90',
      icon: TmfIconEnum.NotificationsActive,
      iconColor: 'text-primary',
    },
    {
      id: 'system-update-1',
      type: 'system',
      title: '系統通知：今日 23:00 系統日常性更新',
      timeAgo: '4 天前',
      icon: TmfIconEnum.Campaign,
      backgroundColor: 'bg-blue-95',
      iconColor: 'text-blue-50',
    },
    {
      id: 'class-reminder-2',
      type: 'class',
      title: '課程提醒：新的作業已經發布',
      timeAgo: '1 週前',
      icon: TmfIconEnum.NotificationsActive,
      backgroundColor: 'bg-orange-90',
      iconColor: 'text-primary',
    },
  ]);

  // 購物車 Mock Data
  readonly cartItems = signal<CartItem[]>([
    {
      id: 'cooking-workshop',
      title: '饗宴廚藝：美食烹飪工作坊',
      tags: ['高手班', '烹飪料理'],
      courseType: '十堂課程',
      price: 12000,
      imageUrl: 'assets/images/cooking-course.jpg',
    },
    {
      id: 'piano-masterclass',
      title: '琴韻魔法：鋼琴彈奏交響指南',
      tags: ['大師班', '音樂', '鋼琴'],
      courseType: '單堂課程',
      price: 1200,
      imageUrl: 'assets/images/piano-course.jpg',
    },
  ]);

  // 用戶選單 - 根據角色動態生成
  readonly userMenuItems = computed<UserMenuItem[]>(() => {
    const role = this.userRole();
    const commonItems: UserMenuItem[] = [
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

    if (this.authService.hasRole('teacher')) {
      return [
        {
          id: 'teacher-info',
          label: '教師資訊管理',
          icon: TmfIconEnum.Face,
          route: '/dashboard/teacher/info',
        },
        {
          id: 'teacher-videos',
          label: '影片管理',
          icon: TmfIconEnum.SmartDisplay,
          route: '/dashboard/teacher/videos',
        },
        {
          id: 'teacher-reservation',
          label: '預約管理',
          icon: TmfIconEnum.EditCalendar,
          route: '/dashboard/teacher/reservation',
        },
        {
          id: 'teacher-courses',
          label: '課程管理',
          icon: TmfIconEnum.LabProfile,
          route: '/dashboard/teacher/courses',
        },
        {
          id: 'teacher-record',
          label: '交易紀錄',
          icon: TmfIconEnum.AccountBalanceWallet,
          route: '/dashboard/teacher/record',
        },
        ...commonItems,
      ];
    } else if (this.authService.hasRole('student')) {
      return [
        {
          id: 'student-info',
          label: '學員資訊',
          icon: TmfIconEnum.Face,
          route: '/dashboard/student/info',
        },
        {
          id: 'student-courses',
          label: '我的課程',
          icon: TmfIconEnum.LabProfile,
          route: '/dashboard/student/courses',
        },
        {
          id: 'student-favorites',
          label: '收藏清單',
          icon: TmfIconEnum.Favorite,
          route: '/dashboard/student/favorites',
        },
        {
          id: 'student-calendar',
          label: '行事曆',
          icon: TmfIconEnum.EditCalendar,
          route: '/dashboard/student/calendar',
        },
        {
          id: 'student-record',
          label: '交易紀錄',
          icon: TmfIconEnum.AccountBalanceWallet,
          route: '/dashboard/student/record',
        },
        ...commonItems,
      ];
    }

    return commonItems;
  });

  readonly selectedCity = signal<string>('台北市');
  readonly selectedCategory = signal<Category | null>(null);

  // Mobile 選單狀態
  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly expandedCategory = signal<string | null>(null);
  readonly mobileMenuCategories = computed(() => this.categories());

  // 使用 computed 創建派生 signal
  readonly totalItems = computed(() => this.cartItems().length);
  readonly totalPrice = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.price, 0),
  );

  get TmfIconEnum() {
    return TmfIconEnum;
  }

  ngOnInit(): void {
    // 如果已登入但沒有用戶資訊，則載入
    if (this.isAuthenticated() && !this.user()) {
      this.authService.loadUserProfile().subscribe();
    }
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

  onUserMenuItemClick(item: UserMenuItem): void {
    if (item.isDivider) return;

    if (item.id === 'logout') {
      this.authService.logout();
    } else if (item.route) {
      // 有路由則導航
      this.router.navigate([item.route]);
    } else {
      console.log(`點擊選單項目: ${item.label} (無路由設定)`);
    }

    // 點擊選單項目後關閉下拉選單
    this.dropdownManager.closeDropdown(DROPDOWN_IDS.USER);
  }

  // 城市下拉選單控制
  toggleCityDropdown(trigger: HTMLElement): void {
    this.dropdownManager.toggleDropdown(
      DROPDOWN_IDS.CITY,
      trigger,
      this.viewContainerRef,
    );
  }

  // 探索下拉選單控制
  toggleExploreDropdown(trigger: HTMLElement): void {
    this.dropdownManager.toggleDropdown(
      DROPDOWN_IDS.EXPLORE,
      trigger,
      this.viewContainerRef,
    );
  }

  // 通知下拉選單控制
  toggleNotificationDropdown(trigger: HTMLElement): void {
    this.dropdownManager.toggleDropdown(
      DROPDOWN_IDS.NOTIFICATION,
      trigger,
      this.viewContainerRef,
    );
  }

  // 購物車下拉選單控制
  toggleCartDropdown(trigger: HTMLElement): void {
    this.dropdownManager.toggleDropdown(
      DROPDOWN_IDS.CART,
      trigger,
      this.viewContainerRef,
    );
  }

  // 用戶下拉選單控制
  toggleUserDropdown(trigger: HTMLElement): void {
    this.dropdownManager.toggleDropdown(
      DROPDOWN_IDS.USER,
      trigger,
      this.viewContainerRef,
    );
  }

  // 城市選擇後的處理（需要關閉下拉選單）
  selectCityAndClose(city: City): void {
    this.selectCity(city);
    this.dropdownManager.closeDropdown(DROPDOWN_IDS.CITY);
  }

  // Mobile 選單控制方法
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    // 關閉選單時也重置展開的分類
    this.expandedCategory.set(null);
  }

  toggleMobileCitySelection(): void {
    // 這裡可以實作城市選擇邏輯，目前先簡單 console.log
    console.log('Toggle mobile city selection');
  }

  onMobileCategoryClick(category: Category): void {
    // 如果分類沒有子分類，直接導航
    if (!category.subcategories || category.subcategories.length === 0) {
      console.log('Navigate to category:', category.name);
      // TODO: 實作導航邏輯
      return;
    }

    // 有子分類的話，切換展開狀態
    const currentExpanded = this.expandedCategory();
    if (currentExpanded === category.id) {
      // 如果當前分類已展開，則收合
      this.expandedCategory.set(null);
    } else {
      // 否則展開當前分類
      this.expandedCategory.set(category.id);
    }
  }

  onMobileSubcategoryClick(subcategory: Subcategory): void {
    console.log('Navigate to subcategory:', subcategory.name);
    // TODO: 實作子分類導航邏輯
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategory() === categoryId;
  }

  ngAfterViewInit(): void {
    // 註冊所有下拉選單
    this.dropdownManager.registerDropdown(
      DROPDOWN_IDS.CITY,
      this.cityDropdownTemplate(),
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 0,
      },
    );

    this.dropdownManager.registerDropdown(
      DROPDOWN_IDS.EXPLORE,
      this.exploreDropdownTemplate(),
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 0,
        offsetX: -8,
      },
    );

    this.dropdownManager.registerDropdown(
      DROPDOWN_IDS.NOTIFICATION,
      this.notificationDropdownTemplate(),
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 0,
      },
    );

    this.dropdownManager.registerDropdown(
      DROPDOWN_IDS.CART,
      this.cartDropdownTemplate(),
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 0,
      },
    );

    this.dropdownManager.registerDropdown(
      DROPDOWN_IDS.USER,
      this.userDropdownTemplate(),
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 0,
      },
    );
  }
}
