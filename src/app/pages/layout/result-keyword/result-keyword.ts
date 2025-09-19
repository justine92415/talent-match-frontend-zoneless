import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Pagination from '@components/pagination/pagination';
import { CourseCard, CourseCardData } from '@components/course-card/course-card';
import { TmfIconEnum } from '@share/icon.enum';
import { MatIconModule } from '@angular/material/icon';
import { PublicCoursesService } from '@app/api/generated/public-courses/public-courses.service';
import { PublicCourseListSuccessResponse, GetApiCoursesPublicParams } from '@app/api/generated/talentMatchAPI.schemas';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'tmf-result-keyword',
  imports: [CommonModule, MatIconModule, Pagination, CourseCard],
  templateUrl: './result-keyword.html',
  styles: ``,
})
export default class ResultKeyword implements OnInit {
  private publicCoursesService = inject(PublicCoursesService);
  // 搜尋關鍵字
  searchKeyword = signal('');

  // 分頁相關 (使用 signals)
  currentPage = signal(1);
  totalResults = signal(0);
  itemsPerPage = signal(12);

  // API 狀態
  isLoading = signal(false);
  error = signal<string | null>(null);
  apiCourses = signal<CourseCardData[]>([]);

  // 計算總頁數 (使用 computed)
  totalPages = computed(() => {
    return Math.ceil(this.totalResults() / this.itemsPerPage());
  });

  // 使用 API 資料作為課程來源
  courses = computed(() => this.apiCourses());

  get TmfIcon() {
    return TmfIconEnum;
  }

  // Math getter for template
  get Math() {
    return Math;
  }

  async ngOnInit() {
    await this.loadCourses();
  }

  // 載入課程資料
  async loadCourses() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const params: any = {
        page: this.currentPage(),
        per_page: this.itemsPerPage(),
        sort: 'newest',
      };

      // 如果有搜尋關鍵字，加入搜尋參數
      if (this.searchKeyword()) {
        params.keyword = this.searchKeyword();
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
      description: '',
      imageSrc: course.image_url || 'assets/images/default-course.jpg',
      level: '一般班',
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

  // 頁碼變更處理
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCourses();
  }

  // 搜尋功能
  onSearch(keyword: string): void {
    this.searchKeyword.set(keyword);
    this.currentPage.set(1); // 重置頁碼
    this.loadCourses();
  }

  // TrackBy 函式以提升效能
  trackByCourse(index: number, course: CourseCardData): string {
    return course.id;
  }
}
