import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Pagination from '@components/pagination/pagination';
import { CourseCard, CourseCardData } from '@components/course-card/course-card';
import { TmfIconEnum } from '@share/icon.enum';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tmf-result-keyword',
  imports: [CommonModule, MatIconModule, Pagination, CourseCard],
  templateUrl: './result-keyword.html',
  styles: ``,
})
export default class ResultKeyword {
  // 分頁相關 (使用 signals)
  currentPage = signal(1);
  totalResults = signal(120);
  itemsPerPage = signal(12);

  // 模擬課程資料
  courses: CourseCardData[] = [
    {
      id: '1',
      title: '細針縫夢：手作裁縫入門',
      description: '無論您是對裁縫有濃厚興趣，還是想要學習一技之長，這門課程都將是您的理想選擇。',
      imageSrc: 'assets/images/reel_art_1.jpg',
      level: '新手班',
      category: '手工藝－裁縫',
      price: 770,
      teacher: {
        name: '王太郎',
        avatar: 'assets/images/teacher-avatar-1.jpg'
      },
      rating: {
        score: 4.5,
        count: 12
      }
    },
    {
      id: '2',
      title: '饗宴廚藝：美食烹飪工作坊',
      description: '我是文文，你們的烹飪大師！',
      imageSrc: 'assets/images/reel_cooking_1.jpg',
      level: '高手班',
      category: '烹飪－西式',
      price: 1200,
      teacher: {
        name: '文文',
        avatar: 'assets/images/teacher-avatar-2.jpg'
      },
      rating: {
        score: 4.0,
        count: 333
      }
    }
  ];

  get TmfIcon() {
    return TmfIconEnum;
  }

  // Math getter for template
  get Math() {
    return Math;
  }

  // 頁碼變更處理
  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  // TrackBy 函式以提升效能
  trackByCourse(index: number, course: CourseCardData): string {
    return course.id;
  }
}
