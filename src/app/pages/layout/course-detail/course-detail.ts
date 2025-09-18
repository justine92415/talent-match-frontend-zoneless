import { NgClass } from '@angular/common';
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CourseDetailSectionTitle } from '@components/course-detail-section-title/course-detail-section-title';
import { Button } from '@components/button/button';
import { StarRating } from '@components/star-rating/star-rating';
import { ReviewCard } from '@components/review-card/review-card';
import { WeeklyCalendar } from '@components/weekly-calendar/weekly-calendar';
import { InputPlan } from '@components/form/input-plan/input-plan';
import { PublicCoursesService } from '@app/api/generated/public-courses/public-courses.service';
import { PublicCourseDetailSuccessResponseData } from '@app/api/generated/talentMatchAPI.schemas';

@Component({
  selector: 'tmf-course-detail',
  imports: [
    MatIconModule,
    NgClass,
    RouterLink,
    ReactiveFormsModule,
    CourseDetailSectionTitle,
    Button,
    StarRating,
    ReviewCard,
    WeeklyCalendar,
    InputPlan,
  ],
  templateUrl: './course-detail.html',
  styles: ``,
})
export default class CourseDetail implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private publicCoursesService = inject(PublicCoursesService);

  // 課程詳情資料
  courseDetail = signal<PublicCourseDetailSuccessResponseData | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  course = computed(() => {
    return {
      ...this.courseDetail()?.course,
      rate: Number(this.courseDetail()?.course?.rate),
    };
  });
  teacher = computed(() => this.courseDetail()?.teacher);
  plans = computed(() => this.courseDetail()?.price_options || []);
  reviews = computed(() => this.courseDetail()?.recent_reviews || []);
  hasReviews = computed(() => (this.reviews().length ?? 0) > 0);
  work_experiences = computed(
    () => this.courseDetail()?.teacher_work_experiences || [],
  );
  educations = computed(
    () => this.courseDetail()?.teacher_learning_experiences || [],
  );
  certificates = computed(
    () => this.courseDetail()?.teacher_certificates || [],
  );
  // UI 狀態

  activeSection = signal('sectionA');
  formGroup = this.fb.group({
    purchase_item_id: this.fb.control(''),
  });

  ngOnInit() {
    this.loadCourseDetail();
  }

  loadCourseDetail() {
    // 從路由參數取得課程ID
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) {
      this.error.set('課程ID無效');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.publicCoursesService
      .getApiCoursesPublicId(Number(courseId))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.courseDetail.set(response.data);
          } else {
            this.error.set('找不到課程資料');
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('載入課程詳情失敗:', error);
          this.handleLoadError(error);
          this.isLoading.set(false);
        },
      });
  }

  private handleLoadError(error: any): void {
    let errorMessage = '載入課程詳情失敗，請稍後再試。';

    if (error.status === 404) {
      errorMessage = '課程不存在或已下架。';
    } else if (error.status === 403) {
      errorMessage = '此課程尚未公開。';
    } else if (error.status >= 500) {
      errorMessage = '伺服器暫時無法處理請求，請稍後再試。';
    }

    this.error.set(errorMessage);
  }

  navigateToTeacherDetail() {}
  addFavorite() {}
  copyToClipboard() {}
  openAllReviews() {}
  openTeacherDetailPage() {}
  addToCart() {}
  openSurvey() {}
}
