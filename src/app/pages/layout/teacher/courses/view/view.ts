import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Button } from '@components/button/button';

// 模擬課程資料介面
interface CourseData {
  id: number;
  name: string;
  content: string;
  main_category: string;
  sub_categories: string[];
  city: string;
  survey_url?: string;
  purchase_message?: string;
  image_url?: string;
  course_plans: {
    id: number;
    quantity: number;
    price: number;
  }[];
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'tmf-course-view',
  imports: [
    DatePipe,
    MatIcon,
    Button
  ],
  templateUrl: './view.html',
  styles: ``
})
export default class CourseView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  courseId = signal<string>('');
  courseData = signal<CourseData | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    // 取得路由參數中的課程 ID
    this.courseId.set(this.route.snapshot.params['id']);
    this.loadCourseData();
  }

  private loadCourseData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // TODO: 實際應該呼叫 API 取得課程資料
    // 這裡使用模擬資料
    setTimeout(() => {
      const courseId = parseInt(this.courseId());

      // 模擬資料
      const mockCourse: CourseData = {
        id: courseId,
        name: '從零開始學吉他：初學者入門指南',
        content: '這是一個專為初學者設計的吉他課程，包含基礎樂理、和弦練習、彈奏技巧等內容。透過系統性的教學方式，讓學員能夠在短時間內掌握吉他演奏的基本技能。',
        main_category: '藝術才藝',
        sub_categories: ['音樂', '吉他'],
        city: '台北市',
        survey_url: 'https://forms.google.com/example',
        purchase_message: '感謝購買本課程！請準備您的吉他，我們即將開始精彩的音樂之旅。',
        image_url: '/assets/images/guitar-course.png',
        course_plans: [
          { id: 1, quantity: 1, price: 800 },
          { id: 2, quantity: 4, price: 3000 },
          { id: 3, quantity: 8, price: 5600 }
        ],
        status: 'published',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-20T14:45:00Z'
      };

      this.courseData.set(mockCourse);
      this.isLoading.set(false);
    }, 1000);
  }

  // 取得狀態顯示文字
  getStatusText(): string {
    const status = this.courseData()?.status;
    switch (status) {
      case 'published':
        return '已上架';
      case 'draft':
        return '草稿';
      case 'archived':
        return '已下架';
      default:
        return '未知狀態';
    }
  }

  // 取得狀態樣式類別
  getStatusClass(): string {
    const status = this.courseData()?.status;
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-grey-100 text-grey-800';
      default:
        return 'bg-grey-100 text-grey-800';
    }
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