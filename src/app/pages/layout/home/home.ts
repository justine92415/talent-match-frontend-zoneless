import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { Dialog } from '@angular/cdk/dialog';
import { DecimalPipe } from '@angular/common';
import { SectionTitle } from '@components/section-title/section-title';
import { VideoCard, VideoCardData } from '@components/video-card/video-card';
import { VideoViewerDialogComponent, VideoViewerDialogData } from '@components/dialogs/video-viewer/video-viewer-dialog';
import { CourseCard, CourseCardData } from '@components/course-card/course-card';
import { ReviewCard, ReviewData } from '@components/review-card/review-card';
import { SwiperWapper, SwiperConfig } from '@components/swiper-wapper/swiper-wapper';
import { TmfIconEnum } from '@share/icon.enum';
import { StarRating } from "@components/star-rating/star-rating";
import { InputGlobalSearch, GlobalSearchValue } from "@components/form/input-global-search/input-global-search";
import { HomeService } from '@app/api/generated/home/home.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'tmf-home',
  imports: [SectionTitle, VideoCard, CourseCard, ReviewCard, SwiperWapper, MatIcon, StarRating, ReactiveFormsModule, InputGlobalSearch, DecimalPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.html',
  styles: ``
})
export default class Home {
  fb = inject(FormBuilder);
  dialog = inject(Dialog);
  router = inject(Router);
  homeApi = inject(HomeService);

  // Form for global search testing
  searchForm = this.fb.group({
    globalSearch: this.fb.control<GlobalSearchValue>({ type: 'course', query: '' })
  });
  // Swiper configurations
  videoSwiperConfig: SwiperConfig = {
    slidesPerView: 4,
    spaceBetween: 24,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    }
  };

  courseSwiperConfig: SwiperConfig = {
    slidesPerView: 4,
    spaceBetween: 24,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 16,
      },
      640: {
        slidesPerView: 1.2,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
      1536: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
    }
  };

  // Math object for template use
  Math = Math;

  // rxResource for recommended courses
  recommendedCoursesResource = rxResource({
    stream: () => this.homeApi.getApiHomeRecommendedCourses().pipe(
      map(response => response.data?.courses?.map(course => ({
        id: String(course.courseId),
        title: course.title || '',
        description: course.description || '',
        imageSrc: course.coverImage || '/assets/images/course-placeholder.jpg',
        level: '新手班', // Level not provided by API
        category: `${course.mainCategory?.name || ''}${course.subCategory?.name ? `－${course.subCategory.name}` : ''}`,
        price: course.priceRange?.min || 0,
        teacher: {
          name: course.teacher?.name || '',
          avatar: course.teacher?.avatar || '/assets/images/default-avatar.jpg'
        },
        rating: {
          score: course.rating?.average || 0,
          count: course.rating?.count || 0
        }
      } as CourseCardData)) || [])
    )
  });

  // rxResource for short videos
  shortVideosResource = rxResource({
    stream: () => this.homeApi.getApiHomeShortVideos().pipe(
      map(response => response.data?.videos?.map(video => ({
        id: String(video.videoId),
        tag: video.mainCategory?.name || '',
        description: video.title || '',
        videoSrc: video.videoUrl || '',
        duration: video.duration || 0,
        isPlaying: false
      } as VideoCardData)) || [])
    )
  });

  // rxResource for reviews summary
  reviewsSummaryResource = rxResource({
    stream: () => this.homeApi.getApiHomeReviewsSummary().pipe(
      map(response => ({
        averageRating: response.data?.overallRating || 0,
        reviews: response.data?.featuredReviews?.map(review => ({
          id: String(review.reviewId),
          name: review.student?.name || '',
          date: review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : '',
          title: review.title || '',
          content: review.content || '',
          rating: 5, // Rating not provided in FeaturedReviewItem
          avatar: review.student?.avatar || '/assets/images/default-avatar.jpg'
        } as ReviewData)) || []
      }))
    )
  });

  get TmfIcon() {
    return TmfIconEnum;
  }

  onGlobalSearch(searchValue: GlobalSearchValue) {
    console.log('Global search submitted:', searchValue);
    // Handle search logic here
  }

  onBecomeTeacherClick() {
    this.router.navigate(['/teacher-apply']);
  }

  onVideoClick(video: VideoCardData) {
    const videos = this.shortVideosResource.value();
    if (!videos) return;

    const videoIndex = videos.findIndex(v => v.id === video.id);
    if (videoIndex >= 0) {
      const dialogData: VideoViewerDialogData = {
        videos: videos,
        initialIndex: videoIndex
      };

      this.dialog.open(VideoViewerDialogComponent, {
        data: dialogData,
        panelClass: 'video-viewer-dialog-panel',
        hasBackdrop: true,
        disableClose: false,
        autoFocus: false,
        restoreFocus: false
      });
    }
  }

  navigateToCourseDetail(courseId: string) {
    this.router.navigate(['/course-detail', courseId]);
  }
}
