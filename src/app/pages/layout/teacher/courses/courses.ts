import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Pagination from '../../../../../components/pagination/pagination';
import { Button } from "@components/button/button";
import { Table } from '../../../../../components/table/table';

@Component({
  selector: 'tmf-courses',
  imports: [CommonModule, Pagination, Button, Table],
  templateUrl: './courses.html',
  styles: ``
})
export default class Courses {
  private router = inject(Router);

  // 分頁相關的信號
  currentPage = signal(1);
  totalResults = signal(3); // 目前有 3 個課程項目
  itemsPerPage = signal(10); // 每頁顯示 10 個項目

  // 課程資料
  courses = signal([
    {
      id: 1,
      name: '從零開始學吉他：初學者入門指南',
      image: '/assets/images/guitar-course.png',
      tags: ['新手班', '音樂', '吉他'],
      isPublished: true,
      actions: ['view']
    },
    {
      id: 2,
      name: '築夢廚藝：美食烹飪工作坊',
      image: '/assets/images/reel_cooking_1.jpg',
      tags: ['高手班', '烹飪料理'],
      isPublished: false,
      actions: ['view', 'edit', 'delete']
    },
    {
      id: 3,
      name: '琴韻魔法：鋼琴彈奏交響指南',
      image: null,
      tags: ['大師班', '音樂', '鋼琴'],
      isPublished: false,
      actions: ['view', 'edit', 'delete']
    }
  ]);

  // 處理分頁變更事件
  onPageChange(page: number): void {
    this.currentPage.set(page);
    // 這裡可以加入 API 呼叫來載入新的課程資料
    console.log('切換到頁面:', page);
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

  // 刪除課程
  deleteCourse(courseId: number): void {
    if (confirm('確定要刪除這個課程嗎？刪除後無法恢復。')) {
      // TODO: 呼叫 API 刪除課程
      console.log('刪除課程:', courseId);
      alert('課程刪除成功！(開發中)');

      // 重新載入課程列表
      // this.loadCourses();
    }
  }
}
