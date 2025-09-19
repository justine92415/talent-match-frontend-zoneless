import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { CourseCard, CourseCardData } from '@components/course-card/course-card';
import Pagination from '@components/pagination/pagination';
import { TmfIconEnum } from '@share/icon.enum';
import { PublicCoursesService } from '@app/api/generated/public-courses/public-courses.service';
import { TagsService } from '@app/api/generated/tags/tags.service';
import { TagItem, SubCategoryItem } from '@app/api/generated/talentMatchAPI.schemas';
import { map } from 'rxjs/operators';

// 定義分類介面
interface Category {
  id: string;
  name: string;
  icon: string;
}

interface SubCategory {
  id: string;
  name: string;
  parentId: string;
}

interface FilterOption {
  id: string;
  name: string;
}

@Component({
  selector: 'tmf-result-tag',
  imports: [MatIconModule, CommonModule, CourseCard, Pagination],
  templateUrl: './result-tag.html',
  styles: ``
})
export default class ResultTag implements OnInit {
  private publicCoursesService = inject(PublicCoursesService);
  private tagsService = inject(TagsService);
  private route = inject(ActivatedRoute);

  // 篩選參數 signals
  selectedMainCategoryId = signal<number | null>(null);
  selectedSubCategoryId = signal<number | null>(null);
  selectedFilterId = signal('latest');
  currentPage = signal(1);
  itemsPerPage = signal(12);

  // 篩選選項資料
  filterOptions: FilterOption[] = [
    { id: 'latest', name: '最新課程' },
    { id: 'popular', name: '最高人氣' },
    { id: 'price-low', name: '最低價格' },
    { id: 'price-high', name: '最高價格' }
  ];

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

  // 課程查詢參數的 computed signal
  courseParams = computed(() => {
    const params: any = {
      page: this.currentPage(),
      per_page: this.itemsPerPage(),
      sort: this.getSortValue(),
    };

    // 只有當值不為 null 時才添加參數
    if (this.selectedMainCategoryId() !== null) {
      params.main_category_id = this.selectedMainCategoryId();
    }

    if (this.selectedSubCategoryId() !== null) {
      params.sub_category_id = this.selectedSubCategoryId();
    }

    return params;
  });

  // 使用 rxResource 管理課程資料
  coursesResource = rxResource({
    params: () => this.courseParams(),
    stream: ({params}) => {
      return this.publicCoursesService.getApiCoursesPublic(params).pipe(
      map(response => {
        if (response.data) {
          return {
            courses: this.transformApiCoursesToCardData(response.data.courses || []),
            totalResults: response.data.pagination?.total || 0
          };
        }
        throw new Error('載入課程失敗');
      })
    )
    }
  });

  // 計算主分類清單（包含探索全部），附帶圖示
  mainCategories = computed(() => {
    const tags = this.tagsResource.value() as TagItem[] | undefined;
    if (!tags) return [];

    const iconMap: Record<string, string> = {
      '藝術創作': TmfIconEnum.DrawAbstract,
      '手作工藝': TmfIconEnum.ToolsPliersWireStripper,
      '舞蹈表演': TmfIconEnum.Taunt,
      '樂器演奏': TmfIconEnum.QueueMusic,
    };

    const allCategory = {
      id: null,
      main_category: '探索全部',
      sub_category: [],
      icon_url: null,
      icon: TmfIconEnum.ActionKey,
      isSelected: this.selectedMainCategoryId() === null
    };

    const categoriesWithIcons = tags.map((tag: TagItem) => ({
      ...tag,
      icon: iconMap[tag.main_category] || TmfIconEnum.Search,
      isSelected: this.selectedMainCategoryId() === tag.id
    }));

    return [allCategory, ...categoriesWithIcons];
  });

  // 計算當前選中主分類的子分類（包含"全部"選項）
  currentSubCategories = computed(() => {
    const selectedMainId = this.selectedMainCategoryId();
    const tags = this.tagsResource.value() as TagItem[] | undefined;

    if (selectedMainId === null || !tags) return [];

    const selectedMain = tags.find((tag: TagItem) => tag.id === selectedMainId);
    if (!selectedMain) return [];

    const allSubCategory = {
      id: null,
      name: `所有${selectedMain.main_category}`,
      isSelected: this.selectedSubCategoryId() === null
    };

    const subCategoriesWithSelection = selectedMain.sub_category.map((sub: SubCategoryItem) => ({
      ...sub,
      isSelected: this.selectedSubCategoryId() === sub.id
    }));

    return [allSubCategory, ...subCategoriesWithSelection];
  });


  // 計算總頁數
  totalPages = computed(() => {
    const coursesData = this.coursesResource.value() as { totalResults: number; courses: CourseCardData[] } | undefined;
    return coursesData ? Math.ceil(coursesData.totalResults / this.itemsPerPage()) : 0;
  });

  // 總結果數
  totalResults = computed(() => {
    const coursesData = this.coursesResource.value() as { totalResults: number; courses: CourseCardData[] } | undefined;
    return coursesData?.totalResults || 0;
  });

  // 課程列表
  courses = computed(() => {
    const coursesData = this.coursesResource.value() as { totalResults: number; courses: CourseCardData[] } | undefined;
    return coursesData?.courses || [];
  });

  // 獲取目前選中的分類名稱
  selectedCategoryName = computed(() => {
    const selectedMainId = this.selectedMainCategoryId();
    const selectedSubId = this.selectedSubCategoryId();

    if (selectedMainId === null) {
      return '全部課程';
    }

    if (selectedSubId) {
      const subCategory = this.currentSubCategories().find(sub => sub.id === selectedSubId);
      if (subCategory) return subCategory.name;
    }

    const tags = this.tagsResource.value() as TagItem[] | undefined;
    const mainCategory = tags?.find((tag: TagItem) => tag.id === selectedMainId);
    return mainCategory?.main_category || '未知分類';
  });

  // 計算篩選選項的狀態（包含選中狀態）
  filtersWithSelection = computed(() => {
    const selectedFilterId = this.selectedFilterId();
    return this.filterOptions.map(filter => ({
      ...filter,
      isSelected: filter.id === selectedFilterId
    }));
  });

  // TmfIcon getter for template
  get TmfIcon() {
    return TmfIconEnum;
  }

  ngOnInit(): void {
    // 從 URL 查詢參數設定初始分類
    this.route.queryParams.subscribe(params => {
      if (params['mainCategory']) {
        const mainCategoryId = parseInt(params['mainCategory'], 10);
        if (!isNaN(mainCategoryId)) {
          this.selectedMainCategoryId.set(mainCategoryId);
        }
      }

      if (params['subCategory']) {
        const subCategoryId = parseInt(params['subCategory'], 10);
        if (!isNaN(subCategoryId)) {
          this.selectedSubCategoryId.set(subCategoryId);
        }
      }
    });
  }


  // 選擇主分類
  selectMainCategory(categoryId: number | null): void {
    this.selectedMainCategoryId.set(categoryId);
    this.selectedSubCategoryId.set(null); // 重置子分類
    this.currentPage.set(1); // 重置頁碼
    // rxResource 會自動重新載入課程
  }

  // 選擇子分類
  selectSubCategory(subCategoryId: number | null): void {
    this.selectedSubCategoryId.set(subCategoryId);
    this.currentPage.set(1); // 重置頁碼
    // rxResource 會自動重新載入課程
  }

  // 選擇篩選選項
  selectFilter(filterId: string): void {
    this.selectedFilterId.set(filterId);
    this.currentPage.set(1); // 重置頁碼
    // rxResource 會自動重新載入課程
  }

  // 頁碼變更處理
  onPageChange(page: number): void {
    this.currentPage.set(page);
    // rxResource 會自動重新載入課程
  }

  // 轉換 API 回應為 CourseCardData 格式
  private transformApiCoursesToCardData(apiCourses: any[]): CourseCardData[] {
    return apiCourses.map(course => ({
      id: course.id?.toString() || '',
      title: course.name || '',
      description: '', // API 回應中沒有 description，可能需要另外處理
      imageSrc: course.image_url || 'assets/images/default-course.jpg',
      level: '一般班', // API 回應中沒有 level，可能需要根據其他資料推斷
      category: `${course.main_category?.name || ''}－${course.sub_category?.name || ''}`,
      price: course.min_price || 0,
      teacher: {
        name: course.teacher?.user?.name || '',
        avatar: course.teacher?.user?.avatar_image || 'assets/images/default-avatar.jpg'
      },
      rating: {
        score: parseFloat(course.rate || '0'),
        count: course.review_count || 0
      }
    }));
  }

  // 獲取排序值
  private getSortValue(): string {
    const sortMap: Record<string, string> = {
      'latest': 'newest',
      'popular': 'popular',
      'price-low': 'price_low',
      'price-high': 'price_high'
    };
    return sortMap[this.selectedFilterId()] || 'newest';
  }

  // TrackBy 函式以提升效能

  trackByCategory(index: number, category: Category): string {
    return category.id;
  }

  trackBySubCategory(index: number, subCategory: SubCategory): string {
    return subCategory.id;
  }

  trackByFilter(index: number, filter: FilterOption): string {
    return filter.id;
  }

  trackByCourse(index: number, course: CourseCardData): string {
    return course.id;
  }

  trackByPage(index: number, page: number | string): string {
    return page.toString();
  }
}
