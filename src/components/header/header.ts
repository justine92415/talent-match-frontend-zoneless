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
import { rxResource } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TmfIconEnum } from '@share/icon.enum';
import { DropdownManagerService } from './dropdown-manager.service';
import { Button } from '@components/button/button';
import { Skeleton } from '@components/skeleton/skeleton';
import { AuthService } from '@app/services/auth.service';
import { TagsService } from '@app/api/generated/tags/tags.service';
import { TagItem, SubCategoryItem } from '@app/api/generated/talentMatchAPI.schemas';
import { CartService } from '@app/services/cart.service';
import { map } from 'rxjs/operators';

interface City {
  id: string;
  name: string;
}

// 使用 API 的原始類型，這裡只是為了類型擴展
interface CategoryWithSelection extends Omit<TagItem, 'id'> {
  id: number | null;
  isSelected?: boolean;
  isExpanded?: boolean;
}

interface SubcategoryWithSelection extends SubCategoryItem {
  isSelected?: boolean;
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
  imports: [MatIconModule, OverlayModule, Button, Skeleton, RouterLink, CommonModule],
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
  private tagsService = inject(TagsService);
  private cartService = inject(CartService);

  // 認證相關的計算屬性
  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
  isLoading = this.authService.isLoading;
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

  // 使用 rxResource 管理 tags 資料
  tagsResource = rxResource({
    stream: () => this.tagsService.getApiTags().pipe(
      map(response => {
        if (response.status && response.data) {
          return response.data;
        }
        throw new Error('載入分類失敗');
      })
    )
  });

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

  // 購物車資源和資料
  cartResource = this.cartService.cartResource;
  cartItems = this.cartService.cartItems;

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
  readonly selectedCategory = signal<CategoryWithSelection | null>(null);

  // 計算主分類清單（包含探索全部），附帶選中和展開狀態
  categories = computed(() => {
    const tags = this.tagsResource.value() as TagItem[] | undefined;
    if (!tags) return [];

    const selectedCat = this.selectedCategory();
    const selectedId = selectedCat?.id;
    const expandedCategoryId = this.expandedCategory();

    const allCategory: CategoryWithSelection = {
      id: null,
      main_category: '探索全部',
      sub_category: [],
      icon_url: null,
      isSelected: selectedCat !== null && selectedId === null,
      isExpanded: expandedCategoryId === 'all'
    };

    const categoriesWithSelection = tags.map((tag: TagItem) => ({
      ...tag,
      isSelected: selectedCat !== null && selectedId === tag.id,
      isExpanded: expandedCategoryId === tag.id?.toString()
    }));

    return [allCategory, ...categoriesWithSelection];
  });

  // 計算當前選中主分類的子分類
  currentSubCategories = computed(() => {
    const selectedCat = this.selectedCategory();
    if (!selectedCat || !selectedCat.sub_category || selectedCat.sub_category.length === 0) {
      return [];
    }
    return selectedCat.sub_category;
  });

  // 計算是否應該顯示子分類區域
  shouldShowSubCategories = computed(() => {
    const selectedCat = this.selectedCategory();
    return selectedCat && selectedCat.sub_category && selectedCat.sub_category.length > 0;
  });

  // 計算當前選中分類的主分類ID（用於子分類導航）
  selectedMainCategoryId = computed(() => {
    const selectedCat = this.selectedCategory();
    return selectedCat?.id || null;
  });

  // Mobile 選單狀態
  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly expandedCategory = signal<string | null>(null);

  // 購物車計算屬性
  totalItems = this.cartService.cartItemCount;
  totalPrice = this.cartService.totalAmount;

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

  selectCategory(category: CategoryWithSelection): void {
    // 如果沒有子分類，直接導航
    if (!category.sub_category || category.sub_category.length === 0) {
      this.navigateToCategory(category);
      return;
    }

    // 有子分類的情況：如果點擊的是同一個分類，則取消選擇
    if (this.selectedCategory()?.id === category.id) {
      this.selectedCategory.set(null);
    } else {
      this.selectedCategory.set(category);
    }
  }

  // 點擊主分類導航到 result-tag 頁面
  navigateToCategory(category: CategoryWithSelection): void {
    if (category.id === null) {
      // 探索全部 - 不傳分類參數
      this.router.navigate(['/result-tag']);
    } else {
      // 特定分類 - 傳入主分類ID
      this.router.navigate(['/result-tag'], {
        queryParams: { mainCategory: category.id }
      });
    }

    // 導航後還原下拉選單狀態
    this.selectedCategory.set(null);
    this.dropdownManager.closeDropdown(DROPDOWN_IDS.EXPLORE);
  }

  // 點擊子分類導航到 result-tag 頁面
  navigateToSubcategory(subcategory: SubcategoryWithSelection, mainCategoryId: number): void {
    this.router.navigate(['/result-tag'], {
      queryParams: {
        mainCategory: mainCategoryId,
        subCategory: subcategory.id
      }
    });

    // 導航後還原下拉選單狀態
    this.selectedCategory.set(null);
    this.dropdownManager.closeDropdown(DROPDOWN_IDS.EXPLORE);
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

  // 購物車相關方法
  removeFromCart(itemId: number): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        // 移除成功，rxResource 會自動更新
      },
      error: (error) => {
        console.error('移除購物車項目失敗:', error);
      }
    });
  }

  goToCart(): void {
    this.cartService.goToCart();
    this.dropdownManager.closeDropdown(DROPDOWN_IDS.CART);
  }

  goToSearch(): void {
    this.cartService.goToSearch();
    this.dropdownManager.closeDropdown(DROPDOWN_IDS.CART);
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

  onMobileCategoryClick(category: CategoryWithSelection): void {
    // 如果分類沒有子分類，直接導航
    if (!category.sub_category || category.sub_category.length === 0) {
      this.navigateToCategory(category);
      this.closeMobileMenu(); // 導航後關閉手機選單
      return;
    }

    // 有子分類的話，切換展開狀態
    const currentExpanded = this.expandedCategory();
    const categoryIdStr = category.id ? category.id.toString() : 'all';
    if (currentExpanded === categoryIdStr) {
      // 如果當前分類已展開，則收合
      this.expandedCategory.set(null);
    } else {
      // 否則展開當前分類
      this.expandedCategory.set(categoryIdStr);
    }
  }

  onMobileSubcategoryClick(subcategory: SubcategoryWithSelection, event: Event): void {
    event.stopPropagation(); // 防止事件冒泡到父分類

    // 找到當前展開的主分類ID
    const expandedCategoryId = this.expandedCategory();
    if (expandedCategoryId && expandedCategoryId !== 'all') {
      const mainCategoryId = parseInt(expandedCategoryId, 10);
      this.navigateToSubcategory(subcategory, mainCategoryId);
      this.closeMobileMenu(); // 導航後關閉手機選單
    }
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
