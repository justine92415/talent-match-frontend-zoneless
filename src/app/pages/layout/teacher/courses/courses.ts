import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Pagination from '../../../../../components/pagination/pagination';
import { Button } from "@components/button/button";
import { Table } from '../../../../../components/table/table';
import { CourseManagementService } from '@app/api/generated/course-management/course-management.service';
import { CourseStatusManagementService } from '@app/api/generated/course-status-management/course-status-management.service';
import { CourseBasicInfo } from '@app/api/generated/talentMatchAPI.schemas';

@Component({
  selector: 'tmf-courses',
  imports: [CommonModule, Pagination, Button, Table],
  templateUrl: './courses.html',
  styles: ``
})
export default class Courses implements OnInit {
  private router = inject(Router);
  private courseService = inject(CourseManagementService);
  private courseStatusService = inject(CourseStatusManagementService);

  // 分頁相關的信號
  currentPage = signal(1);
  totalResults = signal(0);
  itemsPerPage = signal(10);

  // 課程資料
  courses = signal<CourseBasicInfo[]>([]);

  // 載入狀態
  isLoading = signal(false);
  loadError = signal<string | null>(null);

  // 使用 computed 來處理課程資料的衍生狀態
  coursesWithActions = computed(() => {
    return this.courses().map(course => ({
      ...course,
      imageUrl: course.main_image || null,
      isPublished: course.status === 'published',
      canToggle: this.canToggleStatus(course),
      actions: this.calculateCourseActions(course)
    }));
  });

  // 判斷是否可以切換狀態 (私有方法，只在 computed 中使用)
  private canToggleStatus(course: CourseBasicInfo): boolean {
    // 只有草稿且審核通過的課程可以發布
    if (course.status === 'draft' && course.application_status === 'approved') {
      return true;
    }
    // 已發布的課程可以下架
    if (course.status === 'published') {
      return true;
    }
    return false;
  }

  // 計算課程可用操作 (私有方法，只在 computed 中使用)
  private calculateCourseActions(course: CourseBasicInfo): string[] {
    const actions = ['view'];

    // 只有草稿狀態才可以編輯和刪除
    if (course.status === 'draft') {
      actions.push('edit', 'delete');
    }

    return actions;
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  // 載入課程列表
  private loadCourses(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    const params = {
      page: this.currentPage(),
      limit: this.itemsPerPage()
    };

    this.courseService.getApiCourses(params).subscribe({
      next: (response) => {
        console.log('API 回應:', response);
        if (response.data) {
          console.log('課程資料:', response.data.courses);
          this.courses.set(response.data.courses || []);
          this.totalResults.set(response.data.total || 0);
        }
        this.isLoading.set(false);
        console.log('載入完成，課程數量:', this.courses().length);
      },
      error: (error) => {
        console.error('載入課程列表失敗:', error);
        this.loadError.set('載入課程列表失敗，請稍後再試。');
        this.isLoading.set(false);
      }
    });
  }

  // 處理分頁變更事件
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCourses();
  }

  // 前往新增課程頁面
  goToCreateCourse(): void {
    this.router.navigate(['/dashboard/teacher/courses/create']);
  }

  // 前往課程檢視頁面
  viewCourse(courseId: number): void {
    this.router.navigate(['/dashboard/teacher/courses/view', courseId]);
  }

  // 前往課程編輯頁面
  editCourse(courseId: number): void {
    this.router.navigate(['/dashboard/teacher/courses/edit', courseId]);
  }

  // 切換課程發布狀態 (上/下架)
  toggleCourseStatus(course: CourseBasicInfo): void {
    // 檢查是否可以切換狀態
    if (!this.canToggleStatus(course)) {
      return; // 如果不能切換，直接返回
    }

    if (course.status === 'published') {
      // 已發布的課程 -> 封存
      this.archiveCourse(course.id!);
    } else if (course.status === 'draft' && course.application_status === 'approved') {
      // 草稿且已核准 -> 發布
      this.publishCourse(course.id!);
    }
  }

  // 發布課程
  private publishCourse(courseId: number): void {
    if (confirm('確定要發布這個課程嗎？發布後學生就可以瀏覽和購買。')) {
      this.courseStatusService.postApiCoursesIdPublish(courseId).subscribe({
        next: () => {
          alert('課程發布成功！');
          this.loadCourses(); // 重新載入課程列表
        },
        error: (error) => {
          console.error('發布課程失敗:', error);

          let errorMessage = '發布課程失敗，請稍後再試。';
          if (error.status === 400) {
            errorMessage = '課程狀態不符合發布條件，請確認課程已通過審核。';
          } else if (error.status === 403) {
            errorMessage = '您沒有權限發布此課程。';
          } else if (error.status === 404) {
            errorMessage = '課程不存在。';
          } else if (error.status >= 500) {
            errorMessage = '伺服器暫時無法處理請求，請稍後再試。';
          }

          alert(errorMessage);
        }
      });
    }
  }

  // 封存課程
  private archiveCourse(courseId: number): void {
    if (confirm('確定要下架這個課程嗎？下架後學生將無法瀏覽和購買。')) {
      this.courseStatusService.postApiCoursesIdArchive(courseId).subscribe({
        next: () => {
          alert('課程下架成功！');
          this.loadCourses(); // 重新載入課程列表
        },
        error: (error) => {
          console.error('下架課程失敗:', error);

          let errorMessage = '下架課程失敗，請稍後再試。';
          if (error.status === 400) {
            errorMessage = '課程狀態不符合下架條件。';
          } else if (error.status === 403) {
            errorMessage = '您沒有權限下架此課程。';
          } else if (error.status === 404) {
            errorMessage = '課程不存在。';
          } else if (error.status >= 500) {
            errorMessage = '伺服器暫時無法處理請求，請稍後再試。';
          }

          alert(errorMessage);
        }
      });
    }
  }

  // 刪除課程
  deleteCourse(courseId: number): void {
    if (confirm('確定要刪除這個課程嗎？刪除後無法恢復。')) {
      this.courseService.deleteApiCoursesId(courseId).subscribe({
        next: () => {
          alert('課程刪除成功！');
          this.loadCourses(); // 重新載入課程列表
        },
        error: (error) => {
          console.error('刪除課程失敗:', error);

          let errorMessage = '刪除課程失敗，請稍後再試。';
          if (error.status === 403) {
            errorMessage = '您沒有權限刪除此課程。';
          } else if (error.status === 404) {
            errorMessage = '課程不存在或已被刪除。';
          } else if (error.status === 400) {
            errorMessage = '無法刪除已發布的課程，請先將課程設為草稿。';
          }

          alert(errorMessage);
        }
      });
    }
  }
}
