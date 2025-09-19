import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { CourseCard, CourseCardData } from '@components/course-card/course-card';
import Pagination from '@components/pagination/pagination';
import { TmfIconEnum } from '@share/icon.enum';
import { PublicCoursesService } from '@app/api/generated/public-courses/public-courses.service';
import { TagsService } from '@app/api/generated/tags/tags.service';
import { TagItem, SubCategoryItem } from '@app/api/generated/talentMatchAPI.schemas';
import { firstValueFrom } from 'rxjs';

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

  selectedMainCategoryId = signal<number | null>(null); // 使用數字ID
  selectedSubCategoryId = signal<number | null>(null); // 使用數字ID
  selectedFilterId = 'latest'; // 預設篩選：最新課程

  // 分頁相關 (使用 signals)
  currentPage = signal(1);
  totalResults = signal(0);
  itemsPerPage = signal(12);

  // API 狀態
  isLoading = signal(false);
  error = signal<string | null>(null);
  apiCourses = signal<CourseCardData[]>([]);

  // 分類資料 (從 API 載入)
  apiTags = signal<TagItem[]>([]);
  isTagsLoading = signal(false);
  tagsError = signal<string | null>(null);

  // 計算主分類清單（包含探索全部），附帶圖示
  mainCategories = computed(() => {
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

    const categoriesWithIcons = this.apiTags().map(tag => ({
      ...tag,
      icon: iconMap[tag.main_category] || TmfIconEnum.Search,
      isSelected: this.selectedMainCategoryId() === tag.id
    }));

    return [allCategory, ...categoriesWithIcons];
  });

  // 計算當前選中主分類的子分類（包含"全部"選項）
  currentSubCategories = computed(() => {
    const selectedMainId = this.selectedMainCategoryId();
    if (selectedMainId === null) return [];

    const selectedMain = this.apiTags().find(tag => tag.id === selectedMainId);
    if (!selectedMain) return [];

    const allSubCategory = {
      id: null,
      name: `所有${selectedMain.main_category}`,
      isSelected: this.selectedSubCategoryId() === null
    };

    const subCategoriesWithSelection = selectedMain.sub_category.map(sub => ({
      ...sub,
      isSelected: this.selectedSubCategoryId() === sub.id
    }));

    return [allSubCategory, ...subCategoriesWithSelection];
  });


  // 計算總頁數 (使用 computed)
  totalPages = computed(() => {
    return Math.ceil(this.totalResults() / this.itemsPerPage());
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

    const mainCategory = this.apiTags().find(tag => tag.id === selectedMainId);
    return mainCategory?.main_category || '未知分類';
  });

  // TmfIcon getter for template
  get TmfIcon() {
    return TmfIconEnum;
  }



  // 選擇主分類
  selectMainCategory(categoryId: number | null): void {
    this.selectedMainCategoryId.set(categoryId);
    this.selectedSubCategoryId.set(null); // 重置子分類
    this.currentPage.set(1); // 重置頁碼
    this.loadCourses(); // 重新載入課程
  }

  // 選擇子分類
  selectSubCategory(subCategoryId: number | null): void {
    this.selectedSubCategoryId.set(subCategoryId);
    this.currentPage.set(1); // 重置頁碼
    this.loadCourses(); // 重新載入課程
  }

  // 選擇篩選選項
  selectFilter(filterId: string): void {
    this.selectedFilterId = filterId;
    this.currentPage.set(1); // 重置頁碼
    this.loadCourses(); // 重新載入課程
  }

  async ngOnInit() {
    await Promise.all([
      this.loadTags(),
      this.loadCourses()
    ]);
  }

  // 載入分類標籤資料
  async loadTags() {
    this.isTagsLoading.set(true);
    this.tagsError.set(null);

    try {
      const response = await firstValueFrom(this.tagsService.getApiTags());
      if (response.status && response.data) {
        this.apiTags.set(response.data);
      } else {
        this.tagsError.set('載入分類失敗');
      }
    } catch (error) {
      console.error('載入分類失敗:', error);
      this.tagsError.set('載入分類失敗，請稍後再試');
    } finally {
      this.isTagsLoading.set(false);
    }
  }

  // 載入課程資料
  async loadCourses() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const params: any = {
        page: this.currentPage(),
        per_page: this.itemsPerPage(),
        sort: this.getSortValue(),
      };

      const mainCategoryId = this.getMainCategoryId();
      if (mainCategoryId) {
        params.main_category_id = mainCategoryId;
      }

      const subCategoryId = this.getSubCategoryId();
      if (subCategoryId) {
        params.sub_category_id = subCategoryId;
      }

      const response = await firstValueFrom(this.publicCoursesService.getApiCoursesPublic(params));

      if (response.data) {
        const transformedCourses = this.transformApiCoursesToCardData(response.data.courses || []);
        this.apiCourses.set(transformedCourses);
        this.totalResults.set(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('載入課程失敗:', error);
      this.error.set('載入課程失敗，請稍後再試');
    } finally {
      this.isLoading.set(false);
    }
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
    return sortMap[this.selectedFilterId] || 'newest';
  }

  // 獲取主分類 ID
  private getMainCategoryId(): number | undefined {
    const selectedId = this.selectedMainCategoryId();
    return selectedId === null ? undefined : selectedId;
  }

  // 獲取次分類 ID
  private getSubCategoryId(): number | undefined {
    return this.selectedSubCategoryId() || undefined;
  }



  // TrackBy 函式以提升效能
  // 使用 API 資料作為課程來源
  courses = computed(() => this.apiCourses());

  // 分頁變更處理
  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCourses();
  }

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
