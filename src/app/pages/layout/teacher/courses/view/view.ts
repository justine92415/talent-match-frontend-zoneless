import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Dialog } from '@angular/cdk/dialog';
import { Button } from '@components/button/button';
import { CourseManagementService } from '@app/api/generated/course-management/course-management.service';
import { CourseStatusPipe } from '@app/pipes/course-status.pipe';
import { CourseStatusClassPipe } from '@app/pipes/course-status-class.pipe';
import { CategoryPipe, SubcategoryPipe } from '../../../../../../shared/pipes';
import { VideoBasicInfo } from '@app/api/generated/talentMatchAPI.schemas';
import { VideoCard, VideoCardData } from '@components/video-card/video-card';
import { VideoViewerDialogComponent } from '@components/dialogs/video-viewer/video-viewer-dialog';

// 課程資料介面
interface CourseData {
  id: number;
  name: string;
  content: string;
  main_category_id: number;
  sub_category_id: number;
  city: string;
  district?: string;
  address?: string;
  survey_url?: string;
  purchase_message?: string;
  main_image?: string;
  price_options: {
    id?: number;
    quantity: number;
    price: number;
  }[];
  status: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'tmf-course-view',
  imports: [
    DatePipe,
    MatIcon,
    Button,
    CourseStatusPipe,
    CourseStatusClassPipe,
    CategoryPipe,
    SubcategoryPipe,
    VideoCard
  ],
  templateUrl: './view.html',
  styles: ``
})
export default class CourseView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(Dialog);
  private courseService = inject(CourseManagementService);

  courseId = signal<number | null>(null);
  courseData = signal<CourseData | null>(null);
  selectedVideos = signal<VideoBasicInfo[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // 計算是否可以編輯課程
  canEdit = computed(() => {
    const status = this.courseData()?.status;
    return status === 'draft' || status === 'rejected';
  });

  ngOnInit() {
    // 取得路由參數中的課程 ID
    const courseIdParam = this.route.snapshot.params['id'];
    const courseId = parseInt(courseIdParam);
    if (!isNaN(courseId)) {
      this.courseId.set(courseId);
      this.loadCourseData();
    } else {
      this.error.set('無效的課程 ID');
      this.isLoading.set(false);
    }
  }

  private loadCourseData(): void {
    const courseId = this.courseId();
    if (!courseId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.courseService.getApiCoursesId(courseId).subscribe({
      next: (response) => {
        console.log('課程檢視資料:', response);
        if (response.data && response.data.course) {
          this.transformAndSetCourseData(response.data.course, response.data.course.price_options || [], response.data.course.selected_videos || []);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('載入課程資料失敗:', error);
        let errorMessage = '載入課程資料失敗';
        if (error.status === 404) {
          errorMessage = '課程不存在';
        } else if (error.status === 403) {
          errorMessage = '您沒有權限查看此課程';
        }
        this.error.set(errorMessage);
        this.isLoading.set(false);
      }
    });
  }

  // 轉換 API 資料為檢視用格式
  private transformAndSetCourseData(courseData: any, priceOptions: any[], selectedVideos: any[]): void {
    const transformedData: CourseData = {
      id: courseData.id,
      name: courseData.name,
      content: courseData.content,
      main_category_id: courseData.main_category_id,
      sub_category_id: courseData.sub_category_id,
      city: courseData.city || '',
      district: courseData.district,
      address: courseData.address,
      survey_url: courseData.survey_url,
      purchase_message: courseData.purchase_message,
      main_image: courseData.main_image,
      price_options: priceOptions.map(option => ({
        id: option.id,
        quantity: option.quantity,
        price: option.price
      })),
      status: courseData.status,
      created_at: courseData.created_at,
      updated_at: courseData.updated_at
    };

    this.courseData.set(transformedData);

    // 載入選擇的短影音
    if (selectedVideos && Array.isArray(selectedVideos)) {
      const videos: VideoBasicInfo[] = selectedVideos
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((item: any) => item.video_info)
        .filter((video: any) => video !== null && video !== undefined);
      this.selectedVideos.set(videos);
      console.log('載入課程短影音:', videos);
    }
  }


  // 將 VideoBasicInfo 轉換為 VideoCardData
  convertToVideoCardData(video: VideoBasicInfo): VideoCardData {
    return {
      id: video.id?.toString() || '',
      tag: video.category || '未分類',
      description: video.intro || video.name || '',
      videoSrc: video.url || undefined,
      isPlaying: false
    };
  }

  // 開啟影片預覽
  openVideoViewer(video: VideoBasicInfo, index: number): void {
    const videoCards = this.selectedVideos().map(v => this.convertToVideoCardData(v));

    this.dialog.open(VideoViewerDialogComponent, {
      data: {
        videos: videoCards,
        initialIndex: index
      },
      panelClass: 'video-viewer-dialog-panel',
      backdropClass: 'video-viewer-backdrop',
      hasBackdrop: true,
      disableClose: false
    });
  }

  // 前往編輯頁面
  goToEdit(): void {
    this.router.navigate(['/dashboard/teacher/courses/edit', this.courseId()]);
  }

  // 返回課程列表
  goBack(): void {
    this.router.navigate(['/dashboard/teacher/courses']);
  }

  // 重新載入資料
  refresh(): void {
    this.loadCourseData();
  }
}