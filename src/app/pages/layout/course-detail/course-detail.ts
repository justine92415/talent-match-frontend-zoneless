import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, signal, OnInit, OnDestroy, AfterViewInit, computed, ViewChildren, QueryList, ElementRef, viewChildren, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { CourseDetailSectionTitle } from '@components/course-detail-section-title/course-detail-section-title';
import { Button } from '@components/button/button';
import { StarRating } from '@components/star-rating/star-rating';
import { ReviewCard } from '@components/review-card/review-card';
import { WeeklyCalendar } from '@components/weekly-calendar/weekly-calendar';
import { InputPlan } from '@components/form/input-plan/input-plan';
import { PublicCoursesService } from '@app/api/generated/public-courses/public-courses.service';
import { PublicCourseDetailSuccessResponseData } from '@app/api/generated/talentMatchAPI.schemas';
import { CartService } from '@app/services/cart.service';
import { VideoCard, VideoCardData } from '@components/video-card/video-card';
import { VideoViewerDialogComponent } from '@components/dialogs/video-viewer/video-viewer-dialog';

@Component({
  selector: 'tmf-course-detail',
  imports: [
    MatIconModule,
    NgClass,
    DatePipe,
    ReactiveFormsModule,
    CourseDetailSectionTitle,
    Button,
    StarRating,
    ReviewCard,
    WeeklyCalendar,
    InputPlan,
    VideoCard,
  ],
  templateUrl: './course-detail.html',
  styles: `
    .active {
      color: #F97316;
      font-weight: 600;
      border-bottom: 2px solid #F97316;
    }
  `,
})
export default class CourseDetail implements OnInit, OnDestroy {
  sections = viewChildren<ElementRef<HTMLElement>>('section');
  // @ViewChildren('section') sections!: QueryList<ElementRef>;
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private dialog = inject(Dialog);
  private publicCoursesService = inject(PublicCoursesService);
  private cartService = inject(CartService);

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
  schedule = computed(() => this.courseDetail()?.schedule || []);
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
  // 短影音
  videos = computed(() => this.courseDetail()?.videos || []);
  // 將影片轉換為 VideoCardData 格式
  videoCards = computed(() =>
    this.videos().map(video => ({
      id: video.id.toString(),
      tag: video.category || '',
      description: video.intro,
      videoSrc: video.url,
      isPlaying: false
    } as VideoCardData))
  );
  // UI 狀態
  activeSection = signal('sectionA');
  isAddingToCart = signal<boolean>(false);

  private observer: IntersectionObserver | null = null;

  formGroup = this.fb.group({
    purchase_item_id: this.fb.control(''),
  });

  // 計算選中的價格方案 ID
  selectedPriceOptionId = computed(() => {
    const value = this.formGroup.controls.purchase_item_id.value;
    return value ? Number(value) : null;
  });

  constructor() {
    effect(() => {
      console.log('signal' , this.sections().length);
      if (this.sections().length > 0) {
        this.setupIntersectionObserver();
      }
    });
  }

  ngOnInit() {
    this.loadCourseDetail();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // 設置 IntersectionObserver 監聽區塊
  setupIntersectionObserver() {
    console.log('setupIntersectionObserver called');

    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          console.log('Setting activeSection to:', sectionId);
          this.activeSection.set(sectionId);
        }
      });
    }, options);

    this.sections().forEach((section) => {
      this.observer?.observe(section.nativeElement);
    });
  }

  // 點擊導航滾動到對應區塊
  scrollToSection(sectionId: string) {
    console.log('scrollToSection clicked:', sectionId);
    // 立即更新 activeSection
    this.activeSection.set(sectionId);
    console.log('activeSection set to:', this.activeSection());

    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 100; // 導航列高度 + 間距
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.error('Element not found:', sectionId);
    }
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

  // 加入購物車
  addToCart(): void {
    const courseId = this.course()?.id;
    // 直接從表單控制項獲取最新值
    const priceOptionValue = this.formGroup.controls.purchase_item_id.value;
    const priceOptionId = priceOptionValue ? Number(priceOptionValue) : null;

    if (!courseId || !priceOptionId) {
      alert('請選擇價格方案');
      return;
    }

    this.isAddingToCart.set(true);

    this.cartService.addToCart(courseId, priceOptionId).subscribe({
      next: () => {
        alert('已加入購物車！');
        this.isAddingToCart.set(false);
      },
      error: (error) => {
        console.error('加入購物車失敗:', error);
        alert('加入購物車失敗，請稍後再試');
        this.isAddingToCart.set(false);
      }
    });
  }

  // 立即購買
  buyNow(): void {
    const courseId = this.course()?.id;
    // 直接從表單控制項獲取最新值
    const priceOptionValue = this.formGroup.controls.purchase_item_id.value;
    const priceOptionId = priceOptionValue ? Number(priceOptionValue) : null;

    if (!courseId || !priceOptionId) {
      alert('請選擇價格方案');
      return;
    }

    this.isAddingToCart.set(true);

    this.cartService.buyNow(courseId, priceOptionId).subscribe({
      next: () => {
        // buyNow 會自動導向購物車頁面，不需要額外處理
      },
      error: (error) => {
        console.error('立即購買失敗:', error);
        alert('立即購買失敗，請稍後再試');
        this.isAddingToCart.set(false);
      }
    });
  }

  openSurvey() {}

  // 開啟影片預覽
  openVideoViewer(index: number): void {
    this.dialog.open(VideoViewerDialogComponent, {
      data: {
        videos: this.videoCards(),
        initialIndex: index
      },
      panelClass: 'video-viewer-dialog-panel',
      backdropClass: 'video-viewer-backdrop',
      hasBackdrop: true,
      disableClose: false
    });
  }
}
